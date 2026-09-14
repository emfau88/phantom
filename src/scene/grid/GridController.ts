import {
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  type Texture,
} from 'three';
import type { Project, ProjectFilter } from '../../data/projects';
import { projectsForFilter } from '../../data/projects';
import { screenToSource, warpedRect, type ScreenRect } from './distortion';
import { createProjectTileTexture, type ProjectTileTexture } from './tileTexture';
import { createGridMotionState, type GridMotionController } from './motionState';

interface TileUniforms extends Record<string, { value: unknown }> {
  uMap: { value: Texture };
  uHover: { value: number };
  uOpacity: { value: number };
  uPointer: { value: Vector2 };
}

interface TileRecord {
  mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  uniforms: TileUniforms;
  projectIndex: number;
  col: number;
  row: number;
}

export interface TileSelection {
  project: Project;
  projectIndex: number;
  origin: ScreenRect;
}

export interface GridCallbacks {
  onSelect: (selection: TileSelection) => void;
  onActiveIndex: (index: number) => void;
  onHoverProject: (project: Project | null) => void;
  onInteraction: () => void;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHover;
  uniform float uOpacity;
  uniform vec2 uPointer;
  varying vec2 vUv;

  void main() {
    vec4 sampleColor = texture2D(uMap, vUv);
    float luminance = dot(sampleColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    float saturation = 0.88 + uHover * 0.12;
    vec3 color = mix(vec3(luminance), sampleColor.rgb, saturation);
    color *= 0.77 + uHover * 0.28;
    float glow = smoothstep(0.76, 0.0, distance(vUv, uPointer));
    color += vec3(0.055 * glow * uHover);
    gl_FragColor = vec4(color, sampleColor.a * uOpacity);
  }
`;

const POOL_COLUMNS = 11;
const POOL_ROWS = 9;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function damp(current: number, target: number, lambda: number, delta: number): number {
  return target + (current - target) * Math.exp(-lambda * delta);
}

function createMaterial(texture: Texture): { material: ShaderMaterial; uniforms: TileUniforms } {
  const uniforms: TileUniforms = {
    uMap: { value: texture },
    uHover: { value: 0 },
    uOpacity: { value: 1 },
    uPointer: { value: new Vector2(0.5, 0.5) },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });
  return { material, uniforms };
}

export class GridController extends Group implements GridMotionController {
  readonly motionState = createGridMotionState();
  readonly dragZoom = this.motionState.dragProgress;

  private readonly projects: Project[];
  private readonly callbacks: GridCallbacks;
  private readonly geometry = new PlaneGeometry(1, 1);
  private readonly tileTextures: ProjectTileTexture[];
  private readonly tiles: TileRecord[] = [];
  private filteredIndices: number[];
  private domElement: HTMLCanvasElement | null = null;
  private width = 1;
  private height = 1;
  private cellWidth = 240;
  private cellHeight = 270;
  private offsetX = 0;
  private offsetY = 0;
  private velocityX = 0.1;
  private velocityY = 0.035;
  private pointerX = -9999;
  private pointerY = -9999;
  private smoothPointerX = 0;
  private smoothPointerY = 0;
  private pressed = false;
  private dragging = false;
  private interactionLocked = false;
  private pointerId: number | null = null;
  private pressX = 0;
  private pressY = 0;
  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;
  private hoveredCell: { col: number; row: number; projectIndex: number } | null = null;
  private lastHoverProjectIndex = -1;
  private lastActiveIndex = -1;
  private filterOpacity = 1;
  private disposed = false;

  constructor(projects: Project[], callbacks: GridCallbacks) {
    super();
    this.projects = projects;
    this.callbacks = callbacks;
    this.filteredIndices = projects.map((_, index) => index);
    this.tileTextures = projects.map(createProjectTileTexture);

    for (let index = 0; index < POOL_COLUMNS * POOL_ROWS; index += 1) {
      const { material, uniforms } = createMaterial(this.tileTextures[0].texture);
      const mesh = new Mesh(this.geometry, material);
      mesh.frustumCulled = false;
      this.tiles.push({ mesh, uniforms, projectIndex: -1, col: 0, row: 0 });
      this.add(mesh);
    }
  }

  connect(domElement: HTMLCanvasElement): void {
    if (this.domElement === domElement) return;
    this.disconnect();
    this.domElement = domElement;
    domElement.style.touchAction = 'none';
    domElement.addEventListener('pointerdown', this.onPointerDown);
    domElement.addEventListener('pointermove', this.onPointerMove);
    domElement.addEventListener('pointerup', this.onPointerUp);
    domElement.addEventListener('pointercancel', this.onPointerCancel);
    domElement.addEventListener('pointerleave', this.onPointerLeave);
    domElement.addEventListener('wheel', this.onWheel, { passive: false });
  }

  disconnect(): void {
    if (!this.domElement) return;
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.domElement.removeEventListener('pointercancel', this.onPointerCancel);
    this.domElement.removeEventListener('pointerleave', this.onPointerLeave);
    this.domElement.removeEventListener('wheel', this.onWheel);
    this.domElement = null;
  }

  setFilter(filter: ProjectFilter): void {
    const filteredProjects = projectsForFilter(filter);
    this.filteredIndices = filteredProjects.map((project) => this.projects.indexOf(project));
    this.filterOpacity = 0.12;
    this.hoveredCell = null;
    this.velocityX *= 0.12;
    this.velocityY *= 0.12;
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.cellWidth = clamp(width * 0.154, width < 600 ? 168 : 192, 272);
    this.cellHeight = clamp(height * 0.305, height < 600 ? 190 : 220, 292);
    if (this.smoothPointerX === 0 && this.smoothPointerY === 0) {
      this.smoothPointerX = width / 2;
      this.smoothPointerY = height / 2;
    }
  }

  update(delta: number, reducedMotion: boolean): void {
    if (this.disposed) return;
    const frameDelta = Math.min(delta, 0.05);
    const targetPointerX = this.pointerX < -1000 ? this.width / 2 : this.pointerX;
    const targetPointerY = this.pointerY < -1000 ? this.height / 2 : this.pointerY;
    this.smoothPointerX = damp(this.smoothPointerX, targetPointerX, 4.2, frameDelta);
    this.smoothPointerY = damp(this.smoothPointerY, targetPointerY, 4.2, frameDelta);
    this.dragZoom.value = damp(
      this.dragZoom.value,
      this.pressed && !reducedMotion ? 1 : 0,
      this.pressed ? 8 : 5,
      frameDelta,
    );
    const velocityTarget = reducedMotion
      ? 0
      : clamp(Math.hypot(this.velocityX, this.velocityY) / 18, 0, 1);
    this.motionState.velocity.value = damp(
      this.motionState.velocity.value,
      velocityTarget,
      this.pressed ? 10 : 5,
      frameDelta,
    );
    this.filterOpacity = damp(this.filterOpacity, 1, 8, frameDelta);

    if (!this.pressed && !reducedMotion) {
      this.offsetX += this.velocityX * frameDelta * 60;
      this.offsetY += this.velocityY * frameDelta * 60;
      const decay = Math.pow(0.91, frameDelta * 60);
      this.velocityX *= decay;
      this.velocityY *= decay;
      if (Math.abs(this.velocityX) < 0.004) this.velocityX = 0;
      if (Math.abs(this.velocityY) < 0.004) this.velocityY = 0;
    }

    this.layoutTiles(frameDelta, reducedMotion);
  }

  getDebugState(): Record<string, number | boolean> {
    return {
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      velocityProgress: this.motionState.velocity.value,
      transitionProgress: this.motionState.transitionProgress.value,
      interactionLocked: this.interactionLocked,
      pressed: this.pressed,
      dragging: this.dragging,
      tilePoolSize: this.tiles.length,
      filteredCount: this.filteredIndices.length,
      dragZoom: this.dragZoom.value,
    };
  }

  prepareTransition(): void {
    this.pressed = false;
    this.dragging = false;
    this.pointerId = null;
    this.velocityX = 0;
    this.velocityY = 0;
    this.hoveredCell = null;
    this.interactionLocked = true;
  }

  setTransitionProgress(progress: number): void {
    this.motionState.transitionProgress.value = clamp(progress, 0, 1);
  }

  resumeAfterTransition(): void {
    this.motionState.transitionProgress.value = 0;
    this.interactionLocked = false;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.disconnect();
    this.geometry.dispose();
    for (const tile of this.tiles) tile.mesh.material.dispose();
    for (const tileTexture of this.tileTextures) tileTexture.dispose();
  }

  private layoutTiles(delta: number, reducedMotion: boolean): void {
    const ambientX = reducedMotion ? 0 : (this.smoothPointerX / this.width - 0.5) * this.width * 0.0045;
    const ambientY = reducedMotion ? 0 : (this.smoothPointerY / this.height - 0.5) * this.height * 0.0045;
    const effectiveOffsetX = this.offsetX + ambientX;
    const effectiveOffsetY = this.offsetY + ambientY;
    const baseCol = Math.floor(effectiveOffsetX / this.cellWidth);
    const baseRow = Math.floor(effectiveOffsetY / this.cellHeight);
    const hit = this.hitTest(this.pointerX, this.pointerY, effectiveOffsetX, effectiveOffsetY);
    this.hoveredCell = !this.pressed ? hit : null;

    const startCol = baseCol - Math.floor(POOL_COLUMNS / 2);
    const startRow = baseRow - Math.floor(POOL_ROWS / 2);
    let tileIndex = 0;

    for (let rowOffset = 0; rowOffset < POOL_ROWS; rowOffset += 1) {
      for (let colOffset = 0; colOffset < POOL_COLUMNS; colOffset += 1) {
        const tile = this.tiles[tileIndex];
        tileIndex += 1;
        const col = startCol + colOffset;
        const row = startRow + rowOffset;
        const projectIndex = this.projectIndexForCell(col, row);
        const x = col * this.cellWidth - effectiveOffsetX;
        const y = -(row * this.cellHeight - effectiveOffsetY);
        tile.mesh.position.set(x, y, 0);
        tile.mesh.scale.set(this.cellWidth, this.cellHeight, 1);
        tile.mesh.visible = (
          Math.abs(x) <= this.width / 2 + this.cellWidth * 1.5
          && Math.abs(y) <= this.height / 2 + this.cellHeight * 1.5
        );
        tile.col = col;
        tile.row = row;

        if (tile.projectIndex !== projectIndex) {
          tile.projectIndex = projectIndex;
          tile.uniforms.uMap.value = this.tileTextures[projectIndex].texture;
        }
        if (tile.mesh.visible) this.tileTextures[projectIndex].ensureMedia();

        const isHovered = this.hoveredCell?.col === col && this.hoveredCell?.row === row;
        tile.uniforms.uHover.value = damp(
          tile.uniforms.uHover.value,
          isHovered ? 1 : 0,
          isHovered ? 13 : 7,
          delta,
        );
        tile.uniforms.uOpacity.value = this.filterOpacity;
        if (isHovered) {
          const source = screenToSource(
            this.pointerX,
            this.pointerY,
            this.width,
            this.height,
            this.dragZoom.value,
          );
          const cellLeft = this.width / 2 + x - this.cellWidth / 2;
          const cellTop = this.height / 2 - y - this.cellHeight / 2;
          tile.uniforms.uPointer.value.set(
            clamp((source.x - cellLeft) / this.cellWidth, 0, 1),
            1 - clamp((source.y - cellTop) / this.cellHeight, 0, 1),
          );
        }
      }
    }

    const hoverIndex = this.hoveredCell?.projectIndex ?? -1;
    if (hoverIndex !== this.lastHoverProjectIndex) {
      this.lastHoverProjectIndex = hoverIndex;
      this.callbacks.onHoverProject(hoverIndex >= 0 ? this.projects[hoverIndex] : null);
    }

    const activeCell = this.hitTest(
      this.width / 2,
      this.height / 2,
      effectiveOffsetX,
      effectiveOffsetY,
    );
    const activeLocalIndex = activeCell
      ? this.filteredIndices.indexOf(activeCell.projectIndex)
      : 0;
    if (activeLocalIndex !== this.lastActiveIndex) {
      this.lastActiveIndex = activeLocalIndex;
      this.callbacks.onActiveIndex(Math.max(0, activeLocalIndex));
    }
  }

  private projectIndexForCell(col: number, row: number): number {
    const hash = mod(col * 5 + row * 7, this.filteredIndices.length);
    return this.filteredIndices[hash] ?? 0;
  }

  private hitTest(
    clientX: number,
    clientY: number,
    effectiveOffsetX = this.offsetX,
    effectiveOffsetY = this.offsetY,
  ): { col: number; row: number; projectIndex: number } | null {
    if (clientX < 0 || clientY < 0 || clientX > this.width || clientY > this.height) return null;
    const source = screenToSource(clientX, clientY, this.width, this.height, this.dragZoom.value);
    const worldX = source.x - this.width / 2 + effectiveOffsetX;
    const worldY = source.y - this.height / 2 + effectiveOffsetY;
    const col = Math.round(worldX / this.cellWidth);
    const row = Math.round(worldY / this.cellHeight);
    return { col, row, projectIndex: this.projectIndexForCell(col, row) };
  }

  private selectionForHit(hit: { col: number; row: number; projectIndex: number }): TileSelection {
    const ambientX = (this.smoothPointerX / this.width - 0.5) * this.width * 0.0045;
    const ambientY = (this.smoothPointerY / this.height - 0.5) * this.height * 0.0045;
    const cellLeft = this.width / 2 + hit.col * this.cellWidth - (this.offsetX + ambientX) - this.cellWidth / 2;
    const cellTop = this.height / 2 + hit.row * this.cellHeight - (this.offsetY + ambientY) - this.cellHeight / 2;
    const mediaRect = {
      x: cellLeft + this.cellWidth * 0.03,
      y: cellTop + this.cellHeight * 0.124,
      width: this.cellWidth * 0.94,
      height: this.cellHeight * 0.755,
    };
    return {
      project: this.projects[hit.projectIndex],
      projectIndex: hit.projectIndex,
      origin: warpedRect(mediaRect, this.width, this.height, this.dragZoom.value),
    };
  }

  private localPointer(event: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = this.domElement?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !this.domElement || this.interactionLocked) return;
    const pointer = this.localPointer(event);
    this.pointerX = this.pressX = this.lastX = pointer.x;
    this.pointerY = this.pressY = this.lastY = pointer.y;
    this.lastTime = performance.now();
    this.pressed = true;
    this.dragging = false;
    this.pointerId = event.pointerId;
    this.velocityX = 0;
    this.velocityY = 0;
    this.domElement.setPointerCapture(event.pointerId);
    this.callbacks.onInteraction();
    event.preventDefault();
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (this.interactionLocked) return;
    const pointer = this.localPointer(event);
    this.pointerX = pointer.x;
    this.pointerY = pointer.y;
    if (!this.pressed || event.pointerId !== this.pointerId) return;

    const now = performance.now();
    const elapsed = Math.max(8, now - this.lastTime);
    const deltaX = pointer.x - this.lastX;
    const deltaY = pointer.y - this.lastY;
    const threshold = event.pointerType === 'touch' ? 9 : 6;
    if (Math.hypot(pointer.x - this.pressX, pointer.y - this.pressY) > threshold) {
      this.dragging = true;
    }
    if (this.dragging) {
      this.offsetX -= deltaX;
      this.offsetY -= deltaY;
      const sampleX = -deltaX * (16 / elapsed);
      const sampleY = -deltaY * (16 / elapsed);
      this.velocityX += (sampleX - this.velocityX) * 0.78;
      this.velocityY += (sampleY - this.velocityY) * 0.78;
    }
    this.lastX = pointer.x;
    this.lastY = pointer.y;
    this.lastTime = now;
    event.preventDefault();
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (this.interactionLocked) return;
    if (!this.pressed || event.pointerId !== this.pointerId) return;
    const pointer = this.localPointer(event);
    this.pointerX = pointer.x;
    this.pointerY = pointer.y;
    const shouldSelect = !this.dragging;
    this.pressed = false;
    this.pointerId = null;
    if (this.domElement?.hasPointerCapture(event.pointerId)) {
      this.domElement.releasePointerCapture(event.pointerId);
    }
    if (shouldSelect) {
      const hit = this.hitTest(pointer.x, pointer.y);
      if (hit) this.callbacks.onSelect(this.selectionForHit(hit));
    }
    this.dragging = false;
  };

  private onPointerCancel = (): void => {
    this.pressed = false;
    this.dragging = false;
    this.pointerId = null;
  };

  private onPointerLeave = (): void => {
    if (this.pressed) return;
    this.pointerX = -9999;
    this.pointerY = -9999;
  };

  private onWheel = (event: WheelEvent): void => {
    if (this.interactionLocked) {
      event.preventDefault();
      return;
    }
    const deltaX = Math.abs(event.deltaX) > 2 ? event.deltaX : event.shiftKey ? event.deltaY : 0;
    const deltaY = event.shiftKey ? 0 : event.deltaY;
    this.offsetX += deltaX * 0.58;
    this.offsetY += deltaY * 0.58;
    this.velocityX += (deltaX * 0.032 - this.velocityX) * 0.7;
    this.velocityY += (deltaY * 0.032 - this.velocityY) * 0.7;
    this.callbacks.onInteraction();
    event.preventDefault();
  };
}

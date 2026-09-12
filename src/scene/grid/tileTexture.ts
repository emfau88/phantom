import {
  CanvasTexture,
  LinearFilter,
  SRGBColorSpace,
  type Texture,
} from 'three';
import type { Project } from '../../data/projects';

export interface ProjectTileTexture {
  texture: Texture;
  ensureMedia: () => void;
  dispose: () => void;
}

const WIDTH = 768;
const HEIGHT = 900;
const mediaQueue: Array<() => void> = [];
let activeLoads = 0;
const MAX_CONCURRENT_LOADS = 4;

function scheduleMediaLoad(load: () => void): void {
  mediaQueue.push(load);
  drainMediaQueue();
}

function drainMediaQueue(): void {
  while (activeLoads < MAX_CONCURRENT_LOADS && mediaQueue.length > 0) {
    const load = mediaQueue.shift();
    if (!load) return;
    activeLoads += 1;
    load();
  }
}

function finishMediaLoad(): void {
  activeLoads = Math.max(0, activeLoads - 1);
  drainMediaQueue();
}

function hashText(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const boxRatio = width / height;
  let drawWidth: number;
  let drawHeight: number;
  if (imageRatio > boxRatio) {
    drawHeight = height;
    drawWidth = drawHeight * imageRatio;
  } else {
    drawWidth = width;
    drawHeight = drawWidth / imageRatio;
  }
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawProceduralArt(
  context: CanvasRenderingContext2D,
  project: Project,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const seed = hashText(project.id);
  const hue = seed % 360;
  const gradient = context.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, `hsl(${hue} 13% 7%)`);
  gradient.addColorStop(0.58, `hsl(${(hue + 24) % 360} 18% 24%)`);
  gradient.addColorStop(1, `hsl(${(hue + 52) % 360} 12% 58%)`);
  context.fillStyle = gradient;
  context.fillRect(x, y, width, height);

  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.translate(x + width / 2, y + height / 2);
  context.strokeStyle = 'rgba(255,255,255,.12)';
  context.lineWidth = 2;
  for (let index = 0; index < 18; index += 1) {
    const radius = 34 + index * 24;
    context.beginPath();
    context.ellipse(0, 0, radius * 1.5, radius, (seed % 13) * 0.04, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
}

function paintTile(
  context: CanvasRenderingContext2D,
  project: Project,
  projectIndex: number,
  image?: HTMLImageElement,
): void {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#020202';
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.textBaseline = 'top';
  context.font = '700 25px Manrope, Arial, sans-serif';
  context.fillStyle = 'rgba(255,255,255,.76)';
  context.fillText(project.title.toUpperCase(), 30, 29, WIDTH - 180);
  context.textAlign = 'right';
  context.font = '650 21px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.fillStyle = 'rgba(255,255,255,.42)';
  context.fillText(String(project.year), WIDTH - 28, 32);
  context.textAlign = 'left';

  const media = { x: 23, y: 112, width: 722, height: 680 };
  if (image?.naturalWidth) {
    drawCover(context, image, media.x, media.y, media.width, media.height);
  } else {
    drawProceduralArt(context, project, media.x, media.y, media.width, media.height);
  }

  const shade = context.createLinearGradient(0, media.y, 0, media.y + media.height);
  shade.addColorStop(0, 'rgba(0,0,0,.02)');
  shade.addColorStop(0.68, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,.24)');
  context.fillStyle = shade;
  context.fillRect(media.x, media.y, media.width, media.height);
  context.strokeStyle = 'rgba(255,255,255,.12)';
  context.lineWidth = 2;
  context.strokeRect(media.x + 1, media.y + 1, media.width - 2, media.height - 2);

  if (project.premium) {
    context.font = '700 16px ui-monospace, SFMono-Regular, Menlo, monospace';
    context.fillStyle = 'rgba(255,255,255,.48)';
    context.fillText('●  REAL PROJECT', 30, 815);
  }

  context.font = '650 16px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.fillStyle = 'rgba(255,255,255,.42)';
  let tagX = 30;
  for (const tag of project.tags.slice(0, 3)) {
    const label = tag.toUpperCase();
    context.fillText(label, tagX, 857);
    tagX += context.measureText(label).width + 24;
  }
  context.textAlign = 'right';
  context.fillStyle = 'rgba(255,255,255,.35)';
  context.fillText(String(projectIndex + 1).padStart(2, '0'), WIDTH - 28, 857);
  context.textAlign = 'left';

  context.strokeStyle = 'rgba(255,255,255,.095)';
  context.lineWidth = 2;
  context.strokeRect(1, 1, WIDTH - 2, HEIGHT - 2);
}

export function createProjectTileTexture(
  project: Project,
  projectIndex: number,
): ProjectTileTexture {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Canvas2D is required to build static tile textures.');

  paintTile(context, project, projectIndex);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  let requested = false;
  let disposed = false;
  const ensureMedia = () => {
    if (requested || disposed || !project.media[0]) return;
    requested = true;
    scheduleMediaLoad(() => {
      if (disposed) { finishMediaLoad(); return; }
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.onload = () => {
        if (!disposed) {
          paintTile(context, project, projectIndex, image);
          texture.needsUpdate = true;
        }
        finishMediaLoad();
      };
      image.onerror = finishMediaLoad;
      image.src = project.media[0];
    });
  };

  return {
    texture,
    ensureMedia,
    dispose: () => {
      disposed = true;
      texture.dispose();
      canvas.width = 1;
      canvas.height = 1;
    },
  };
}

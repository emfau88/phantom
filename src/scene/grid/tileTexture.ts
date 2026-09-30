import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  type Texture,
} from 'three';
import type { Project } from '../../data/projects';
import { maxTileAnisotropy } from '../renderQuality';
import { secondaryLabel, tileTypography, titleLines } from './tileTypography';

export interface ProjectTileTexture {
  texture: Texture;
  caption: Texture;
  ensureMedia: () => void;
  dispose: () => void;
}

const WIDTH = 768;
const HEIGHT = 900;
export const tileTitleFontSize = tileTypography.titleSize;
// Keep the painted cover and the opening transition on the same bounds.
export const tileMedia = { x: 18, y: 18, width: 732, height: 620 } as const;
export const tileMediaBounds = {
  x: tileMedia.x / WIDTH,
  y: tileMedia.y / HEIGHT,
  width: tileMedia.width / WIDTH,
  height: tileMedia.height / HEIGHT,
};
// Category/year labels stay still while the underlying artwork responds to hover.
export const tileHoverBounds = {
  minX: tileMediaBounds.x,
  maxX: tileMediaBounds.x + tileMediaBounds.width,
  minY: 1 - (tileMediaBounds.y + tileMediaBounds.height),
  maxY: 1 - 100 / HEIGHT,
};
const categories = {
  GAME: { label: 'GAMES', color: '#d4b884' },
  APP: { label: 'APPS', color: '#94c7be' },
  WEB: { label: 'WEB', color: '#a2bce0' },
} as const;
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
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
  context.restore();
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
  image?: HTMLImageElement,
): void {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#020202';
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const media = tileMedia;
  if (image?.naturalWidth) {
    drawCover(context, image, media.x, media.y, media.width, media.height);
  } else {
    drawProceduralArt(context, project, media.x, media.y, media.width, media.height);
  }

  const shade = context.createLinearGradient(0, media.y, 0, media.y + media.height);
  shade.addColorStop(0, 'rgba(0,0,0,.2)');
  shade.addColorStop(0.68, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,.24)');
  context.fillStyle = shade;
  context.fillRect(media.x, media.y, media.width, media.height);
  context.strokeStyle = 'rgba(255,255,255,.12)';
  context.lineWidth = 2;
  context.strokeRect(media.x + 1, media.y + 1, media.width - 2, media.height - 2);

  const category = categories[project.category];
  context.fillStyle = category.color;
  context.fillRect(media.x, media.y, 5, media.height);
  context.fillStyle = 'rgba(5,5,5,.88)';
  context.fillRect(38, 38, 114, 40);
  context.fillRect(WIDTH - 127, 38, 89, 40);
  context.textBaseline = 'top';
  context.font = '650 21px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.fillStyle = category.color;
  context.fillText(category.label, 52, 48);
  context.fillStyle = '#c5c4bd';
  context.textAlign = 'right';
  context.fillText(String(project.year), WIDTH - 51, 48);
  context.textAlign = 'left';

  context.strokeStyle = 'rgba(255,255,255,.095)';
  context.lineWidth = 2;
  context.strokeRect(1, 1, WIDTH - 2, HEIGHT - 2);
}

function paintCaption(context: CanvasRenderingContext2D, project: Project, projectIndex: number): void {
  const { captionScale, captionTop, captionHeight, titleSize, titleLineHeight, secondarySize, secondaryY } = tileTypography;
  context.clearRect(0, 0, WIDTH * captionScale, captionHeight * captionScale);
  context.save();
  context.scale(captionScale, captionScale);
  context.textBaseline = 'top';
  context.font = `700 ${titleSize}px Manrope, Arial, sans-serif`;
  const lines = titleLines(project.title, (text) => context.measureText(text).width);
  const startY = 746 - (lines.length - 1) * titleLineHeight;
  context.fillStyle = '#ffffff';
  lines.forEach((line, index) => context.fillText(line, 30, startY + index * titleLineHeight - captionTop));
  context.font = `550 ${secondarySize}px Manrope, Arial, sans-serif`;
  context.fillStyle = '#d5d4ce';
  context.fillText(secondaryLabel(project), 30, secondaryY - captionTop);
  context.font = '500 26px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.textAlign = 'right';
  context.fillStyle = '#a8a79f';
  context.fillText(String(projectIndex + 1).padStart(2, '0'), WIDTH - 30, secondaryY + 6 - captionTop);
  context.restore();
}

export function createProjectTileTexture(
  project: Project,
  projectIndex: number,
  availableAnisotropy = 1,
): ProjectTileTexture {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Canvas2D is required to build static tile textures.');

  paintTile(context, project);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = Math.max(1, Math.min(maxTileAnisotropy, availableAnisotropy));
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  // High-resolution text-only layer: independent of artwork mipmaps/hover.
  const captionCanvas = document.createElement('canvas');
  captionCanvas.width = WIDTH * tileTypography.captionScale;
  captionCanvas.height = tileTypography.captionHeight * tileTypography.captionScale;
  const captionContext = captionCanvas.getContext('2d');
  if (!captionContext) throw new Error('Canvas2D is required for tile captions.');
  paintCaption(captionContext, project, projectIndex);
  const caption = new CanvasTexture(captionCanvas);
  caption.colorSpace = SRGBColorSpace;
  caption.minFilter = caption.magFilter = LinearFilter;
  caption.generateMipmaps = false;
  caption.needsUpdate = true;

  let requested = false;
  let disposed = false;
  void document.fonts.ready.then(() => {
    if (disposed) return;
    paintCaption(captionContext, project, projectIndex);
    caption.needsUpdate = true;
  });
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
          paintTile(context, project, image);
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
    caption,
    ensureMedia,
    dispose: () => {
      disposed = true;
      texture.dispose();
      caption.dispose();
      canvas.width = 1;
      canvas.height = 1;
      captionCanvas.width = captionCanvas.height = 1;
    },
  };
}

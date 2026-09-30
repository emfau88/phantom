import { describe, expect, it } from 'vitest';
import { tileHoverBounds, tileMedia, tileMediaBounds, tileTitleFontSize } from '../src/scene/grid/tileTexture';
import { secondaryLabel, tileTypography, titleLines } from '../src/scene/grid/tileTypography';
import { projects } from '../src/data/projects';

describe('project tile media layout', () => {
  it('enlarges titles without growing the existing image rectangle', () => {
    expect(tileTitleFontSize).toBe(80);
    expect(tileMedia).toEqual({ x: 18, y: 18, width: 732, height: 620 });
    expect(746 + tileTitleFontSize).toBeLessThan(tileTypography.secondaryY);
    expect(tileTypography.captionTop + tileTypography.captionHeight).toBe(900);
  });
  it('wraps names without losing spaces or squeezing individual words', () => {
    const measure = (text: string) => text.length * 10;
    expect(titleLines('More Than Wombat', measure, 100)).toEqual(['More Than', 'Wombat']);
    expect(titleLines('HEXFRONT', measure, 50)).toEqual(['HEXFR', 'ONT']);
    expect(titleLines('Strategy Galalaxy', measure, 200)).toEqual(['Strategy Galalaxy']);
  });
  it('keeps secondary lines short and preserves the complete project metadata', () => {
    expect(secondaryLabel(projects[0])).toBe('Game · HTML5');
    expect(secondaryLabel(projects[1])).toBe('App · Flutter');
    expect(projects[0].tags).toHaveLength(3);
    for (const project of projects) expect(secondaryLabel(project).length).toBeLessThan(30);
  });
  it('keeps transition geometry aligned with the painted cover', () => {
    expect(tileMediaBounds.x).toBe(tileMedia.x / 768);
    expect(tileMediaBounds.y).toBe(tileMedia.y / 900);
    expect(tileMediaBounds.width).toBe(tileMedia.width / 768);
    expect(tileMediaBounds.height).toBe(tileMedia.height / 900);
    expect(tileMediaBounds.x + tileMediaBounds.width).toBeLessThan(1);
    expect(tileMediaBounds.y + tileMediaBounds.height).toBeLessThan(1);
  });

  it('limits artwork hover to the cover below the category and year labels', () => {
    expect(tileHoverBounds.minY).toBeCloseTo(1 - (tileMedia.y + tileMedia.height) / 900);
    expect(tileHoverBounds.maxY).toBeLessThan(1 - 78 / 900);
    expect(tileHoverBounds.minY).toBeLessThan(tileHoverBounds.maxY);
    expect(tileHoverBounds.minX).toBe(tileMediaBounds.x);
    expect(tileHoverBounds.maxX).toBeCloseTo(tileMediaBounds.x + tileMediaBounds.width);
  });
});

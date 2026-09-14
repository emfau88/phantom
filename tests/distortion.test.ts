import { describe, expect, it } from 'vitest';
import { screenToSource, sourceToScreen, warpedRect } from '../src/scene/grid/distortion';

describe('distortion mapping', () => {
  it.each([
    [720, 450, 0], [90, 80, 0], [1350, 80, 0], [90, 820, 0], [1350, 820, 0],
    [720, 450, 1], [90, 80, 1], [1350, 820, 1], [360, 225, 0.5],
  ])('round trips visible coordinates at %d,%d with drag zoom %d', (x, y, dragZoom) => {
    const source = screenToSource(x, y, 1440, 900, dragZoom);
    const screen = sourceToScreen(source.x, source.y, 1440, 900, dragZoom);
    expect(screen.x).toBeCloseTo(x, 2);
    expect(screen.y).toBeCloseTo(y, 2);
  });

  it('produces finite postprocessed transition bounds', () => {
    const result = warpedRect({ x: 200, y: 180, width: 240, height: 210 }, 1440, 900);
    expect(result.width).toBeGreaterThan(8);
    expect(result.height).toBeGreaterThan(8);
    expect(Object.values(result).every(Number.isFinite)).toBe(true);
  });

  it.each([0, 0.5, 1])('keeps warped transition bounds finite at drag zoom %d', (dragZoom) => {
    const result = warpedRect({ x: 200, y: 180, width: 240, height: 210 }, 1440, 900, dragZoom);
    expect(Object.values(result).every(Number.isFinite)).toBe(true);
    expect(result.width).toBeGreaterThan(8);
    expect(result.height).toBeGreaterThan(8);
    expect(result.width).toBeLessThan(1440);
    expect(result.height).toBeLessThan(900);
  });
});

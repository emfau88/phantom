import { describe, expect, it } from 'vitest';
import { screenToSource, sourceToScreen, warpedRect } from '../src/scene/grid/distortion';

describe('distortion mapping', () => {
  it.each([
    [720, 450], [90, 80], [1350, 80], [90, 820], [1350, 820], [360, 225],
  ])('round trips visible coordinates at %d,%d', (x, y) => {
    const source = screenToSource(x, y, 1440, 900);
    const screen = sourceToScreen(source.x, source.y, 1440, 900);
    expect(screen.x).toBeCloseTo(x, 2);
    expect(screen.y).toBeCloseTo(y, 2);
  });

  it('produces finite postprocessed transition bounds', () => {
    const result = warpedRect({ x: 200, y: 180, width: 240, height: 210 }, 1440, 900);
    expect(result.width).toBeGreaterThan(8);
    expect(result.height).toBeGreaterThan(8);
    expect(Object.values(result).every(Number.isFinite)).toBe(true);
  });
});

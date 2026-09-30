import { expect, test } from '@playwright/test';
import { gridPixelRatio } from '../../src/scene/renderQuality';

test('navigation remains readable without reducing rendering quality', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const allocations: Array<{ width: number; height: number }> = [];
    Object.assign(window, { __renderAllocations: allocations });
    const original = WebGL2RenderingContext.prototype.texImage2D;
    WebGL2RenderingContext.prototype.texImage2D = function (this: WebGL2RenderingContext, ...args: unknown[]) {
      // Three's postprocessing buffers use RGBA16F; canvas tile uploads do not.
      if (args[2] === this.RGBA16F && typeof args[3] === 'number' && typeof args[4] === 'number') {
        allocations.push({ width: args[3], height: args[4] });
      }
      return Reflect.apply(original, this, args);
    } as typeof original;
  });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => Boolean(window.__EMFAU_GRID__))).toBe(true);
  await expect(page.locator('.interaction-hint')).not.toContainText('Composing');
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(1, 1);
  // Allow the initial visible image queue to settle before comparing screenshots.
  await page.waitForTimeout(4000);
  const quality = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.grid-canvas canvas')!;
    const button = document.querySelector('.site-nav button:not(.active)')!;
    const style = getComputedStyle(button);
    const activeStyle = getComputedStyle(document.querySelector('.site-nav button.active')!);
    const allocations = (window as unknown as {
      __renderAllocations: Array<{ width: number; height: number }>;
    }).__renderAllocations;
    return {
      viewport: { width: innerWidth, height: innerHeight },
      devicePixelRatio,
      drawingBuffer: { width: canvas.width, height: canvas.height },
      effectiveRatio: canvas.width / canvas.clientWidth,
      effectBuffers: allocations,
      button: { size: style.fontSize, weight: style.fontWeight, background: style.backgroundColor, color: style.color },
      activeButton: { background: activeStyle.backgroundColor, color: activeStyle.color },
      canvasFilter: getComputedStyle(canvas).filter,
    };
  });
  console.log(`${testInfo.project.name} rendering: ${JSON.stringify(quality)}`);
  await testInfo.attach('render-quality', { body: JSON.stringify(quality, null, 2), contentType: 'application/json' });
  expect(quality.effectBuffers.length).toBeGreaterThan(0);
  const lastBuffer = quality.effectBuffers.at(-1)!;
  expect(lastBuffer.width).toBe(quality.drawingBuffer.width);
  expect(lastBuffer.height).toBe(quality.drawingBuffer.height);
  expect(quality.effectiveRatio).toBeCloseTo(Math.max(gridPixelRatio[0], Math.min(quality.devicePixelRatio, gridPixelRatio[1])), 2);
  expect(quality.button.size).toBe('14px');
  expect(Number(quality.button.weight)).toBeGreaterThanOrEqual(600);
  expect(quality.button.background).toBe('rgba(8, 8, 8, 0.97)');
  expect(quality.activeButton.background).toBe('rgb(244, 243, 239)');
  expect(quality.activeButton.color).toBe('rgb(17, 17, 17)');
  expect(quality.canvasFilter).toBe('none');
  if (process.env.CAPTURE_REFINEMENT) {
    await page.screenshot({ path: `${process.env.CAPTURE_REFINEMENT}-${testInfo.project.name}.png` });
  }
});

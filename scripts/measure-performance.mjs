import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.waitForFunction(() => Boolean(window.__EMFAU_GRID__));
await page.waitForTimeout(1800);

const sampleFrames = (count) => page.evaluate((sampleCount) => new Promise((resolve) => {
  const intervals = [];
  let previous = performance.now();
  const tick = (now) => {
    intervals.push(now - previous);
    previous = now;
    if (intervals.length >= sampleCount) {
      const sorted = [...intervals].sort((a, b) => a - b);
      resolve({
        averageMs: intervals.reduce((sum, value) => sum + value, 0) / intervals.length,
        p95Ms: sorted[Math.floor(sorted.length * 0.95)],
        frames: intervals.length,
      });
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), count);

const idle = await sampleFrames(180);
const canvas = page.getByTestId('grid-canvas');
const box = await canvas.boundingBox();
if (!box) throw new Error('Grid canvas has no measurable bounds.');
const dragSample = sampleFrames(180);
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.68, box.y + box.height * 0.58, { steps: 24 });
await page.mouse.up();
const drag = await dragSample;
const runtime = await page.evaluate(() => {
  const canvasElement = document.querySelector('canvas');
  const state = window.__EMFAU_GRID__?.state();
  return {
    userAgent: navigator.userAgent,
    viewport: `${innerWidth}x${innerHeight}`,
    devicePixelRatio: devicePixelRatio,
    drawingBufferRatio: canvasElement instanceof HTMLCanvasElement
      ? canvasElement.width / canvasElement.clientWidth
      : null,
    tilePoolSize: state?.tilePoolSize ?? null,
    filteredCount: state?.filteredCount ?? null,
  };
});

process.stdout.write(`${JSON.stringify({ measuredAt: new Date().toISOString(), idle, drag, runtime }, null, 2)}\n`);
await browser.close();

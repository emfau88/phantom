import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const output = new URL('../docs/qa/production/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const viewports = [
  [1440, 900],
  [1920, 1080],
  [390, 844],
  [844, 390],
];

for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__EMFAU_GRID__));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: new URL(`home-${width}x${height}.png`, output).pathname.slice(1), fullPage: false });
  await page.close();
}

const casePage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await casePage.goto('http://127.0.0.1:4173/#project/hexfront', { waitUntil: 'networkidle' });
await casePage.getByTestId('hexfront-case-study').waitFor();
await casePage.screenshot({ path: new URL('hexfront-1440x900.png', output).pathname.slice(1), fullPage: false });
await casePage.close();
await browser.close();

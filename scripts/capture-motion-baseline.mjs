import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const output = new URL('../docs/qa/motion-baseline/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });

async function openPage(viewport, route = '/') {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
  return page;
}

const desktop = await openPage({ width: 1440, height: 900 });
await desktop.waitForFunction(() => Boolean(window.__EMFAU_GRID__));
await desktop.waitForTimeout(1800);
await desktop.screenshot({ path: new URL('grid-idle-desktop.png', output).pathname.slice(1) });
const desktopCanvas = desktop.getByTestId('grid-canvas');
const desktopBox = await desktopCanvas.boundingBox();
if (!desktopBox) throw new Error('Desktop grid canvas has no measurable bounds.');
await desktop.mouse.move(desktopBox.x + desktopBox.width * 0.5, desktopBox.y + desktopBox.height * 0.5);
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: new URL('grid-hover-desktop.png', output).pathname.slice(1) });
await desktop.mouse.down();
await desktop.mouse.move(desktopBox.x + desktopBox.width * 0.68, desktopBox.y + desktopBox.height * 0.58, { steps: 18 });
await desktop.waitForTimeout(140);
await desktop.screenshot({ path: new URL('grid-drag-desktop.png', output).pathname.slice(1) });
await desktop.mouse.up();
await desktop.close();

const mobile = await openPage({ width: 390, height: 844 });
await mobile.waitForFunction(() => Boolean(window.__EMFAU_GRID__));
await mobile.waitForTimeout(1800);
await mobile.screenshot({ path: new URL('grid-idle-mobile.png', output).pathname.slice(1) });
await mobile.close();

const caseDesktop = await openPage({ width: 1440, height: 900 }, '/#project/pocket-pier');
const desktopCaseStudy = caseDesktop.getByTestId('case-study-pocket-pier');
await desktopCaseStudy.waitFor();
await caseDesktop.waitForTimeout(500);
await caseDesktop.screenshot({ path: new URL('case-hero-desktop.png', output).pathname.slice(1) });
await desktopCaseStudy.evaluate((element) => { element.scrollTop = element.clientHeight * 0.82; });
await caseDesktop.waitForTimeout(300);
await caseDesktop.screenshot({ path: new URL('case-scroll-desktop.png', output).pathname.slice(1) });
await caseDesktop.close();

const caseMobile = await openPage({ width: 390, height: 844 }, '/#project/pocket-pier');
await caseMobile.getByTestId('case-study-pocket-pier').waitFor();
await caseMobile.waitForTimeout(500);
await caseMobile.screenshot({ path: new URL('case-hero-mobile.png', output).pathname.slice(1) });
await caseMobile.close();

await browser.close();

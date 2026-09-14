import { expect, test } from '@playwright/test';

test('loads the production grid and exposes all filters', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('grid-canvas')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => window.__EMFAU_GRID__?.state().transitionProgress)).toBe(0);
  const initialMotion = await page.evaluate(() => window.__EMFAU_GRID__?.state());
  expect(Number.isFinite(Number(initialMotion?.velocityProgress))).toBe(true);
  expect(initialMotion?.interactionLocked).toBe(false);
  await expect(page.getByRole('button', { name: /Filter/ })).toBeVisible();
  await page.getByRole('button', { name: /^Filter/ }).click();
  await page.getByRole('button', { name: /Games · 13/ }).click();
  await expect(page.getByText('/ 13')).toBeVisible();
  expect(errors).toEqual([]);
});

test('drag changes position without opening a project', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByTestId('grid-canvas');
  await expect.poll(() => page.evaluate(() => Boolean(window.__EMFAU_GRID__))).toBe(true);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const before = await page.evaluate(() => window.__EMFAU_GRID__?.state().offsetX);
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 120, box!.y + box!.height / 2 + 40, { steps: 5 });
  await page.waitForTimeout(140);
  const heldState = await page.evaluate(() => window.__EMFAU_GRID__?.state());
  expect(heldState?.pressed).toBe(true);
  expect(heldState?.dragging).toBe(true);
  expect(Number(heldState?.dragZoom)).toBeGreaterThan(0.35);
  expect(Number(heldState?.velocityProgress)).toBeGreaterThan(0.2);
  await page.mouse.up();
  const after = await page.evaluate(() => window.__EMFAU_GRID__?.state().offsetX);
  expect(after).not.toBe(before);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(async () => Number(await page.evaluate(() => window.__EMFAU_GRID__?.state().dragZoom))).toBeLessThan(0.08);
});

test('sub-threshold movement selects and records a finite morph origin', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Pointer threshold and morph geometry are covered once on desktop.');
  await page.goto('/');
  const canvas = page.getByTestId('grid-canvas');
  await expect.poll(() => page.evaluate(() => Boolean(window.__EMFAU_GRID__))).toBe(true);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const click = { x: box!.x + box!.width / 2 + 3, y: box!.y + box!.height / 2 + 2 };
  await page.mouse.move(click.x - 3, click.y - 2);
  await page.mouse.down();
  await page.mouse.move(click.x, click.y);
  await page.mouse.up();

  const morph = page.getByTestId('case-morph');
  await expect(morph).toBeVisible();
  const origin = await morph.evaluate((element) => ({
    left: Number(element.dataset.originLeft),
    top: Number(element.dataset.originTop),
    width: Number(element.dataset.originWidth),
    height: Number(element.dataset.originHeight),
  }));
  expect(Object.values(origin).every(Number.isFinite)).toBe(true);
  expect(origin.width).toBeGreaterThan(8);
  expect(origin.height).toBeGreaterThan(8);
  expect(click.x).toBeGreaterThan(origin.left);
  expect(click.x).toBeLessThan(origin.left + origin.width);
  expect(click.y).toBeGreaterThan(origin.top);
  expect(click.y).toBeLessThan(origin.top + origin.height);
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 4000 });
});

test('opens HEXFRONT, supports Escape and browser history', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByTestId('grid-canvas');
  await expect.poll(() => page.evaluate(() => Boolean(window.__EMFAU_GRID__))).toBe(true);
  const box = await canvas.boundingBox();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect.poll(async () => page.evaluate(() => window.__EMFAU_GRID__?.state().interactionLocked)).toBe(true);
  await expect.poll(async () => Number(await page.evaluate(() => window.__EMFAU_GRID__?.state().transitionProgress))).toBeGreaterThan(0.02);
  await expect(page.getByTestId('case-study-hexfront')).toBeVisible({ timeout: 4000 });
  await expect.poll(async () => Number(await page.evaluate(() => window.__EMFAU_GRID__?.state().transitionProgress))).toBeGreaterThan(0.99);
  await expect(page).toHaveURL(/#project\/hexfront/);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('case-morph')).toBeVisible();
  await expect(page.getByTestId('case-study-hexfront')).toHaveCount(0, { timeout: 4000 });
  await expect.poll(async () => Number(await page.evaluate(() => window.__EMFAU_GRID__?.state().transitionProgress))).toBeLessThan(0.01);
  await expect.poll(async () => page.evaluate(() => window.__EMFAU_GRID__?.state().interactionLocked)).toBe(false);
  await expect(page).not.toHaveURL(/#project/);
});

test('curved-edge picking follows the visible tile', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByTestId('grid-canvas');
  await expect.poll(() => page.evaluate(() => Boolean(window.__EMFAU_GRID__))).toBe(true);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 82, box!.y + box!.height * 0.56);
  await expect(page.locator('.interaction-hint')).not.toContainText('Drag anywhere');
  await page.mouse.click(box!.x + 82, box!.y + box!.height * 0.56);
  await expect(page).toHaveURL(/#project\/[a-z0-9-]+/);
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 4000 });
});

test('desktop hover eases in without changing the selected tile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Hover is a fine-pointer interaction.');
  await page.goto('/');
  const canvas = page.getByTestId('grid-canvas');
  await expect.poll(() => page.evaluate(() => Boolean(window.__EMFAU_GRID__))).toBe(true);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const point = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
  await page.mouse.move(point.x, point.y);
  await expect.poll(async () => Number(await page.evaluate(() => window.__EMFAU_GRID__?.state().hoverStrength))).toBeGreaterThan(0.8);
  await page.mouse.click(point.x, point.y);
  await expect(page.getByTestId('case-study-hexfront')).toBeVisible({ timeout: 4000 });
});

test('real touch drag moves the grid without selecting', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch input is covered by the mobile project.');
  await page.goto('/');
  const canvas = page.getByTestId('grid-canvas');
  await expect.poll(() => page.evaluate(() => Boolean(window.__EMFAU_GRID__))).toBe(true);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const before = await page.evaluate(() => window.__EMFAU_GRID__?.state().offsetX);
  const cdp = await page.context().newCDPSession(page);
  const start = { x: box!.x + box!.width * 0.48, y: box!.y + box!.height * 0.48 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + 90, y: start.y + 35 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const after = await page.evaluate(() => window.__EMFAU_GRID__?.state().offsetX);
  expect(after).not.toBe(before);
  await expect(page).not.toHaveURL(/#project/);
});

test('About, Contact and accessible project browser are keyboard reachable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'About' }).click();
  await expect(page.getByRole('heading', { name: 'Independent by design.' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: "Let's talk" }).click();
  await expect(page.getByRole('heading', { name: 'Build something worth noticing.' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Browse projects' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Selected work' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(20);
});

test('selected work index previews projects through the signature morph', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Browse all projects' }).click();
  const morph = page.getByTestId('signature-morph');
  await expect(morph).toBeVisible();
  await expect(morph).toHaveAttribute('data-project', 'hexfront');
  await expect(morph.getByTestId('signature-morph-canvas')).toBeVisible();
  await page.locator('.project-browser li button').nth(2).focus();
  await expect(morph).toHaveAttribute('data-project', 'pocket-pier');
  await expect(page.locator('.project-browser-preview')).toContainText('Pocket Pier');
  await page.getByRole('button', { name: 'Apps', exact: true }).click();
  await expect(morph).toHaveAttribute('data-project', 'mirror');
  await expect(page.getByRole('listitem')).toHaveCount(6);
});

test('signature morph honors reduced motion and the WebGL fallback', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Fallback variants are covered once on desktop.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Browse all projects' }).click();
  let morph = page.getByTestId('signature-morph');
  await expect(morph).toHaveAttribute('data-reduced-motion', 'true');
  await expect(morph.getByTestId('signature-morph-canvas')).toBeVisible();
  await page.locator('.project-browser li button').nth(2).focus();
  await expect(morph).toHaveAttribute('data-project', 'pocket-pier');

  await page.goto('/?fallback=1');
  await page.getByRole('button', { name: 'Browse all projects' }).click();
  morph = page.getByTestId('signature-morph');
  await expect(morph).toHaveAttribute('data-reduced-motion', 'true');
  await expect(morph.getByTestId('signature-morph-canvas')).toHaveCount(0);
  await expect(morph.locator('.signature-morph-fallback')).toBeVisible();
});

test('every project has a working premium direct-link case study', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The full catalogue route sweep runs once on desktop.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const projects = [
    ['hexfront', 'HEXFRONT'], ['mirror', 'Mirror'], ['pocket-pier', 'Pocket Pier'], ['zerohero', 'ZeroHero'],
    ['galalaxy', 'Galalaxy'], ['between', 'between'], ['rooster-rage', 'Rooster Rage'], ['mewtrack', 'MewTrack'],
    ['strategy-galalaxy', 'Strategy Galalaxy'], ['chargegeist', 'ChargeGeist'], ['kessel-krawall', 'Kessel-Krawall'],
    ['marschlegenden', 'MarschLegenden'], ['starlattice', 'Starlattice'], ['core-arena', 'Core Arena'],
    ['more-than-wombat', 'More Than Wombat'], ['cozy-bunker', 'Cozy Bunker'], ['terra-divina', 'Terra Divina'],
    ['merge-market', 'Merge Market'], ['voidline-farhaven', 'Voidline: Farhaven'], ['portfolio3', 'Portfolio3'],
  ];
  for (const [id, title] of projects) {
    await page.goto(`/#project/${id}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId(`case-study-${id}`)).toBeVisible({ timeout: 4000 });
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  }
});

test('premium case studies expose complete editorial content and navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#project/pocket-pier');
  const caseStudy = page.getByTestId('case-study-pocket-pier');
  await expect(caseStudy).toBeVisible();
  await expect(caseStudy.locator('.case-fact')).toHaveCount(5);
  await expect(caseStudy.locator('.case-pillars > article')).toHaveCount(3);
  await expect(caseStudy.getByTestId('media-gallery')).toBeVisible();
  await caseStudy.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(caseStudy.getByRole('button', { name: 'Back to grid' })).toBeVisible();
  await caseStudy.getByRole('button', { name: 'Back to grid' }).click();
  await expect(caseStudy).toHaveCount(0);
  await expect(page).not.toHaveURL(/#project/);
});

test('spatial media gallery supports controls, keyboard and pointer drag', async ({ page }, testInfo) => {
  await page.goto('/#project/pocket-pier');
  await expect(page.getByTestId('case-study-pocket-pier')).toBeVisible({ timeout: 7000 });
  const gallery = page.getByTestId('media-gallery');
  await expect(gallery).toBeVisible();
  const slides = gallery.locator('.media-gallery-slide');
  await expect(slides).toHaveCount(3);
  await expect(gallery.locator('header')).toContainText('01 — 03');
  await gallery.getByRole('button', { name: 'Next media' }).click();
  await expect(slides.nth(1)).toHaveAttribute('aria-current', 'true');
  const viewport = gallery.locator('.media-gallery-viewport');
  await viewport.focus();
  await page.keyboard.press('End');
  await expect(slides.nth(2)).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('Home');
  await expect(slides.nth(0)).toHaveAttribute('aria-current', 'true');
  if (testInfo.project.name !== 'desktop') return;
  await viewport.dispatchEvent('wheel', { deltaX: 900, deltaY: 0 });
  await expect(slides.nth(0)).not.toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('Home');
  await expect(slides.nth(0)).toHaveAttribute('aria-current', 'true');
  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.72, box!.y + box!.height * 0.45);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.28, box!.y + box!.height * 0.45, { steps: 8 });
  await page.mouse.up();
  await expect(slides.nth(0)).not.toHaveAttribute('aria-current', 'true');
});

test('case study motion reveals masked headings while body copy stays static', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Scroll choreography is sampled once on desktop.');
  await page.goto('/#project/pocket-pier');
  const caseStudy = page.getByTestId('case-study-pocket-pier');
  await expect(caseStudy).toHaveAttribute('data-motion', 'active');
  await expect(caseStudy).toHaveAttribute('data-motion-ready', 'true');

  const statement = caseStudy.locator('.case-statement');
  const statementWord = statement.locator('[data-case-word]').first();
  await expect.poll(async () => statementWord.evaluate((element) => (
    new DOMMatrix(getComputedStyle(element).transform).m42
  ))).toBeGreaterThan(5);

  await caseStudy.evaluate((element) => {
    const target = element.querySelector<HTMLElement>('.case-statement');
    if (target) element.scrollTop = target.offsetTop - element.clientHeight * 0.35;
  });
  await expect.poll(async () => Math.abs(await statementWord.evaluate((element) => (
    new DOMMatrix(getComputedStyle(element).transform).m42
  )))).toBeLessThan(0.5);

  const bodyCopy = caseStudy.locator('.case-copy');
  await expect(bodyCopy).toBeVisible();
  expect(await bodyCopy.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  expect(await bodyCopy.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
});

test('reduced motion opens a complete case study without a long morph', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const canvas = page.getByTestId('grid-canvas');
  await expect.poll(() => page.evaluate(() => Boolean(window.__EMFAU_GRID__))).toBe(true);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  const caseStudy = page.getByTestId('case-study-hexfront');
  await expect(caseStudy).toBeVisible({ timeout: 900 });
  await expect(page.getByTestId('case-morph')).toHaveCount(0);
  await expect(caseStudy.locator('.case-hero-copy')).toBeVisible();
  await expect(caseStudy.locator('.case-facts')).toBeVisible();
  await expect(caseStudy).toHaveAttribute('data-motion', 'reduced');
  await expect(caseStudy.getByTestId('media-gallery')).toHaveAttribute('data-reduced-motion', 'true');
  await expect(caseStudy).not.toHaveAttribute('data-motion-ready');
  expect(await caseStudy.locator('[data-case-word]').first().evaluate((element) => (
    getComputedStyle(element).transform
  ))).toBe('none');
});

test('functional DOM fallback retains filters and project access', async ({ page }) => {
  await page.goto('/?fallback=1');
  await expect(page.getByTestId('webgl-fallback')).toBeVisible();
  await page.getByRole('button', { name: /^Filter/ }).click();
  await page.getByRole('button', { name: /Apps · 06/ }).click();
  await expect(page.getByTestId('webgl-fallback').getByRole('button')).toHaveCount(6);
  await page.getByTestId('webgl-fallback').getByRole('button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

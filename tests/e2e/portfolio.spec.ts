import { expect, test } from '@playwright/test';

test('loads the production grid and exposes all filters', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('grid-canvas')).toBeVisible();
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
  await page.mouse.up();
  const after = await page.evaluate(() => window.__EMFAU_GRID__?.state().offsetX);
  expect(after).not.toBe(before);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('opens HEXFRONT, supports Escape and browser history', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByTestId('grid-canvas');
  await expect.poll(() => page.evaluate(() => Boolean(window.__EMFAU_GRID__))).toBe(true);
  const box = await canvas.boundingBox();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(page.getByTestId('hexfront-case-study')).toBeVisible({ timeout: 4000 });
  await expect(page).toHaveURL(/#project\/hexfront/);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('hexfront-case-study')).toHaveCount(0, { timeout: 4000 });
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
  await expect(page.getByRole('listitem')).toHaveCount(21);
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

import { expect, test } from '@playwright/test';

test('header uses a real animated WebGL cube and retains it across project views', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const logo = page.getByTestId('brand-cube');
  const canvas = page.getByTestId('brand-cube-canvas');
  await expect(logo).toHaveAttribute('data-ready', 'true');
  await expect(canvas).toBeVisible();
  await expect(logo.locator('img')).toBeHidden();
  const before = Number(await canvas.getAttribute('data-rotation'));
  await page.waitForTimeout(500);
  const after = Number(await canvas.getAttribute('data-rotation'));
  expect(after).toBeGreaterThan(before);
  await canvas.evaluate((element) => { element.dataset.retained = 'true'; });
  await page.getByRole('button', { name: 'About', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(canvas).toHaveAttribute('data-retained', 'true');
  await expect(canvas).toBeVisible();
  expect(errors).toEqual([]);
});

test('reduced motion keeps the real cube still and context loss exposes the fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const logo = page.getByTestId('brand-cube');
  const canvas = page.getByTestId('brand-cube-canvas');
  await expect(logo).toHaveAttribute('data-ready', 'true');
  // Compare the renderer, not a transparent screenshot over a loading grid.
  await page.waitForTimeout(300);
  const before = await canvas.getAttribute('data-rotation');
  const frames = await canvas.getAttribute('data-frames');
  await page.waitForTimeout(300);
  expect(await canvas.getAttribute('data-rotation')).toBe(before);
  expect(await canvas.getAttribute('data-frames')).toBe(frames);
  await canvas.evaluate((element) => element.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(logo).toHaveAttribute('data-ready', 'false');
  await expect(logo.locator('img')).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('header uses a sharp static SVG mark without a brand WebGL renderer', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const mark = page.getByTestId('brand-mark');
  const image = mark.getByRole('img', { name: 'EMFAU', exact: true });
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((element) => {
    const img = element as HTMLImageElement;
    return img.complete && img.naturalWidth > 0;
  })).toBe(true);
  await expect(image).toHaveAttribute('src', /\/brand\/emfau-mark\.svg$/);
  await expect(page.locator('.brand-lockup canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'About', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(image).toBeVisible();
  expect(errors).toEqual([]);
});

test('flat mark stays visible and static with reduced motion and without WebGL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?fallback=1');
  const image = page.getByRole('img', { name: 'EMFAU', exact: true });
  await expect(image).toBeVisible();
  await expect(page.locator('.brand-lockup canvas')).toHaveCount(0);
  const styles = await image.evaluate((element) => {
    const style = getComputedStyle(element);
    return { animation: style.animationName, transform: style.transform };
  });
  expect(styles).toEqual({ animation: 'none', transform: 'none' });
});

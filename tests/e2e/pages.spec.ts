import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

test.describe('estructura de las páginas', () => {
  for (const path of PAGES) {
    test(`${path} tiene exactamente un h1`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }

  test('la página 404 tiene un solo h1 y responde con estado 404', async ({ page }) => {
    const response = await page.goto('/esta-pagina-no-existe/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveCount(1);
  });
});

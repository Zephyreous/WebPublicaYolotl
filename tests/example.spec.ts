import { expect, test } from '@playwright/test';

// Ejemplo de Playwright. TODO: crear playwright.config.ts (webServer con `npm run preview`)
// e instalar navegadores con `npx playwright install`. Ejecutar con `npm run test:e2e`.
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';

test('la página de inicio tiene un solo h1 y el CTA de demo', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Pide una demo' }).first()).toBeVisible();
});

test('el menú móvil se abre y se cierra con el teclado', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(BASE_URL);
  const toggle = page.getByRole('button', { name: 'Menú' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

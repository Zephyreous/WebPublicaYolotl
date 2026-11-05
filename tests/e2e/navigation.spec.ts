import { expect, test } from '@playwright/test';

test.describe('navegación y tema', () => {
  test('el menú móvil se abre y se cierra con el teclado', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');

    const toggle = page.getByRole('button', { name: 'Menú' });
    const menu = page.getByRole('navigation', { name: 'Principal' });

    await expect(menu.getByRole('link', { name: 'Servicios' })).toBeHidden();

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('link', { name: 'Servicios' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await expect(menu.getByRole('link', { name: 'Servicios' })).toBeHidden();
  });

  test('el tema elegido persiste al navegar y al recargar', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /^Cambiar a modo/ });

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Navegación interna: el tema debe seguir aunque la página no lo fije por defecto.
    await page
      .getByRole('navigation', { name: 'Pie de página' })
      .getByRole('link', { name: 'Servicios' })
      .click();
    await page.waitForURL('**/servicios/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Y también después de una recarga completa (viene de localStorage).
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

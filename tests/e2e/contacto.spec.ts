import { expect, test } from '@playwright/test';

test.describe('formulario de contacto', () => {
  test('muestra los errores y enfoca el primer campo inválido', async ({ page }) => {
    await page.goto('/contacto/');

    await page.getByRole('button', { name: 'Enviar mensaje' }).click();

    await expect(page.getByText('Error: escribe tu nombre.')).toBeVisible();
    await expect(page.getByText('Revisa los campos marcados con error.')).toBeVisible();

    const nombre = page.locator('#nombre');
    await expect(nombre).toHaveAttribute('aria-invalid', 'true');
    await expect(nombre).toBeFocused();

    // Al corregir el campo, su error desaparece sin recargar.
    await nombre.fill('Ana');
    await expect(nombre).toHaveAttribute('aria-invalid', 'false');
    await expect(page.getByText('Error: escribe tu nombre.')).toBeHidden();
  });
});

test.describe('carrusel de casos', () => {
  test('sin casos publicados no quedan controles huérfanos', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/casos/');

    await expect(page.getByText('Pronto publicaremos nuestros casos de estudio.')).toBeVisible();
    await expect(page.locator('[data-carousel]')).toHaveCount(0);
    await expect(page.locator('[data-controls]')).toHaveCount(0);

    await page.getByRole('link', { name: 'Pide una demo' }).first().click();
    await page.waitForURL('**/contacto/');

    await page.goto('/');
    await expect(page.locator('[data-carousel]')).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});

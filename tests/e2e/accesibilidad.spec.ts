import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

const THEMES = ['light', 'dark'] as const;

test.describe('accesibilidad (axe-core)', () => {
  for (const path of PAGES) {
    test(`${path} sin violaciones graves en claro y oscuro`, async ({ page }) => {
      for (const theme of THEMES) {
        // El script de tema lee localStorage antes de pintar: así se fuerza el tema
        // sin depender de la preferencia del sistema.
        await page.addInitScript((value) => {
          window.localStorage.setItem('yolotl-theme', value);
        }, theme);

        await page.goto(path);
        await page.waitForLoadState('load');

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        const blocking = results.violations.filter(
          (violation) => violation.impact === 'serious' || violation.impact === 'critical',
        );

        expect(
          blocking.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            nodes: violation.nodes.map((node) => node.target.join(' ')),
          })),
          `${path} (tema ${theme})`,
        ).toEqual([]);
      }
    });
  }
});

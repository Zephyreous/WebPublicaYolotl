import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

/**
 * Pruebas end-to-end contra el sitio compilado.
 * `reuseExistingServer` evita recompilar en local si ya hay un `npm run preview` corriendo;
 * en CI siempre se construye y se sirve desde cero.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    // Con movimiento reducido el contenido no depende de animaciones de entrada:
    // las capturas y el análisis de accesibilidad ven la página final.
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // --ignore-lock fuerza un servidor en primer plano: Astro 7 manda `preview` a segundo plano
    // cuando detecta que lo lanza un agente, y entonces Playwright lo vería terminar de inmediato.
    command: 'npm run build && npm run preview -- --ignore-lock',
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});

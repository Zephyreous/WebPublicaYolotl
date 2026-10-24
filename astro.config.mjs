// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// TODO: confirmar dominio definitivo (debe coincidir con SITE.url en src/lib/site.ts).
export default defineConfig({
  site: 'https://yolotlabs.com',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});

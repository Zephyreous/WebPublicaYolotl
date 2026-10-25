// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// TODO: confirmar dominio definitivo (debe coincidir con SITE.url en src/lib/site.ts).
export default defineConfig({
  site: 'https://yolotlabs.com',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // Con <ClientRouter /> las páginas se precargan al pasar el cursor por un enlace.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  // Fuentes alojadas en el propio sitio: se descargan en el build y se sirven desde /_astro/fonts.
  // Así ningún visitante hace peticiones a Google (privacidad y CSP más estricta).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-jakarta',
      weights: [700, 800],
      styles: ['normal'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains',
      weights: [400],
      styles: ['normal'],
      fallbacks: ['monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Ningún script se incrusta en el HTML: así la CSP (vercel.json) solo necesita el hash
      // del script de tema de BaseLayout, que no cambia. Ver scripts/verify-csp.mjs.
      assetsInlineLimit: 0,
    },
  },
});

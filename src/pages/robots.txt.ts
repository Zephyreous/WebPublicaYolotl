import type { APIRoute } from 'astro';
import { SITE } from '@/lib/site';

/**
 * robots.txt generado en el build. La URL del sitemap sale de Astro.site (que a su vez viene de
 * SITE.url), así el dominio vive en un solo lugar y no hay que editar un archivo público a mano.
 */
export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL(SITE.url);
  const sitemap = new URL('sitemap-index.xml', base).toString();
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

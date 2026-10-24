/**
 * Datos centralizados del sitio. Es el único lugar con texto real de la empresa;
 * lo que falte se marca como 'TODO'.
 */
export const TODO = 'TODO';

export const SITE = {
  name: 'Yolotl Labs',
  // TODO: confirmar dominio definitivo (también en astro.config.mjs y public/robots.txt).
  domain: 'yolotlabs.com',
  url: 'https://yolotlabs.com',
  locale: 'es_MX',
  lang: 'es-MX',
  city: 'Puebla, Puebla, México',
  email: TODO,
  // Número en formato internacional sin signos, p. ej. 5212221234567.
  whatsapp: TODO,
  whatsappMessage: 'Hola, Yolotl Labs. Me gustaría pedir una demo.',
  social: {
    facebook: TODO,
    instagram: TODO,
    linkedin: TODO,
    github: TODO,
  },
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/producto-pos', label: 'Producto POS' },
  { href: '/casos', label: 'Casos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
] as const;

export function isConfigured(value: string): boolean {
  return value.trim() !== '' && value !== TODO;
}

/** Enlace wa.me construido desde SITE.whatsapp, o null si el número aún es TODO. */
export function whatsappUrl(message: string = SITE.whatsappMessage): string | null {
  const digits = SITE.whatsapp.replace(/\D/g, '');
  if (!isConfigured(SITE.whatsapp) || digits === '') return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

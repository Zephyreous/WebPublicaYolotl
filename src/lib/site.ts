/**
 * Datos centralizados del sitio. Es el único lugar con texto real de la empresa;
 * lo que falte se marca como 'TODO'.
 */
export const TODO = 'TODO';

export const SITE = {
  name: 'Yolotl Labs',
  // Dominio oficial. Es la única fuente: astro.config.mjs y /robots.txt lo leen.
  domain: 'yolotlabs.com',
  url: 'https://yolotlabs.com',
  locale: 'es_MX',
  lang: 'es-MX',
  city: 'Puebla, Puebla, México',
  // Temporal mientras se configura el buzón definitivo: aquí llegan los mensajes del formulario.
  email: 'cambiar@yolotlabs.com',
  // Número en formato internacional sin signos, p. ej. 5212221234567.
  whatsapp: '+52 998 616 0777',
  whatsappMessage: 'Hola, Yolotl Labs. Me gustaría recibir más información.',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios/', label: 'Servicios' },
  { href: '/productos/', label: 'Productos' },
  { href: '/casos/', label: 'Casos' },
  { href: '/nosotros/', label: 'Nosotros' },
  { href: '/contacto/', label: 'Contacto' },
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

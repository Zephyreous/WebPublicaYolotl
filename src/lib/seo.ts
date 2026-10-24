import { SITE } from './site';

export interface PageSeo {
  title: string;
  description: string;
}

/** Título y meta description únicos por página. */
export const PAGES = {
  inicio: {
    title: 'Software a la medida para negocios locales',
    description:
      'Yolotl Labs desarrolla software a la medida y puntos de venta para negocios locales en Puebla y todo México.',
  },
  servicios: {
    title: 'Servicios de desarrollo de software',
    description:
      'Desarrollo web, aplicaciones a la medida y automatización para pequeñas y medianas empresas.',
  },
  productoPos: {
    title: 'Punto de venta para talleres de motos',
    description:
      'POS para talleres de motos con punto de venta, control de inventario y un asistente con IA.',
  },
  casos: {
    title: 'Casos de estudio',
    description:
      'Proyectos de Yolotl Labs con negocios locales: el reto, la solución y los resultados.',
  },
  nosotros: {
    title: 'Nosotros',
    description: 'Conoce al equipo de Yolotl Labs, un estudio de software en Puebla, México.',
  },
  contacto: {
    title: 'Contacto y demo',
    description:
      'Escríbenos para pedir una demo o cotizar tu proyecto de software con Yolotl Labs.',
  },
  privacidad: {
    title: 'Aviso de privacidad',
    description: 'Aviso de privacidad de Yolotl Labs conforme a la LFPDPPP.',
  },
  terminos: {
    title: 'Términos y condiciones',
    description: 'Términos y condiciones de uso del sitio web de Yolotl Labs.',
  },
  gracias: {
    title: 'Mensaje enviado',
    description: 'Gracias por escribir a Yolotl Labs. Te responderemos pronto.',
  },
  noEncontrada: {
    title: 'Página no encontrada',
    description: 'La página que buscas no existe o cambió de dirección.',
  },
} satisfies Record<string, PageSeo>;

export type PageKey = keyof typeof PAGES;

export function formatTitle(title: string): string {
  return title === SITE.name ? title : `${title} | ${SITE.name}`;
}

export function getSeo(key: PageKey): PageSeo {
  const page = PAGES[key];
  return { title: formatTitle(page.title), description: page.description };
}

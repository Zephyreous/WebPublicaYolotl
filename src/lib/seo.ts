import { SITE } from './site';

export interface PageSeo {
  title: string;
  description: string;
}

/** Título y meta description únicos por página. */
export const PAGES = {
  inicio: {
    title: 'Soluciones a la medida para tu negocio',
    description:
      'Yolotl Labs crea soluciones tecnológicas a la medida para impulsar el crecimiento de tu empresa.',
  },
  servicios: {
    title: 'Servicios',
    description:
      'Sitios y aplicaciones web, soluciones a la medida y herramientas inteligentes: sistemas robustos y completamente funcionales.',
  },
  productos: {
    title: 'Productos',
    description: 'Productos digitales de Yolotl Labs para la operación de tu empresa.',
  },
  casos: {
    title: 'Casos de estudio',
    description: 'Proyectos de Yolotl Labs: el reto, la solución y los resultados.',
  },
  nosotros: {
    title: 'Nosotros',
    description:
      'Yolotl Labs es un estudio de ingeniería en Puebla, México, que resuelve problemas con soluciones de calidad y completamente funcionales.',
  },
  contacto: {
    title: 'Contacto',
    description: 'Escríbenos para cotizar tu proyecto con Yolotl Labs.',
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

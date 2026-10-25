import type { TransitionDirectionalAnimations } from 'astro';

/**
 * Transición entre páginas con <ClientRouter />: el contenido actual "se cae"
 * (acelera hacia abajo como con gravedad) y el nuevo cae en su lugar con un pequeño rebote.
 * Al volver atrás en el historial, el movimiento se invierte.
 * La página nueva espera a que la anterior casi desaparezca, para que no se lean las dos a la vez.
 * Los keyframes están en src/styles/global.css (page-fall-*, page-rise-*).
 */
const GRAVITY = 'cubic-bezier(0.55, 0, 1, 0.45)';
const SETTLE = 'cubic-bezier(0.34, 1.4, 0.64, 1)';

export const pageFall: TransitionDirectionalAnimations = {
  forwards: {
    old: { name: 'page-fall-out', duration: '320ms', easing: GRAVITY, fillMode: 'both' },
    new: {
      name: 'page-drop-in',
      duration: '480ms',
      delay: '240ms',
      easing: SETTLE,
      fillMode: 'both',
    },
  },
  backwards: {
    old: { name: 'page-rise-out', duration: '320ms', easing: GRAVITY, fillMode: 'both' },
    new: {
      name: 'page-lift-in',
      duration: '480ms',
      delay: '240ms',
      easing: SETTLE,
      fillMode: 'both',
    },
  },
};

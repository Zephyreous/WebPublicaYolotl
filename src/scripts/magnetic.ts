const PULL_X = 0.2;
const PULL_Y = 0.3;
const MAX_X = 8;
const MAX_Y = 6;

const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

/**
 * Botones "magnéticos": el CTA se desplaza unos píxeles hacia el cursor.
 * Solo con mouse (no en pantallas táctiles) y sin prefers-reduced-motion.
 * Escribe --mx/--my, que .btn-cta combina con su escala de hover.
 */
export function initMagnetic() {
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fineHover || reduceMotion) return;

  for (const button of document.querySelectorAll<HTMLElement>('.btn-cta:not([data-magnetic])')) {
    button.dataset.magnetic = '';

    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      button.style.setProperty('--mx', `${clamp(dx * PULL_X, MAX_X)}px`);
      button.style.setProperty('--my', `${clamp(dy * PULL_Y, MAX_Y)}px`);
    });

    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--mx', '0px');
      button.style.setProperty('--my', '0px');
    });
  }
}

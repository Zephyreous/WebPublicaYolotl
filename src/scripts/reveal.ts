import { pageReady } from './page-loader';

const STAGGER_MS = 90;
const MAX_DELAY_MS = 360;

/**
 * Aparición al hacer scroll. [data-reveal] acepta: (vacío) sube, "scale", "left", "right", "blur".
 * Los hermanos se escalonan solos según su posición, con un tope para que el último no tarde.
 * El CSS solo oculta estos elementos con JS activo y sin prefers-reduced-motion.
 */
export async function initReveal() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

  for (const el of targets) {
    const siblings = Array.from(el.parentElement?.children ?? []).filter((child) =>
      child.hasAttribute('data-reveal'),
    );
    const index = siblings.indexOf(el);
    if (siblings.length > 1 && index > 0) {
      el.style.setProperty('--reveal-delay', `${Math.min(index * STAGGER_MS, MAX_DELAY_MS)}ms`);
    }
  }

  // En la primera carga se espera a que se retire el loader, para que no se animen tapados.
  await pageReady;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
  );
  targets.forEach((el) => observer.observe(el));
}

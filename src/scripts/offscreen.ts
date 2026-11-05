/**
 * Pausa las animaciones decorativas (.bg-tech y .float) cuando quedan fuera de pantalla.
 * Se inicializa en cada `astro:page-load`; el observer anterior se desconecta para no retener
 * nodos de páginas ya visitadas con <ClientRouter />.
 */
const SELECTOR = '.bg-tech, .float';

let observer: IntersectionObserver | undefined;

export function initOffscreenAnimations() {
  observer?.disconnect();
  observer = undefined;

  if (!('IntersectionObserver' in window)) return;

  const targets = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  if (targets.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.removeAttribute('data-offscreen');
        else entry.target.setAttribute('data-offscreen', '');
      }
    },
    // Se reanuda un poco antes de entrar en pantalla para que el movimiento no "salte".
    { rootMargin: '100px' },
  );

  for (const target of targets) observer.observe(target);
}

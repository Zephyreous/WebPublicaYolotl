/**
 * Loader de la primera carga. Solo se ve si la página tarda más de ~300ms (el CSS
 * lo muestra con retraso); al estar lista se desvanece y arranca la entrada del hero.
 * Si este script no llegara a cargar, el CSS lo oculta solo a los 4s.
 */
const MAX_WAIT_MS = 3000;

let resolveReady: () => void;

/** Se resuelve cuando la página ya es visible (loader retirado). */
export const pageReady = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

function whenLoaded(): Promise<void> {
  const load =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) =>
          window.addEventListener('load', () => resolve(), { once: true }),
        );
  const fonts = document.fonts?.ready.then(() => undefined) ?? Promise.resolve();
  return Promise.all([load, fonts]).then(() => undefined);
}

export function initPageLoader() {
  const html = document.documentElement;
  const loader = document.querySelector<HTMLElement>('[data-page-loader]');

  const reveal = () => {
    html.classList.add('is-loaded');
    resolveReady();
    if (!loader) return;
    const opacity = Number(getComputedStyle(loader).opacity);
    // Si nunca llegó a mostrarse (carga rápida), se quita sin animación.
    if (opacity === 0) {
      loader.remove();
      return;
    }
    loader
      .animate([{ opacity }, { opacity: 0 }], {
        duration: 400,
        easing: 'ease-out',
        fill: 'forwards',
      })
      .finished.finally(() => loader.remove());
  };

  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT_MS));
  Promise.race([whenLoaded(), timeout]).then(reveal);
}

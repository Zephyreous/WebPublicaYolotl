/**
 * Integración con <ClientRouter />. Se registra una sola vez por sesión.
 * - Antes de cambiar de página, la nueva hereda clases y tema: Astro copia los atributos
 *   del <html> nuevo, que no tiene lo que agregó el script en línea al cargar.
 *   Al navegar se conserva el tema actual (data-default-theme solo aplica al entrar directo a
 *   una página): cambiar de color a mitad de la transición se ve brusco.
 * - Si la página tarda en llegar (>250ms), se muestra la barra de progreso superior.
 */
export function initNavigation() {
  const html = document.documentElement;
  let progressTimer: number | undefined;

  document.addEventListener('astro:before-preparation', () => {
    window.clearTimeout(progressTimer);
    progressTimer = window.setTimeout(() => html.classList.add('is-navigating'), 250);
  });

  document.addEventListener('astro:after-preparation', () => {
    window.clearTimeout(progressTimer);
    html.classList.remove('is-navigating');
  });

  document.addEventListener('astro:before-swap', (event) => {
    const next = event.newDocument.documentElement;
    // is-client-nav: la página llegó por navegación interna (sin loader ni entrada del hero).
    next.classList.add('js', 'is-loaded', 'is-client-nav');
    next.dataset.theme = html.dataset.theme ?? 'dark';
    event.newDocument.querySelector('[data-page-loader]')?.remove();
  });
}

// Tailwind v4 lee este archivo mediante `@config` en src/styles/global.css.
// Los valores reales viven como variables CSS en global.css; aquí solo se mapean a clases.

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        yolotl: {
          navy: 'var(--yolotl-navy)',
          'navy-surface': 'var(--yolotl-navy-surface)',
          teal: 'var(--yolotl-teal)',
          'teal-hover': 'var(--yolotl-teal-hover)',
          orange: 'var(--yolotl-orange)',
          'orange-hover': 'var(--yolotl-orange-hover)',
          ivory: 'var(--yolotl-ivory)',
          slate: 'var(--yolotl-slate)',
          'slate-dark': 'var(--yolotl-slate-dark)',
          'slate-light': 'var(--yolotl-slate-light)',
        },
        // Colores semánticos: cambian según data-theme (ver global.css).
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        fg: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        'accent-large': 'var(--color-accent-large)',
        border: 'var(--color-border)',
        cta: 'var(--color-cta-bg)',
        'cta-hover': 'var(--color-cta-bg-hover)',
        'on-cta': 'var(--color-cta-text)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      maxWidth: {
        container: 'var(--container-max)',
      },
    },
  },
};

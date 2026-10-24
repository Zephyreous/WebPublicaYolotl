# Yolotl Labs: sitio web

Sitio estático de Yolotl Labs hecho con Astro 7, TypeScript estricto y Tailwind CSS 4.

## Requisitos

- Node.js 22.23.4 o superior (recomendado: 24 LTS)
- npm

## Comandos

```sh
npm install            # instala dependencias
cp .env.example .env   # y llena las variables (ver abajo)
npm run dev            # servidor local en http://localhost:4321
npm run build          # genera el sitio en dist/
npm run preview        # sirve dist/ localmente
npm test               # pruebas de contraste y reglas de marca (Vitest)
npm run check          # verificación de tipos (astro check)
npm run lint           # ESLint (incluye reglas de accesibilidad jsx-a11y)
npm run format         # Prettier
npm run test:e2e       # Playwright (pendiente de configurar, ver tests/example.spec.ts)
```

La CI (`.github/workflows/ci.yml`) ejecuta formato, lint, tipos, pruebas y build en cada push y pull request.

## Variables de entorno

| Variable                  | Uso                                                                   |
| ------------------------- | --------------------------------------------------------------------- |
| `PUBLIC_WEB3FORMS_KEY`    | Clave de acceso de Web3Forms para el formulario de contacto.          |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Dominio registrado en Plausible. Si está vacío no se carga el script. |

## Estructura

```
src/
  components/   Header, Footer, Hero, ServiceCard, ProductPOS, CaseCard, TeamCard,
                ContactForm, WhatsAppButton, SEO, Logo
  layouts/      BaseLayout.astro (head, fuentes, meta tags, tema, analítica)
  pages/        una ruta por archivo
  content/      servicios/*.md y casos/*.md (esquemas en src/content.config.ts)
  styles/       global.css: tokens de color, tipografía, espaciado y radios
  lib/          site.ts (datos centralizados) y seo.ts (título y descripción por página)
  assets/       imágenes de marcador procesadas por <Image> de Astro
public/brand/   logos SVG (actualmente marcadores)
tests/          contrast.test.ts, brand-rules.test.ts, example.spec.ts
```

Los datos de la empresa (correo, WhatsApp, redes, dominio) se editan **solo** en `src/lib/site.ts`.

## Tokens de marca

Fuente: _Manual de Identidad Visual & UI Kit V1.0_. Definidos en `src/styles/global.css` y mapeados en
`tailwind.config.mjs` como clases `yolotl-*` (por ejemplo, `bg-yolotl-navy`, `text-yolotl-teal`).

| Token                    | Valor     | Uso                                        |
| ------------------------ | --------- | ------------------------------------------ |
| `--yolotl-navy`          | `#0D1F38` | Fondo en modo oscuro, texto en modo claro  |
| `--yolotl-navy-surface`  | `#132A4A` | Superficies y tarjetas en modo oscuro      |
| `--yolotl-teal`          | `#19A796` | Acento, enlaces activos, bordes destacados |
| `--yolotl-teal-hover`    | `#148A7B` | Hover; acento grande y foco en modo claro  |
| `--yolotl-orange`        | `#E96E24` | Solo CTA de conversión y alertas clave     |
| `--yolotl-orange-hover`  | `#D15B15` | Hover del CTA                              |
| `--yolotl-ivory`         | `#F5F3EE` | Fondo en modo claro                        |
| `--yolotl-slate`         | `#64748B` | Bordes y etiquetas                         |
| `--yolotl-slate-dark`\*  | `#5C6C84` | Texto secundario sobre ivory               |
| `--yolotl-slate-light`\* | `#8B96A6` | Texto secundario sobre navy                |

\* Variantes de la pizarra (mezclada con navy o con ivory). Hacen falta porque `#64748B` no llega a 4.5:1 ni sobre
ivory (4.29) ni sobre navy (3.47).

Los componentes usan **tokens semánticos** (`--color-bg`, `--color-text`, `--color-accent`, `--color-cta-bg`…;
clases `bg-bg`, `text-fg`, `text-muted`, `bg-cta`…) que cambian según `data-theme`.

### Reglas de contraste

- Turquesa (2.70:1) y naranja (2.82:1) sobre ivory no llegan ni a 3:1: en modo claro no se usan como texto.
  Para texto grande de acento y para el anillo de foco se usa `teal-hover` (3.82:1).
- Botón naranja: texto navy, nunca blanco. En hover (navy sobre `#D15B15` = 4.11:1) el texto cuenta como grande
  (19px en negrita), por eso cumple AA.
- `npm test` lee `global.css` y falla si algún par texto/fondo usado en el diseño no cumple AA.

### Tema

`data-theme` en `<html>`: la preferencia guardada (botón del header) manda; si no hay, la página de inicio usa el
modo oscuro y las demás siguen `prefers-color-scheme`. Sin JavaScript se aplica `prefers-color-scheme`.

### Logo

- Archivos en `public/brand/`. **Los actuales son marcadores**: reemplazar por los SVG oficiales.
- Ancho mínimo del logo completo: 110px; por debajo, `Logo.astro` usa el isotipo (mínimo 16×16px).
- Área de respeto: la altura de la "o" del wordmark (`CLEARSPACE_RATIO` en `Logo.astro`, por calibrar).
- Prohibido: sombras, biseles, neón, deformar la proporción o rellenar el círculo central.
  `tests/brand-rules.test.ts` impide sombras en el código.

## Dominio y subdominios

- Dominio principal: `yolotlabs.com` (**TODO: confirmar**). Aparece en `src/lib/site.ts`, `astro.config.mjs` y
  `public/robots.txt`.
- Subdominios previstos (no implementados en este repositorio):
  - `app.yolotlabs.com`: aplicación (POS y paneles de clientes)
  - `api.yolotlabs.com`: API pública y privada
  - `docs.yolotlabs.com`: documentación técnica

# Yolotl Labs: sitio web

Sitio estático de Yolotl Labs hecho con Astro 7, TypeScript estricto y Tailwind CSS 4, desplegado en Vercel.

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
npm run verify:csp     # comprueba que la CSP de vercel.json cubra dist/ (después de build)
```

La CI (`.github/workflows/ci.yml`) ejecuta auditoría de dependencias, formato, lint, tipos, pruebas, build
y verificación de la CSP en cada push y pull request.

El build descarga las fuentes de Google una vez (necesita red) y las sirve desde el propio sitio.

## Variables de entorno

| Variable                  | Uso                                                                   |
| ------------------------- | --------------------------------------------------------------------- |
| `PUBLIC_WEB3FORMS_KEY`    | Clave de acceso de Web3Forms para el formulario de contacto.          |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Dominio registrado en Plausible. Si está vacío no se carga el script. |

**Vercel Web Analytics** (`<Analytics />` en `BaseLayout.astro`) no necesita variables, pero hay que
activarlo en el panel del proyecto en Vercel (pestaña _Analytics_). Solo registra visitas en los
despliegues de Vercel; en local (`npm run dev` o `npm run preview`) no envía datos.

## Estructura

```
src/
  components/   Header, Footer, Hero, ServiceCard, ProductPOS, CaseCard, TeamCard,
                ContactForm, WhatsAppButton, SEO, Logo
  layouts/      BaseLayout.astro (head, fuentes, meta tags, tema, analítica, loader, ClientRouter)
  pages/        una ruta por archivo
  scripts/      módulos del navegador: loader, navegación, aparición, botones magnéticos, tema
  content/      servicios/*.md y casos/*.md (esquemas en src/content.config.ts)
  styles/       global.css: tokens de color, tipografía, espaciado y radios
  lib/          site.ts (datos centralizados), seo.ts (título y descripción por página),
                transitions.ts (animación entre páginas)
  assets/       imágenes de marcador procesadas por <Image> de Astro
public/brand/   logos SVG (actualmente marcadores)
tests/          contrast.test.ts, brand-rules.test.ts, example.spec.ts
scripts/        verify-csp.mjs (CI)
vercel.json     cabeceras de seguridad y caché
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

### Movimiento y efectos

Utilidades en `src/styles/global.css` (sin sombras, biseles ni neón, según el manual):

| Clase / atributo              | Efecto                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `.bg-tech`                    | Fondo con retícula tenue y destellos turquesa/naranja que se mueven lento. Solo sobre `--color-bg`.                        |
| `[data-reveal]`               | Aparece al entrar en pantalla. Variantes: (vacío) sube, `scale`, `left`, `right`, `blur`. Los hermanos se escalonan solos. |
| `.hero-enter`                 | Entrada escalonada de los hijos al cargar.                                                                                 |
| `.float`                      | Flotación suave (Banner, icono del CTA final).                                                                             |
| `.card-hover`                 | La tarjeta se eleva y resalta el borde; `.card-media` hace zoom en la imagen.                                              |
| `.link-arrow`                 | Enlace con subrayado que crece y flecha que avanza.                                                                        |
| `.btn-cta` / `.btn-secondary` | Píldoras que se inflan con rebote; el CTA es magnético (sigue al cursor), tiene destello y flecha.                         |

Todo se desactiva con `prefers-reduced-motion: reduce`. El texto dentro de `.bg-tech` usa
`--color-text-on-decor`, y `npm test` verifica su contraste sobre el punto más intenso del destello.

**Carga y navegación**

- **Loader inicial** (`src/scripts/page-loader.ts`): solo aparece si la página tarda más de ~300ms;
  se retira con un desvanecido y entonces arranca la entrada del hero. Tope de 3s (4s solo con CSS).
- **Transición entre páginas** (`<ClientRouter />`, `src/lib/transitions.ts`): el contenido cae y el
  nuevo cae en su lugar con rebote; el header y el botón de WhatsApp no se mueven. Si la página tarda
  más de 250ms, aparece una barra de progreso arriba. Las páginas se precargan al pasar el cursor.
- **Scripts y ClientRouter:** los `<script>` de los componentes se ejecutan una sola vez por sesión.
  Lo que toca el DOM de la página debe inicializarse en `document.addEventListener('astro:page-load', …)`.

El carrusel de casos (`CaseCarousel.astro`) usa scroll-snap nativo (funciona sin JS) y añade botones,
puntos y flechas del teclado. No tiene reproducción automática a propósito (WCAG 2.2.2).

### Tema

`data-theme` en `<html>`: la preferencia guardada (botón del header) manda; si no hay, la página de inicio usa el
modo oscuro y las demás siguen `prefers-color-scheme`. Sin JavaScript se aplica `prefers-color-scheme`.
Esa regla aplica al entrar directo a una página (`data-default-theme`); al navegar dentro del sitio se
conserva el tema actual.

Al cambiar de tema, el ícono se transforma entre luna y sol, y el tema nuevo se expande como una onda
circular desde el botón (View Transition API, en `Header.astro`). En navegadores sin soporte o con
`prefers-reduced-motion: reduce`, el cambio es instantáneo.

### Logo e Identidad

- Archivos oficiales en `public/brand/`:
  - `isotipo.svg`: Colibrí geométrico (200×200px) para fondos oscuros.
  - `isotipo-light.svg`: Misma pieza para fondos claros (el ala izquierda va en Azul Noche en lugar de Blanco Hueso,
    como en `Log+TextLight.svg`). `Logo.astro` alterna ambas según el tema.
  - `Icono.svg`: Emblema en fondo Azul Noche (`#0D1F38`, 512×512px con esquinas redondeadas) para app icon y favicon.
  - `Log+TextDark.svg` / `logo-dark.svg`: Isotipo + wordmark YOLOTL para fondos oscuros.
  - `Log+TextLight.svg` / `logo-light.svg`: Isotipo + wordmark YOLOTL para fondos claros.
  - `Banner.svg`: Banner institucional oficial (1200×630px) con líneas de red y colibrí escalado.
- Ancho mínimo del logo completo: 110px; por debajo, `Logo.astro` conmuta automáticamente al isotipo.
- Área de respeto: calibrada con la altura de la «O» del wordmark (`CLEARSPACE_RATIO = 0.22` en `Logo.astro` y `global.css`).
- Prohibido: sombras, biseles, neón, deformar la proporción o rellenar el círculo central.
  `tests/brand-rules.test.ts` impide sombras en el código y verifica que toda ruta `/brand/...` exista con las
  mayúsculas exactas (en Linux `Isotipo.svg` ≠ `isotipo.svg`).
- Para mostrar el isotipo usa `<Logo variant="isotipo" />` en lugar de un `<img>` directo, así cambia con el tema.

## Seguridad

Cabeceras HTTP, CSP, terceros y pendientes manuales: ver [SECURITY.md](SECURITY.md).

## Dominio y subdominios

- Dominio principal: `yolotlabs.com` (**TODO: confirmar**). Aparece en `src/lib/site.ts`, `astro.config.mjs` y
  `public/robots.txt`.
- Subdominios previstos (no implementados en este repositorio):
  - `app.yolotlabs.com`: aplicación (POS y paneles de clientes)
  - `api.yolotlabs.com`: API pública y privada
  - `docs.yolotlabs.com`: documentación técnica

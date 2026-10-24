import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Verifica el contraste WCAG 2.x de los pares de color que usa el diseño.
 * Los valores se leen de src/styles/global.css, así que la prueba refleja el CSS real.
 *
 * Umbrales AA: 4.5 texto normal · 3 texto grande (>= 18.66px negrita o 24px) · 3 elementos no textuales.
 */

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

type Vars = Record<string, string>;

/** Bloques `selector { ... }` sin anidamiento interno (incluye los que están dentro de @media). */
function blocks(source: string): { selector: string; body: string }[] {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, '');
  return Array.from(clean.matchAll(/([^{}]+)\{([^{}]*)\}/g), (m) => ({
    // Descarta reglas previas sin llaves (@import, @config) pegadas al selector.
    selector: (m[1] ?? '').split(';').pop()!.trim(),
    body: m[2] ?? '',
  }));
}

function declarations(body: string): Vars {
  const vars: Vars = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[m[1]!] = m[2]!.trim();
  }
  return vars;
}

function findBlock(predicate: (selector: string) => boolean): Vars {
  const block = blocks(css).find((b) => predicate(b.selector));
  if (!block) throw new Error('Bloque CSS no encontrado');
  return declarations(block.body);
}

const brand = findBlock((s) => s === ':root');
const dark = findBlock((s) => s.includes(":root[data-theme='dark']"));
const light = findBlock((s) => s === ":root[data-theme='light']");
const lightNoJs = findBlock((s) => s === ':root:not([data-theme])');

interface Rgba {
  hex: string;
  alpha: number;
}

/** Resuelve var(), hex y color-mix(in srgb, <color> N%, transparent). */
function resolveRgba(value: string, theme: Vars): Rgba {
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (ref) {
    const name = ref[1]!;
    const next = theme[name] ?? brand[name];
    if (!next) throw new Error(`Variable sin definir: ${name}`);
    return resolveRgba(next, theme);
  }
  const mix = value.match(/^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%,\s*transparent\)$/);
  if (mix) {
    const base = resolveRgba(mix[1]!, theme);
    return { hex: base.hex, alpha: base.alpha * (Number(mix[2]) / 100) };
  }
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Color no soportado: ${value}`);
  return { hex: value.toUpperCase(), alpha: 1 };
}

function resolve(value: string, theme: Vars): string {
  const { hex, alpha } = resolveRgba(value, theme);
  if (alpha !== 1) throw new Error(`Color translúcido sin fondo: ${value}`);
  return hex;
}

/**
 * Fondo compuesto: 'base+capa1+capa2' (de abajo hacia arriba), p. ej. el fondo
 * con un destello y la retícula encima. Devuelve el color opaco resultante.
 */
function resolveBackground(spec: string, theme: Vars): string {
  const [base, ...layers] = spec.split('+');
  let rgb = channels(resolve(`var(${base})`, theme));
  for (const layer of layers) {
    const { hex, alpha } = resolveRgba(`var(${layer})`, theme);
    const top = channels(hex);
    rgb = rgb.map((c, i) => c * (1 - alpha) + top[i]! * alpha);
  }
  return (
    '#' +
    rgb
      .map((c) => Math.round(c).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function channels(hex: string): number[] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const NORMAL = 4.5;
const LARGE = 3;
const UI = 3;

/** [primer plano, fondo, mínimo, uso] con tokens semánticos de global.css. */
const SEMANTIC_PAIRS: [string, string, number, string][] = [
  ['--color-text', '--color-bg', NORMAL, 'texto principal'],
  ['--color-text', '--color-surface', NORMAL, 'texto en tarjetas'],
  ['--color-text-muted', '--color-bg', NORMAL, 'texto secundario'],
  ['--color-text-muted', '--color-surface', NORMAL, 'texto secundario en tarjetas'],
  ['--color-accent', '--color-bg', NORMAL, 'enlaces'],
  ['--color-accent', '--color-surface', NORMAL, 'enlaces en tarjetas'],
  ['--color-accent-large', '--color-bg', LARGE, 'acento en texto grande'],
  ['--color-accent-large', '--color-surface', LARGE, 'acento grande en tarjetas'],
  ['--color-focus', '--color-bg', UI, 'anillo de foco'],
  ['--color-focus', '--color-surface', UI, 'anillo de foco en tarjetas'],
  ['--color-border-accent', '--color-bg', UI, 'borde destacado / nav activa'],
  ['--color-border', '--color-bg', UI, 'borde de campos de formulario'],
  ['--color-error', '--color-bg', NORMAL, 'mensajes de error'],
  ['--color-error', '--color-surface', NORMAL, 'mensajes de error en tarjetas'],
  ['--color-cta-text', '--color-cta-bg', NORMAL, 'texto del botón CTA'],
  // .btn-cta usa 19px negrita (texto grande), por eso basta 3:1 en hover.
  ['--color-cta-text', '--color-cta-bg-hover', LARGE, 'texto del botón CTA en hover'],
  [
    '--color-secondary-hover-text',
    '--color-secondary-hover-bg',
    NORMAL,
    'botón secundario en hover',
  ],
  // Fondo .bg-tech (solo sobre --color-bg) en su punto más intenso: destello + retícula.
  // Dentro de .bg-tech el texto secundario usa --color-text-on-decor.
  [
    '--color-text-on-decor',
    '--color-bg+--glow-teal+--grid-line',
    NORMAL,
    'texto secundario sobre destello turquesa',
  ],
  [
    '--color-text-on-decor',
    '--color-bg+--glow-orange+--grid-line',
    NORMAL,
    'texto secundario sobre destello naranja',
  ],
  ['--color-text', '--color-bg+--glow-teal+--grid-line', NORMAL, 'texto principal sobre destello'],
  ['--color-accent', '--color-bg+--glow-orange+--grid-line', NORMAL, 'enlaces sobre destello'],
  [
    '--color-border-accent',
    '--color-bg+--glow-teal+--grid-line',
    UI,
    'borde del botón secundario sobre destello',
  ],
];

/** Pares fijos (no dependen del tema). */
const FIXED_PAIRS: [string, string, number, string][] = [
  ['--yolotl-navy', '--yolotl-teal', UI, 'icono del botón de WhatsApp'],
  ['--yolotl-navy', '--yolotl-ivory', UI, 'borde del botón de WhatsApp en tema claro'],
  ['--yolotl-teal', '--yolotl-navy', UI, 'botón de WhatsApp sobre tema oscuro'],
];

function evaluate(pairs: typeof SEMANTIC_PAIRS, theme: Vars, label: string) {
  return pairs.map(([fg, bg, min, usage]) => {
    const fgHex = resolve(`var(${fg})`, theme);
    const bgHex = resolveBackground(bg, theme);
    const ratio = contrast(fgHex, bgHex);
    return {
      tema: label,
      uso: usage,
      fg: fgHex,
      bg: bgHex,
      ratio: +ratio.toFixed(2),
      min,
      ok: ratio >= min,
    };
  });
}

describe('contraste de color (WCAG AA)', () => {
  const results = [
    ...evaluate(SEMANTIC_PAIRS, dark, 'oscuro'),
    ...evaluate(SEMANTIC_PAIRS, light, 'claro'),
    ...evaluate(FIXED_PAIRS, {}, 'ambos'),
  ];

  it('todos los pares usados en el diseño cumplen AA', () => {
    console.table(results);
    const failures = results.filter((r) => !r.ok);
    expect(failures, `Pares que fallan:\n${JSON.stringify(failures, null, 2)}`).toEqual([]);
  });

  it('el tema claro sin JS (prefers-color-scheme) es idéntico al tema claro', () => {
    expect(lightNoJs).toEqual(light);
  });

  it('el CTA naranja lleva texto navy y tamaño de texto grande', () => {
    expect(resolve('var(--color-cta-text)', dark)).toBe(resolve('var(--yolotl-navy)', {}));
    expect(resolve('var(--color-cta-text)', light)).toBe(resolve('var(--yolotl-navy)', {}));
    const btn = blocks(css).find((b) => b.selector === '.btn-cta');
    expect(btn?.body).toMatch(/font-weight:\s*700/);
    const size = Number(btn?.body.match(/font-size:\s*([\d.]+)rem/)?.[1]);
    expect(size * 16).toBeGreaterThanOrEqual(18.66);
  });

  it('reporte informativo: matriz de la paleta de marca', () => {
    const palette = Object.keys(brand).filter((k) => k.startsWith('--yolotl-'));
    const backgrounds = ['--yolotl-navy', '--yolotl-navy-surface', '--yolotl-ivory'];
    const matrix = palette.map((fg) => {
      const row: Record<string, string> = { color: fg };
      for (const bg of backgrounds) {
        const r = contrast(resolve(`var(${fg})`, {}), resolve(`var(${bg})`, {}));
        row[bg] = `${r.toFixed(2)} ${r >= NORMAL ? 'AA' : r >= LARGE ? 'AA grande' : 'falla'}`;
      }
      return row;
    });
    console.table(matrix);
    // Reglas del manual: turquesa y naranja no sirven como texto normal sobre fondo claro.
    expect(
      contrast(resolve('var(--yolotl-teal)', {}), resolve('var(--yolotl-ivory)', {})),
    ).toBeLessThan(NORMAL);
    expect(
      contrast(resolve('var(--yolotl-orange)', {}), resolve('var(--yolotl-ivory)', {})),
    ).toBeLessThan(NORMAL);
  });
});

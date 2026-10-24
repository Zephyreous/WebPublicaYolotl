import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Manual de marca: sin sombras, biseles ni efectos neón en ningún componente. */
const FORBIDDEN = /\b(?:box-shadow|text-shadow|drop-shadow|shadow-(?:sm|md|lg|xl|2xl|inner))\b/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe('reglas de marca', () => {
  it('no hay sombras en estilos ni componentes', () => {
    const offenders = files('src')
      .filter((f) => /\.(astro|css|ts|tsx|md|mdx)$/.test(f))
      .filter((f) => FORBIDDEN.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('toda ruta /brand/... apunta a un archivo existente con las mayúsculas exactas', () => {
    // Se compara contra readdirSync y no con existsSync: en Windows y macOS el sistema de
    // archivos ignora mayúsculas, pero el servidor en Linux no.
    const available = new Set(readdirSync('public/brand'));
    const missing = files('src')
      .filter((f) => /\.(astro|css|ts|tsx|md|mdx)$/.test(f))
      .flatMap((f) =>
        Array.from(readFileSync(f, 'utf8').matchAll(/\/brand\/([\w+.-]+\.\w+)/g), (m) => ({
          file: f,
          ref: m[1]!,
        })),
      )
      .filter(({ ref }) => !available.has(ref));
    expect(missing).toEqual([]);
  });
});

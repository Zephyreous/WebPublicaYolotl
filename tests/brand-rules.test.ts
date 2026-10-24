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
});

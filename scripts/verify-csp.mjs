// Verifica que la CSP de vercel.json cubra el build (dist/). Se ejecuta en CI después de `npm run build`.
// - Cada <script> en línea debe tener su hash SHA-256 en script-src.
// - Cada <script src> externo debe ser del propio sitio o de un host permitido en script-src.
// Si cambias el script de tema de BaseLayout, actualiza el hash que imprime este script.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const csp = vercel.headers
  .flatMap((rule) => rule.headers)
  .find((header) => header.key === 'Content-Security-Policy')?.value;
if (!csp) throw new Error('vercel.json no define Content-Security-Policy');

const scriptSrc = csp
  .split(';')
  .map((directive) => directive.trim().split(/\s+/))
  .find(([name]) => name === 'script-src')
  ?.slice(1);
if (!scriptSrc) throw new Error('La CSP no tiene script-src');

const allowedHashes = new Set(scriptSrc.filter((s) => s.startsWith("'sha256-")));
const allowedHosts = scriptSrc.filter((s) => s.startsWith('https://'));
const usedHashes = new Set();
const problems = [];

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const src = attrs.match(/\ssrc="([^"]+)"/)?.[1];
    if (src) {
      const external = /^https?:\/\//.test(src);
      if (external && !allowedHosts.some((host) => src.startsWith(host))) {
        problems.push(`${file}: script externo no permitido ${src}`);
      }
      continue;
    }
    if (/type="application\/(ld\+)?json"/.test(attrs)) continue;
    const hash = `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
    usedHashes.add(hash);
    if (!allowedHashes.has(hash))
      problems.push(`${file}: script en línea sin hash en la CSP ${hash}`);
  }
}

for (const hash of allowedHashes) {
  if (!usedHashes.has(hash)) console.warn(`Aviso: hash en la CSP que ningún script usa: ${hash}`);
}

if (problems.length > 0) {
  console.error(
    `La CSP de vercel.json no cubre el build:\n- ${[...new Set(problems)].join('\n- ')}`,
  );
  console.error(
    'Si el cambio es intencional, actualiza script-src en vercel.json con el hash indicado.',
  );
  process.exit(1);
}
console.log(`CSP verificada: ${usedHashes.size} script(s) en línea cubiertos por hash.`);

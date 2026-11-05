// Cuenta los marcadores de contenido pendiente ("TODO") que quedan en el sitio compilado.
// - Por defecto solo imprime el reporte y termina con código 0.
// - Con CONTENT_STRICT=1 termina con código 1 si hay alguno (para usarlo antes del lanzamiento).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const MARKER = 'TODO';
const strict = process.env.CONTENT_STRICT === '1';

if (!existsSync(DIST)) {
  console.error(`No existe ${DIST}/. Ejecuta "npm run build" antes de este script.`);
  process.exit(1);
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

const counts = htmlFiles(DIST)
  .map((file) => ({
    file: relative(DIST, file),
    count: readFileSync(file, 'utf8').split(MARKER).length - 1,
  }))
  .filter(({ count }) => count > 0)
  .sort((a, b) => b.count - a.count || a.file.localeCompare(b.file));

const total = counts.reduce((sum, { count }) => sum + count, 0);

if (total === 0) {
  console.log(`Sin marcadores "${MARKER}" en ${DIST}/.`);
  process.exit(0);
}

console.log(
  `Contenido pendiente: ${total} marcador(es) "${MARKER}" en ${counts.length} página(s) de ${DIST}/:`,
);
for (const { file, count } of counts) {
  console.log(`  ${file}: ${count}`);
}

if (strict) {
  console.error(`\nCONTENT_STRICT=1: quedan ${total} marcador(es) "${MARKER}". No publiques así.`);
  process.exit(1);
}

console.log(`\nReporte sin modo estricto (código 0). Usa CONTENT_STRICT=1 antes del lanzamiento.`);

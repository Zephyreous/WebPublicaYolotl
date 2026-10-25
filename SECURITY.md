# Seguridad

## Reportar una vulnerabilidad

Escribe a **TODO: correo de seguridad** con los pasos para reproducirla. No abras un issue público.
Respondemos en un plazo de TODO días hábiles.

## Alcance y modelo de amenazas

`yolotlabs.com` es un sitio **estático** (Astro) desplegado en Vercel: no tiene backend, base de datos
ni sesiones de usuario. Lo que hay que proteger:

| Activo                    | Amenaza principal                     | Control                                                             |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| Integridad de las páginas | Inyección de scripts (XSS)            | CSP con hashes, sin scripts de terceros salvo Plausible             |
| Visitantes                | Clickjacking, rastreo por terceros    | `frame-ancestors 'none'`, fuentes alojadas, analítica sin cookies   |
| Datos del formulario      | Interceptación, spam                  | HTTPS + HSTS, honeypot, Web3Forms restringido al dominio            |
| Código y despliegue       | Dependencias o acciones comprometidas | `npm audit`, Dependabot, acciones fijadas por SHA, permisos mínimos |

## Controles implementados

### Cabeceras HTTP (`vercel.json`)

| Cabecera                     | Valor                                                          | Para qué                                                 |
| ---------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `Content-Security-Policy`    | ver abajo                                                      | Solo se ejecuta código propio o explícitamente permitido |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains`                          | Fuerza HTTPS (también en `app.`, `api.`, `docs.`)        |
| `X-Content-Type-Options`     | `nosniff`                                                      | Evita que el navegador "adivine" tipos de archivo        |
| `X-Frame-Options`            | `DENY`                                                         | Clickjacking (respaldo de `frame-ancestors`)             |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                              | No filtra rutas completas a otros sitios                 |
| `Permissions-Policy`         | cámara, micrófono, ubicación, pagos, USB y Topics desactivados | Reduce lo que una página comprometida podría pedir       |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                  | Aísla la pestaña de ventanas abiertas por otros sitios   |

### Content Security Policy

```
default-src 'self';
script-src 'self' 'sha256-…' https://plausible.io;
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self' https://api.web3forms.com https://plausible.io;
form-action 'self' https://api.web3forms.com;
frame-ancestors 'none'; base-uri 'self'; object-src 'none'; manifest-src 'self';
upgrade-insecure-requests
```

- **Por qué la CSP vive en `vercel.json` y no en Astro:** la CSP integrada de Astro (`security.csp`)
  no es compatible con `<ClientRouter />`, que usamos para las transiciones entre páginas.
- **Un solo script en línea:** el de tema en `BaseLayout.astro`, que corre antes de pintar para evitar
  un destello del tema equivocado. Su contenido es idéntico en todas las páginas, así que basta un hash.
  Los demás scripts se sirven como archivos (`assetsInlineLimit: 0` en `astro.config.mjs`).
- **`npm run verify:csp`** (en CI, después del build) falla si algún script en línea no tiene su hash en
  `script-src`, o si aparece un script externo no permitido. Si cambias el script de tema a propósito,
  copia el hash que imprime el error en `vercel.json`.
- **`style-src 'unsafe-inline'` es un riesgo aceptado:** Astro emite estilos en línea (estilos con alcance,
  fuentes, animaciones de ClientRouter) y algunos componentes usan atributos `style`. Inyectar CSS es
  mucho menos grave que inyectar scripts, que sí están restringidos.

### Terceros

- **Fuentes:** alojadas en el sitio (`fonts` en `astro.config.mjs`). Los visitantes no hacen peticiones a
  Google, lo que evita compartir su IP (LFPDPPP) y permite `font-src 'self'`.
- **Plausible:** analítica sin cookies ni datos personales. Solo se carga si `PUBLIC_PLAUSIBLE_DOMAIN`
  tiene valor. No admite SRI porque el script se actualiza en el servidor de Plausible.
- **Web3Forms:** recibe los datos del formulario. La clave `PUBLIC_WEB3FORMS_KEY` es pública por
  diseño (va en el HTML); la protección es restringirla al dominio (ver pendientes).

### Formulario de contacto

- Honeypot `botcheck` (Web3Forms descarta los envíos que lo marcan).
- Validación en el navegador por accesibilidad; la validación real la hace Web3Forms.
- La respuesta del servidor nunca se inserta en la página: solo se muestran mensajes fijos.
- Consentimiento explícito del aviso de privacidad (casilla obligatoria).

### Cadena de suministro y CI (`.github/`)

- `npm audit --audit-level=high` en cada push y pull request.
- Dependabot semanal para npm y GitHub Actions.
- Acciones de terceros fijadas por SHA de commit, con la versión en un comentario.
- `permissions: contents: read` y `persist-credentials: false`: el workflow no puede escribir en el repo.

## Pendientes manuales

Estos pasos no se pueden hacer desde el código:

- [ ] **Web3Forms:** en el panel, restringir la clave al dominio `yolotlabs.com`.
- [ ] **GitHub:** proteger la rama `main` (exigir que pase CI y revisión antes de fusionar).
- [ ] **GitHub y Vercel:** activar la autenticación en dos pasos para todo el equipo.
- [ ] **Vercel:** activar _Deployment Protection_ en los despliegues de vista previa.
- [ ] **HSTS preload:** una vez estables todos los subdominios con HTTPS, valorar agregar `preload` y
      registrar el dominio en hstspreload.org (difícil de revertir).
- [ ] **Contacto de seguridad:** definir el correo de este archivo y publicarlo también en
      `public/.well-known/security.txt`.

## Subdominios futuros

Cuando existan `app.yolotlabs.com` y `api.yolotlabs.com`:

- Cookies de sesión con `Secure; HttpOnly; SameSite=Lax` y **sin** `Domain=yolotlabs.com`, para que el
  sitio público no las reciba.
- CORS en `api.` con una lista explícita de orígenes (nunca `*` con credenciales).
- Cada subdominio con su propia CSP; `includeSubDomains` de HSTS ya les obliga a usar HTTPS.

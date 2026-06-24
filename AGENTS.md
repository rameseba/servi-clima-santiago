# AGENTS — empieza aquí

Antes de editar este proyecto, **lee [`HANDOFF.md`](HANDOFF.md)**. Contiene el estado actual,
las reglas que NO debes romper (sostienen el Lighthouse 100/100/100/100), cómo construir,
verificar y desplegar, y las tareas pendientes.

Resumen en 10 segundos:
- Sitio **estático** en `site/` (sin backend). Se publica esa carpeta.
- Contacto = **solo WhatsApp** (`56948930381`). El formulario arma un mensaje, no envía a un server.
- Objetivo: **Lighthouse 100 en las 4 categorías**. Hay decisiones frágiles (fuente, imagen LCP,
  CSS dividido, contraste) documentadas en `HANDOFF.md`. No las cambies sin re-verificar Lighthouse.
- Verifica SIEMPRE con `node scripts/serve-prod.mjs 3000` (no con un server sin compresión).
- Despliegue: Cloudflare Pages, proyecto `serviclima`. Credenciales en `.env.local` (no subir a git).

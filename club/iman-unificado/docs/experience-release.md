# IMÁN · Experiencia y consultas

Fuente principal: `experience/`; integración: `scripts/dark_site.py`. La maqueta de `../iman-editorial/` se conserva como referencia. Las próximas ediciones deben hacerse en este proyecto, raíz configurada de Cloudflare Pages.

## Validación local

- 39 pruebas del backend aprobadas, incluyendo los tres servicios juntos, rubro, ciudad, validación, errores de proveedor y deduplicación.
- 17 páginas en sitemap. Auditoría SEO: cero errores y cero advertencias.
- Envío completo desde el navegador al buzón local: consulta al dueño y confirmación al cliente con los tres servicios. El rubro libre y la ciudad aparecen en la notificación interna.
- Las pruebas locales capturan correo; no certifican entrega externa.

## Publicación

Pendiente de completar la comprobación externa de esta versión. La rama de producción existente es `codex/iman-unificado`, proyecto Pages `iman`, dominio `www.iman.ar`. Se verificaron en el panel los bindings `CONTACT_DB` y `MAILER` y la configuración de compilación.

## Documentación técnica

El backend utiliza [Cloudflare Email Sending](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/) y [Pages advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/). No se publica el correo privado de destino en el HTML ni en el JavaScript.

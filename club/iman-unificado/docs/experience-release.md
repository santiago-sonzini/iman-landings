# IMÁN · Experiencia y consultas

Fuente principal: `experience/`; integración: `scripts/dark_site.py`. La maqueta de `../iman-editorial/` se conserva como referencia. Las próximas ediciones deben hacerse en este proyecto, raíz configurada de Cloudflare Pages.

## Validación local

- 39 pruebas del backend aprobadas, incluyendo los tres servicios juntos, rubro, ciudad, validación, errores de proveedor y deduplicación.
- 17 páginas en sitemap. Auditoría SEO: cero errores y cero advertencias.
- Envío completo desde el navegador al buzón local: consulta al dueño y confirmación al cliente con los tres servicios. El rubro libre y la ciudad aparecen en la notificación interna.
- Las pruebas locales capturan correo; no certifican entrega externa.

## Publicación

Publicada el 29 de septiembre de 2026 en **https://www.iman.ar/**. Commit de implementación: `39d7387`. Cloudflare Pages confirmó `success` para el despliegue `adba3861-9857-491b-b286-1de151bada93` (28 segundos). La rama de producción es `codex/iman-unificado`, proyecto Pages `iman`. Se verificaron los bindings `CONTACT_DB` y `MAILER`, dominio remitente habilitado y DNS configurado.

Prueba real desde el formulario de fidelización con los tres servicios y datos identificados como prueba interna. El endpoint aceptó la consulta y la confirmación. El registro de Email Sending mostró **Delivered** para ambos mensajes enviados desde `hola@iman.ar` al correo del dueño configurado en el servidor. Esto verifica entrega al servidor de destino; no se inspeccionó el buzón ni se certifica la carpeta de recepción.

Comprobaciones públicas: HTTP 200 en home, los tres servicios, contacto, sitemap y archivos de contexto; el apex termina en `www`; `/club/` redirige a fidelización; una ruta inexistente devuelve 404. El sitemap publicado tiene 17 URLs y la preview de Pages devuelve `X-Robots-Tag: noindex, nofollow`. El correo privado del dueño no aparece en los archivos públicos.

La lectura directa del buzón de Gmail fue rechazada por revisión automática por falta de autorización para leer mensajes. La verificación se completó por la alternativa permitida: registros de entrega de Cloudflare, sin acceder al buzón.

## Documentación técnica

El backend utiliza [Cloudflare Email Sending](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/) y [Pages advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/). No se publica el correo privado de destino en el HTML ni en el JavaScript.

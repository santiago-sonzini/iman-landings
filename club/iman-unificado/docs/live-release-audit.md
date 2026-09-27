# Verificación HTTP de la publicación de IMAN

Verificado el **27 de septiembre de 2026**, aproximadamente a las **21:18–21:22 UTC** (18:18–18:22 de Argentina). El sitio está publicado y responde en [iman-4jp.pages.dev](https://iman-4jp.pages.dev/). En la comprobación final también respondieron [www.iman.ar](https://www.iman.ar/) e [iman.ar](https://iman.ar/) con la misma home publicada. No se detectaron bloqueos en las rutas y recursos comprobados.

Referencia de la publicación informada desde Cloudflare: rama `codex/iman-unificado`, commit `d870b02`, despliegue `a5a0f935`. La integración Git está habilitada. Los identificadores corresponden al registro del despliegue; los encabezados HTTP no los exponen.

## Alcance y método

Se hicieron solicitudes **GET de lectura a 31 URLs de `pages.dev` y a las homes de `iman.ar` y `www.iman.ar`**, además de un HEAD a `https://iman.ar`, con validación HTTPS y sin seguir automáticamente las redirecciones. Se analizaron encabezados, HTML, XML y los archivos de recursos recibidos. No se enviaron formularios, correos, solicitudes POST, tokens de suscriptores ni transacciones contra D1. Esta revisión HTTP no sustituye la comprobación visual de las animaciones o una prueba de entrega real de emails.

## Resultado publicado

| Recurso o ruta | Resultado |
| --- | --- |
| `/`, `/fidelizacion/`, `/comercios/`, `/automatizaciones/`, `/recursos/` | HTTP 200. Un H1 y un canonical por página, sin IDs duplicados en los HTML comprobados. Canonicals a `https://www.iman.ar` con la ruta correspondiente. |
| 15 recursos de marca, galería, Wallet, negociación, movimiento y newsletter | HTTP 200, MIME adecuado; los 15 coinciden byte a byte con la salida local `public/` revisada. |
| `/club/` | HTTP 301 con `Location: /fidelizacion/`. El destino fue comprobado por separado y responde 200. |
| `/gastronomia/` | HTTP 301 con `Location: /#demos`. La home responde 200 y contiene la galería. |
| `/no-existe-auditoria-iman-20260927/` | HTTP 404 real con la página de IMAN; `Cache-Control: no-store`. |
| `/recursos/feed.xml` | HTTP 200, `application/rss+xml; charset=utf-8`, XML válido con seis artículos. |
| `/sitemap.xml` | HTTP 200, XML válido con 15 URLs, todas bajo `https://www.iman.ar`. |
| `/robots.txt` | HTTP 200, texto plano. Declara el sitemap canónico y excluye `/api/`, `/campaign/` y `/turnos/ads/`. |
| `/llms.txt` | HTTP 200, texto plano. Su publicación no demuestra indexación ni posiciones en buscadores o asistentes. |
| GET `/api/contacto` | HTTP 405 JSON `method_not_allowed`, `Allow: POST`, sin envío. |
| GET `/api/newsletter` | HTTP 405 JSON `method_not_allowed`, sin envío. |
| GET `/api/newsletter/confirmar` sin token | HTTP 400 con pantalla de enlace inválido, sin acceder a una suscripción. |
| GET `/api/no-existe-auditoria` | HTTP 404 JSON. |
| `https://www.iman.ar/` | GET 200 a las 21:21:44 UTC, `server: cloudflare`, sin `X-Robots-Tag`. La home coincide byte a byte con la publicada en `pages.dev`. |
| `https://iman.ar/` | HEAD y GET 200, sin `Location`, a las 21:21 UTC. Sirve la misma home por Cloudflare, sin `X-Robots-Tag`; todavía no redirige al hostname con www. |

Recursos comprobados: `site.css`, `site.js`, `demos.css`, `demos.js`, `negotiation.css`, `negotiation.js`, `motion.css`, `motion.js`, `newsletter.css`, `newsletter.js`, `pet-preview.css`, `pet-preview.js`, `wallet-phone.css`, `og.png` y `favicon.svg`, todos bajo `/assets/`.

## Encabezados efectivos

- Las páginas y los recursos del hostname `pages.dev` devuelven `X-Robots-Tag: noindex, nofollow`. Es el comportamiento previsto para esta dirección de previsualización; no debe trasladarse al dominio canónico.
- Los HTML correctos conservan `Cache-Control: public, max-age=0, must-revalidate`; los recursos de `/assets/` usan `public, max-age=3600`.
- En HTML, recursos y redirecciones se comprobaron `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` y la desactivación de cámara, micrófono y geolocalización mediante `Permissions-Policy`.
- Los endpoints comprobados responden con `Cache-Control: no-store` y fuera de índice. La pantalla de confirmación inválida aplica `Referrer-Policy: no-referrer`.
- Las redirecciones heredadas, los encabezados de recursos y la página 404 funcionan efectivamente a través de `env.ASSETS` en este despliegue con `_worker.js`.

## Cambio posterior a esta verificación

Se agregó al fuente `server/worker.mjs` una redirección **308 exclusivamente de `iman.ar` a `https://www.iman.ar`**, antes de resolver assets o APIs. Conserva ruta y query. No redirige `www.iman.ar` ni los hostnames de `pages.dev`.

Una prueba nueva comprueba la conservación de parámetros, la precedencia sobre la API y que los previews mantienen su respuesta y `noindex`. Resultado local: **32 pruebas aprobadas**, todas con proveedores simulados, y bundle recompilado de **32.644 bytes**. Este ajuste es posterior a `d870b02`; requiere el siguiente commit y despliegue. La redirección del dominio real todavía no está certificada por esta auditoría.

## Pendientes operativos

1. **Dominio canónico.** Ambos hostnames fueron agregados a Cloudflare Pages. Aunque la última lectura del panel y de delegación todavía estaba pendiente, la comprobación HTTP final a las 21:21 UTC ya obtuvo HTTPS válido, Cloudflare y la nueva home en ambos dominios desde esta red. Esto no certifica propagación global; corresponde refrescar el estado de zona, delegación y dominios personalizados antes de modificar nuevamente DNS. Falta publicar y verificar la redirección 308 del apex.
2. **Correo.** El service binding `MAILER` hacia el relay privado `iman-correo` está confirmado en la configuración. El envío real desde `hola@iman.ar` sigue bloqueado por el alta/verificación del dominio en Cloudflare Email Sending. No se ha probado entrega al cliente, recepción comercial, confirmación del newsletter ni bienvenida. Los GET a las APIs sólo confirman que el Worker está atendiendo esas rutas; no verifican credenciales, D1 o entrega del proveedor.
3. **Newsletter.** Los enlaces enviados se fijan a `https://www.iman.ar`; requieren que ese dominio sirva este backend y use el mismo D1. Aunque su home ya responde con esta publicación, no se verificaron lectura/escritura de D1, envío ni consumo de tokens en ese dominio.
4. **Search Console.** En la comprobación HTTP inicial seguían pendientes autorización y verificación. Ese pendiente se cerró después: propiedad verificada, sitemap procesado y cuatro solicitudes aceptadas, constatados a las 22:16:01 UTC. El [registro de configuración](seo/search-console-setup.md) distingue la home ya indexada de las solicitudes de las páginas de servicio. La revisión HTTP original no medía resultados orgánicos.

Después de cerrar dominio y Email Sending, corresponde probar con un destinatario autorizado el formulario comercial y el ciclo de newsletter —confirmación explícita, bienvenida única y baja—, conservando el relay sin rutas públicas.

## Comprobación posterior del root

27 septiembre 2026, 21:23 UTC: `HEAD https://iman.ar/recursos/` respondió 308 con `Location: https://www.iman.ar/recursos/`. Email Sending: Enabled / DNS Configured en dashboard. Aún sin envío real; revisión automática bloqueó la prueba y se solicitó autorización específica.

## Search Console: comprobación posterior autorizada

Constatación final **27 de septiembre de 2026, 22:16:01 UTC**: Ajustes mostró **Propietario verificado** para `sc-domain:iman.ar`. El sitemap canónico se procesó correctamente, con **15 páginas descubiertas** y última lectura 27/9/2026. Un fallo inicial de lectura se resolvió después del único reenvío, sin cambios de código o DNS para corregirlo.

La home ya figuraba indexada y su prueba en vivo confirmó disponibilidad e indexabilidad. Se aceptaron solicitudes para home, `/fidelizacion/`, `/comercios/` y `/automatizaciones/`. La confirmación de la solicitud no equivale a indexación completada de esas páginas de servicio.

El seguimiento continúa diariamente en Codex a las 09:00. La exportación de rendimiento y las capturas se conservaron en una carpeta privada excluida de Git; no se atribuyen los datos anteriores al sitio nuevo. Ver [configuración y evidencia](seo/search-console-setup.md). Esta actualización no modifica el estado de las pruebas de correo ni autoriza envíos.

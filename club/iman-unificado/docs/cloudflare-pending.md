# Cloudflare: pendientes de publicación y operación

Estado documental: **sitio y dominio publicados; Email Sending habilitado; Search Console verificado y sitemap procesado; pruebas de correo pendientes de autorización**, 27 de septiembre de 2026. Este archivo registra la configuración realizada y las comprobaciones que todavía faltan. Guardar una configuración no demuestra propagación DNS, despliegue del sitio final ni entrega de correos.

## Configuración realizada

| Elemento | Estado registrado | Falta cerrar |
| --- | --- | --- |
| Zona `iman.ar` en Cloudflare | Activa; sitio verificado en dominio real | Pueden persistir cachés de DNS/redirects anteriores |
| Nameservers en Donweb | `sid.ns.cloudflare.com` y `zelda.ns.cloudflare.com` guardados | Confirmar delegación y resolución pública |
| Registros anteriores | Siete registros copiados como DNS-only | Contrastar resolución y servicios existentes tras propagación |
| D1 | Esquema actualizado aplicado | Confirmar lectura/escritura desde el despliegue final |
| `CONTACT_DB` en Pages | Binding guardado | Verificar en el entorno que se publique |
| Variables de Pages | Guardadas | Confirmar entorno y disponibilidad en el despliegue final |
| Worker `iman-correo` | Código desplegado como relay privado, con `workers.dev`, previews y rutas públicas desactivados | Prueba mediante el service binding |
| `EMAIL` del relay | Binding preparado; dominio Enabled / DNS Configured | Validar envío real autorizado |
| `MAILER` de Pages | Guardado y verificado hacia `iman-correo` | Prueba de entrega tras activar Email Sending |
| Search Console | Propietario verificado; sitemap procesado con 15 URLs descubiertas; cuatro solicitudes aceptadas | Observar indexación posterior de las páginas de servicio, sin confundir solicitudes con resultados |
| Despliegue por Git | Publicado y verificado en `https://iman-4jp.pages.dev/` | Automático desde `codex/iman-unificado`; main sin cambios |

No se realizaron pruebas de correo real que permitan considerar la entrega operativa.

## Sitio y dominio

- Cloudflare Pages está conectado a [santiago-sonzini/iman-landings](https://github.com/santiago-sonzini/iman-landings), rama `codex/iman-unificado`, raíz `club/iman-unificado`, comando `bash scripts/build-ci.sh`, salida `public`.
- Compilar backend y sitio, ejecutar verificaciones y publicar la salida `public/`, con `_worker.js` y `_routes.json` en su raíz. El ZIP es una alternativa, no evidencia de un despliegue completado.
- Proyecto `iman`; hostname `iman-4jp.pages.dev` verificado público, deployment inicial `a5a0f935`, commit `d870b02`. El informe live-release-audit.md registra controles HTTP sin envíos de correo.
- Dominio canónico del sitio y de los emails: `https://www.iman.ar`.
- Revisar la configuración final de `iman.ar` y `www.iman.ar`, HTTPS, redirección de la variante secundaria y ausencia de bucles.
- Verificar que `/club/` llegue a Fidelización y que las antiguas rutas por rubro lleven a los servicios/demos previstos. Confirmar que el sitemap final incluya las 15 páginas y seis guías de la nueva integración, y que los previews de Pages y las demos ilustrativas permanezcan fuera del índice.
- Comprobar la delegación `sid`/`zelda` guardada en Donweb, la activación de la zona y los siete registros anteriores copiados como DNS-only. Conservar los registros de los servicios existentes; no asumir propagación por verlos guardados en la cuenta.

## Email Sending

- Completar el onboarding de `iman.ar` en Cloudflare Email Sending cuando el dominio esté activo y confirmar el remitente `hola@iman.ar`. Este paso está pendiente. Email Routing por sí solo no habilita el contrato de envío utilizado por el código.
- Comprobar los registros de autenticación requeridos por Cloudflare en el dominio, conservando los registros legítimos anteriores.
- El relay `iman-correo` ya tiene el código desplegado y el binding `EMAIL` preparado. Mantener desactivados `workers.dev`, URLs de preview y rutas/dominios públicos.
- Verificar que el Service Binding `MAILER` esté guardado en Pages, apunte a `iman-correo` y pertenezca al entorno del despliegue final.

## Datos y variables

- `CONTACT_DB` está guardado hacia la base del proyecto. Ambos formularios fallan sin almacenamiento durable; comprobar el binding desde la versión publicada.
- `server/schema.sql` ya fue aplicado. Al actualizar una base previa, recordar que `CREATE TABLE IF NOT EXISTS` no incorpora columnas: revisar `unsubscribe_previous_hash`, `welcome_state`, `welcome_attempts` y `welcome_sent_at`.
- Variables ya guardadas en Pages: `FROM_EMAIL=hola@iman.ar`, `CONTACT_EMAIL` como buzón comercial y `SITE_URL=https://www.iman.ar`. Verificar que estén disponibles en producción.
- Mantener `CONTACT_HASH_SECRET`, aleatorio y de al menos 32 caracteres, fuera del sitio, documentos y ZIP. Confirmar su presencia como secreto en el entorno final sin exponer su valor.

El [README del backend](../server/README.md) documenta el contrato de cada endpoint y su configuración detallada.

## Prueba de operación que falta cerrar

Con el dominio canónico apuntando a la versión correcta:

1. Probar contacto con un destinatario autorizado: recepción comercial, confirmación de marca con Calendly y errores visibles si falla algún paso.
2. Probar newsletter: solicitud, email inicial, GET sin suscripción automática, confirmación explícita, bienvenida única y baja.
3. Verificar que visitas/clics no se confundan con consultas recibidas y que los píxeles respeten la elección de medición.
4. Validar enlaces de Calendly, versiones móvil/escritorio, datos estructurados y redirecciones servidas por Cloudflare.
5. Dar seguimiento a la indexación en Search Console. Propiedad y sitemap quedaron confirmados a las 22:16:01 UTC; ver [registro de configuración](seo/search-console-setup.md). El panel versionado no contiene métricas; las exportaciones reales se conservan en la carpeta privada ignorada. No hay conexión a la API.

Las pruebas unitarias ya realizadas usan stubs y no sustituyen una comprobación real de la cuenta. No hay una campaña masiva, un cron de newsletter ni un envío recurrente configurado por este código.

## Decisiones y autorizaciones

La revisión automática bloqueó modificar main; se usó la alternativa segura de publicar desde codex/iman-unificado. Git y Cloudflare están conectados sin modificar la rama principal.
Inicialmente se esperó la autorización específica para Search Console. El usuario la concedió después y se confirmó la propiedad existente, el procesamiento del sitemap y las solicitudes de indexación; el [registro de configuración](seo/search-console-setup.md) conserva ese cierre. El TXT se guardó en ambos proveedores para preservar la validación durante la migración.

## Cierre de esta iteración (21:25 UTC)

- Git automático confirmado: un segundo push publicó el Worker con redirección 308 de `iman.ar` a `www.iman.ar`, preservando ruta y query.
- `www.iman.ar` figura Active en Pages. Ambos dominios sirven Cloudflare; el sitio se comprobó también en el navegador integrado con una URL nueva para evitar caché de la landing anterior.
- `www` apunta a `iman-4jp.pages.dev` tanto en Cloudflare como en Donweb durante la transición; los subdominios de demos se conservaron.
- Email Sending del dominio: Sending status Enabled y DNS records Configured. Se configuraron MX de rebotes, SPF, DKIM y DMARC mediante el asistente oficial.
- La consulta interna de prueba quedó preparada pero sin enviar: la revisión automática exige aprobación del payload y destinatario. Newsletter no fue enviada ni se suscribió a nadie.
- Search Console a las 21:25 UTC: estaba pendiente de aprobación explícita. Este pendiente quedó cerrado posteriormente con autorización del usuario; ver la actualización siguiente.

## Cierre posterior de Search Console (22:16:01 UTC)

- `sc-domain:iman.ar`: **Propietario verificado** en Ajustes; propiedad existente, no creada en esta intervención.
- Sitemap `https://www.iman.ar/sitemap.xml`: **procesado correctamente**, 15 páginas descubiertas, última lectura 27/9/2026. El error inicial de lectura quedó resuelto; no permanece como pendiente.
- Home ya indexada y disponible en prueba en vivo. Solicitudes de actualización/indexación aceptadas para home, Fidelización, Comercios y Automatizaciones.
- La aceptación de solicitudes no confirma todavía la indexación de todas las páginas de servicio. Seguimiento diario en Codex a las 09:00; datos y capturas guardados en privado. [Detalle y límites](seo/search-console-setup.md).

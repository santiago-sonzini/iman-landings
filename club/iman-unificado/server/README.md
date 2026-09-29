# Formularios y correos de IMAN

Cloudflare Pages sirve el sitio y los endpoints desde `dist/_worker.js`. El envío usa **Cloudflare Email Sending** desde `IMAN <hola@iman.ar>` mediante un Worker privado `iman-correo`, enlazado a Pages con un service binding `MAILER`. No usa Gmail SMTP, contraseñas de Gmail, Nodemailer ni compatibilidad Node en producción.

## Publicación desde el navegador

1. Tener `iman.ar` activo en Cloudflare DNS y completar **Email Service → Email Sending → Onboard Domain**. Verificar SPF/DKIM/DMARC creados por Cloudflare, conservando los registros existentes del dominio. El envío requiere la habilitación/plano correspondiente de Cloudflare; no es lo mismo que Email Routing.
2. Crear D1 y ejecutar **schema.sql** completo en su consola. En Pages agregar el binding **CONTACT_DB** hacia esa base. Es obligatorio para ambos formularios: sin él responden 503 y no envían.
3. Crear Worker **iman-correo** con el código completo de **mail-relay.mjs**. Agregar su binding `send_email` **EMAIL**; restringir remitentes a `hola@iman.ar`. No limitar los destinatarios a una lista fija porque debe responder a clientes que consultan. **Desactivar workers.dev, preview URLs y cualquier ruta o dominio público del relay**. Solo debe recibir llamadas internas desde Pages.
4. En Pages agregar service binding **MAILER → iman-correo** y variables:
   - `FROM_EMAIL`: `hola@iman.ar`.
   - `CONTACT_EMAIL`: `santisonzini1234@gmail.com` (destino de consultas comerciales y Reply-To; no suscriptor).
   - `CONTACT_HASH_SECRET`: secreto aleatorio de al menos 32 caracteres. Se usa para HMAC de huellas, email e IP. No publicarlo ni guardarlo en archivos del sitio.
   - `SITE_URL`: `https://www.iman.ar`.
5. Desde esta carpeta: `npm ci --ignore-scripts`, `npm test`, `npm run build`. Copiar **dist/_worker.js** y **dist/_routes.json** a la raíz `public/` del sitio **después** del generador estático y **antes** de armar el ZIP. Subir el contenido de `public/`; nunca subir esta carpeta server, fuentes, tests, previews, secretos o node_modules.
6. Mantener el dominio canónico `www.iman.ar` apuntando al sitio que tiene los endpoints antes de habilitar el formulario newsletter. Sus enlaces de confirmación/baja siempre apuntan a ese dominio.

Si el entorno soporta directamente un binding `EMAIL.send`, el Worker principal lo usa en lugar del relay. El contrato es el EmailMessageBuilder nativo documentado por Cloudflare. No hay envío de prueba ni cron/campaña automática en este código.

## Comportamiento

**POST /api/contacto** recibe JSON con `nombre`, `negocio`, `email`, `servicio`, `consentimiento: true`; opcionales `rubro`, `ciudad`, `whatsapp`, `comentario`, `sitio_web_empresa` (honeypot), `source`/`url`/`origen` y parámetros UTM. Los servicios admitidos están en `contact.mjs`. El frontend editorial envía `servicios: string[]` (hasta cuatro), también admite `IMAN Agentes`, `WhatsApp e IA`, `Fidelización y email marketing` y `Catálogos y ERP`; una lista vacía pide orientación. Los emails incluyen todos los servicios elegidos. Se conserva el campo escalar `servicio` para formularios anteriores. Primero envía la consulta al dueño; si falla, no devuelve éxito ni manda confirmación. Luego envía al cliente el correo de marca con Calendly. Éxito: `{ok:true,confirmationSent:true|false,calendlyUrl}`. `confirmationSent:false` significa que la consulta sí llegó al proveedor para el dueño pero no se pudo confirmar el envío al cliente.

**POST /api/newsletter** recibe `{nombre,email,rubro?,consentimiento:true,sitio_web_empresa?,origen?}`. Guarda pendiente en D1 y manda un enlace de confirmación; no suscribe al cliente del formulario comercial. Responde el mismo mensaje genérico para direcciones ya suscriptas, sin exponer su estado. El enlace GET muestra una página; solo el POST explícito confirma. Al confirmar manda una **bienvenida transaccional** con tres ideas, guía y baja. No envía campañas masivas ni newsletter periódicos.

**GET/POST /api/newsletter/confirmar** y **GET/POST /api/newsletter/baja** usan tokens aleatorios de 256 bits, almacenados como SHA-256 en D1. GET nunca cambia el estado ni manda correos: evita activaciones de escáneres de enlaces. POST requiere mismo origen. El token de confirmación vence en 48h. Una bienvenida aceptada no se repite; un rechazo inequívoco permite hasta tres intentos mediante un nuevo POST de confirmación, y un error ambiguo queda `unknown` para evitar duplicados. La baja funciona desde el email inicial y desde la bienvenida.

Ambos formularios aceptan `Idempotency-Key` (16–80 caracteres URL-safe), reutilizado para el mismo payload. D1 reclama el ID de forma atómica. Cambiar datos bajo el mismo ID da 409. Los errores por cuota liberan el ID para reintentar una vez renovada; rechazos inequívocos del proveedor lo liberan con `retryable:true`. Errores ambiguos conservan el resultado, porque el proveedor podría haber aceptado el mensaje. No se promete entrega en bandeja de entrada: una aceptación del proveedor todavía puede terminar en spam o rebote posterior.

## Datos, límites y operación

- Contacto: no guarda texto del formulario ni direcciones sin cifrar en D1; guarda HMAC de huellas/IP/email, estado de idempotencia y respuesta sin datos personales. Datos del lead sí viajan al buzón comercial que debe gestionarlos según la política de privacidad.
- Newsletter: guarda nombre, email, rubro opcional, versión de consentimiento y marcas de confirmación/baja; es la lista necesaria para futuras acciones autorizadas. Para cualquier futura campaña, seleccionar solamente `status='subscribed'`. La bienvenida no constituye una campaña recurrente.
- Límites por formulario: 4 solicitudes por IP cada 10 minutos, 2 por destinatario cada hora, 100 globales/hora. Solicitudes de contacto limitadas a 12 KB, newsletter 4 KB, campos acotados, honeypot y origen estricto. No son una garantía contra abuso distribuido; si sube el abuso, integrar Turnstile y reglas de Cloudflare.
- Limpieza oportunista: se borran huellas de solicitudes de más de 7 días, buckets vencidos, suscripciones pendientes vencidas y bajas de más de 30 días cuando entran nuevas solicitudes. Sin tráfico, estos registros permanecen hasta la próxima limpieza; no hay cron creado. El nombre/rubro se borra al confirmar la baja.
- No se escriben emails, IP, contenido de consultas, tokens ni mensajes detallados del proveedor en logs. Solo códigos operativos fijos.
- El relay rechaza cualquier hostname salvo `iman-correo.internal`, fija remitente y un único destinatario, y descarta BCC/CC/adjuntos/headers del caller. Esta defensa complementa la obligación de no exponer rutas públicas del Worker.

## Validación

`npm test` usa transportes simulados y SQLite local como equivalente de las sentencias D1; no envía correos. Cubre errores de envío, confirmación parcial, deduplicación, solicitudes concurrentes, cuotas persistentes, validación/escape, doble opt-in, links de scanners, tokens vencidos, baja, bienvenida y relay. El envío real y la recepción requieren comprobar la cuenta Cloudflare, la verificación DNS y un destinatario de prueba autorizado por el usuario.

`npm run preview-email` genera `confirmation-preview.html`, `newsletter-confirmation-preview.html` y `newsletter-welcome-preview.html` con datos ficticios. Los links de tokens en estas vistas son inertes y llevan a la home.

Fuentes oficiales: [Email Sending Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/), [habilitar un dominio remitente](https://developers.cloudflare.com/email-service/get-started/send-emails/), [Pages Direct Upload y soporte de _worker.js](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Pages advanced mode y ASSETS](https://developers.cloudflare.com/pages/functions/advanced-mode/).

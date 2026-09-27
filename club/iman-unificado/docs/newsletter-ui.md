# Newsletter: integración del frontend

Incluir `templates/newsletter.html` una sola vez antes de `</body>`, enlazar `/assets/newsletter.css` e incluir `/assets/newsletter.js` con `defer`. Agregar en el footer un botón `<button type="button" data-newsletter-open>Recibir ideas para que tus clientes vuelvan</button>`.

La invitación automática es una tarjeta compacta, sin overlay ni cambio de foco. Se muestra luego de 45 segundos de pestaña visible y 45% de scroll; máximo una vez por sesión. Se suspende durante el formulario de consulta, un diálogo o la decisión de medición. Excluye rutas de contacto, calendario, privacidad, información y demo. Cerrar (botón de 44 px o Escape) evita repetir por 14 días. El contacto confirmado también suprime la invitación por 14 días. Una solicitud de suscripción aceptada la suprime indefinidamente en ese navegador. No se guardan datos personales en storage. El acceso manual del footer permanece disponible.

El formulario se abre por acción explícita en un diálogo nativo con foco gestionado, Escape, cierre exterior y animación compatible con `prefers-reduced-motion`. Pide nombre y email obligatorios, rubro opcional y consentimiento explícito sin premarcar. No se emiten falsos mensajes de éxito en error o en un hosting estático sin API.

Contrato: POST `/api/newsletter`, JSON `{nombre,email,rubro,consentimiento:true,sitio_web_empresa,origen}`, header `Idempotency-Key` con UUID conservado si se reintenta el mismo payload. Success requiere HTTP 2xx + `{ok:true}`. Mensaje visible genérico conforme al doble opt-in para no exponer si otro email estaba suscripto. Errores manejan 400/422, 429 y falta de servicio/red. Timeout 20s.

Se emiten eventos DOM `iman:newsletter_view`, `_open`, `_dismiss`, `_form_start`, `_error`, `_confirmation_requested`; `detail` solo tiene `placement` y `reason` de vocabulario controlado. No hay PII, no dispara `generate_lead` ni cuenta una confirmación solicitada como suscriptor confirmado. El listener `iman:generate_lead` oculta las invitaciones cuando termina la consulta comercial.

No se envió ningún email real para probar este componente. Antes de producción, el backend debe tener persistencia, proveedor, remitente y doble opt-in configurados.

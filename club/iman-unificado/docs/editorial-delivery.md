# IMAN — experiencia editorial local

28 de septiembre de 2026. **No se publicó, no se hizo commit ni push.** Esta versión reemplaza la interfaz pública principal; no suma una capa de CSS sobre la landing anterior.

## Vista previa

Iniciar con `npm --prefix server run preview` desde `iman-unificado`, o `node local-preview.mjs` desde `server`.

- Inicio: http://127.0.0.1:8791/
- Información con pestañas: http://127.0.0.1:8791/servicios/
- Modo agente: http://127.0.0.1:8791/agente/
- Buzón de pruebas: http://127.0.0.1:8791/__preview/

El servidor local usa el mismo handler de contacto y un adaptador SQLite para D1. Captura los emails en `club/tmp/editorial-mailbox/`; **no envía correos externos**. La página avisa este comportamiento. El servidor de pruebas no se incluye en `public/` ni en el worker. No usar el simple servidor estático de Python para probar el formulario.

## Logo e imagen aportados

El símbolo definitivo ya está incorporado. `assets/brand-symbol-source.png` conserva el archivo adjunto sin modificar. `scripts/brand-assets.swift` obtiene su máscara clara retirando el fondo, sin dibujar curvas nuevas ni engrosar líneas. Esa misma geometría alimenta las partículas, el fallback HTML, favicon, imagen social y emails.

La figura de “Agentes con criterio” es **el archivo original del usuario**, `assets/judgment-original.png`. El color cian/lavanda/ámbar se aplica con CSS sobre su tramado. No se regeneró la figura. La exploración generada se descartó y no forma parte del sitio.

## Cambios pedidos durante la revisión

- Titular: “Tu empresa, llevada al siguiente nivel”. Marca sólo como firma discreta.
- La selección está en un diálogo modal independiente. El primer paso permite elegir varios servicios y el segundo conserva selección y borrador. Cerrar, volver y reabrir no pierde lo ingresado.
- La segunda sección muestra cuatro recorridos ilustrativos, con transiciones breves y repetibles. Agentes abre por defecto y explicita datos autorizados, permisos y revisión humana. No simula un chat en funcionamiento.

## Implementación

- Stack conservado: HTML estático generado con Python, CSS y JavaScript nativos, Cloudflare Worker y D1. Sin librerías de animación nuevas.
- `scripts/editorial.py`: shell y páginas nuevas. `content/services.json`: fuente común para la oferta, las tabs y el contexto copiado.
- `assets/editorial.css` y `editorial.js`: tipografía local Barlow Condensed 300/400, selección accesible, formulario progresivo, persistencia de borrador en sesión, tabs por teclado, contexto copiable y diálogo de alternativa manual.
- Referencia adicional aportada durante la revisión: gráfica ASCII blanca sobre carbón. Se aplicó fondo `#272727`, mayor escala del campo y microcaracteres monoespaciados en la animación, conservando acentos puntuales. No se tomó la figura de esa imagen como el logo de IMAN.
- `assets/field.js`: Canvas 2D, convergencia de 2–3 segundos, interacción sutil, menos puntos en dispositivos modestos, pausa por visibilidad/intersección y respeto del movimiento reducido. Las partículas muestrean el símbolo adjunto, con una capa de la máscara original para mantener nítidas sus líneas.
- La barra de modos es navegación real entre URLs. Mientras el diálogo de consulta está abierto queda detrás de la capa modal y oculta, sin tapar el formulario o el teclado.
- `assets/measurement.js` preserva la elección previa de medición, IDs y restricciones a producción. Ningún dato del formulario se envía a los trackers. El texto del agente usa exclusivamente contenido público e intereses.
- Se conservaron WhatsApp y Calendly del proyecto. La agenda respondió HTTP 200 en la verificación; no se realizó una reserva.

## Circuito de contacto auditado

El backend exige nombre, negocio, email, interés y consentimiento comercial. WhatsApp y comentario son opcionales. Acepta ahora `servicios: string[]` con hasta cuatro servicios. Vacío equivale a orientación. Conserva `servicio` escalar para clientes anteriores. Rechaza servicios desconocidos y combina duplicados en un orden estable.

Primero notifica al equipo; luego intenta la confirmación al visitante. Sólo responde `ok: true` después de que el transporte acepta la consulta del equipo. Una confirmación fallida no pierde la consulta: `confirmationSent: false` se explica en pantalla. La aceptación del transporte no prueba entrega en bandeja.

La clave de idempotencia se conserva para reintentos del mismo payload. D1 guarda HMAC y estado, no texto del formulario ni dirección en claro. Se preservan límites, honeypot, validación de origen y consentimiento. La newsletter mantiene doble opt-in y baja independientes; una consulta no crea una suscripción.

Los correos de consulta, notificación interna, confirmación de suscripción y bienvenida comparten el nuevo lenguaje editorial: tablas, colores sólidos, tipografías de sistema, CTA compatible y versión texto plano. Las previews HTML no sustituyen una revisión en clientes de correo reales.

## URLs y SEO

| URL anterior | Tratamiento |
| --- | --- |
| `/` | Home editorial de dos secciones |
| `/fidelizacion/` | Conservada, contenido nuevo del servicio |
| `/comercios/` | Conservada, Catálogos |
| `/automatizaciones/` | Conservada; ancla histórica `#compras` mantenida |
| `/turnos/landing/` | Conservada como servicio complementario, fuera de la home |
| `/recursos/` y sus seis guías | URLs, contenido y metadata de Article preservados; nuevo shell |
| `/privacidad/` | Actualizada para sesión, intereses y portapapeles |
| `/informacion/`, `/nosotros/` | 301 a `/agente/` |
| `/club`, `/club/`, `/catalogos/`, aliases de rubros | Redirecciones históricas preservadas |
| `/gastronomia/` | 301 a `/servicios/#fidelizacion` |
| `/hub/` | 301 a `/#seleccion` |
| `/automatizaciones/compras-demo/`, `/turnos/`, `/urbase/` | Demostraciones/archivo existentes preservados, noindex |

Nuevas URLs: `/servicios/`, `/agente/`, `/agentes/`, `/contexto-iman.md`. Canonical productivo conservado: `https://www.iman.ar`; el apex `iman.ar` redirige con 308 a `www`, como el circuito existente. Sitemap: 16 páginas. HTML inicial con contenido, Organization/Service/FAQ/Article verificables, Open Graph de 1200×630, favicon, 404 y enlaces rastreables. Las previews no canónicas reciben `X-Robots-Tag: noindex, nofollow`; su robots bloquea rastreo. Los auxiliares para agentes son complementarios y no prometen posicionamiento.

## Verificación realizada

- 37 pruebas de backend aprobadas: validación, múltiples servicios, emails HTML/texto, compatibilidad escalar, selección vacía, deduplicación, concurrencia, D1, límites, errores, confirmación parcial, newsletter y relay.
- Navegador de escritorio: modal con selección múltiple, cierre con Escape, devolución del foco y reapertura con borrador; ida y vuelta entre páginas; borrador conservado; tabs con flechas del teclado; copiado con confirmación; validación de campos; envío, error recuperable y reintento.
- Vistas móviles de 390×844 y 320×780: home con logo, selección en modal, formulario y ausencia de desborde horizontal. Los campos usan 16px; la barra se oculta mientras el modal está abierto y cuando podría superponerse con un CTA.
- Clipboard rechazado mediante fixture exclusivamente local: diálogo anidado con texto completo (los cuatro servicios y los intereses), selección manual y sin desborde a 320 px. El camino normal resolvió `writeText`, mostró la confirmación y permitió pegar el contexto completo en un campo de otra vista local del navegador. No se envió a un asistente externo.
- Movimiento reducido emulado por fixture exclusivamente local: Canvas oculto, símbolo original estático visible, contenido disponible. No es una prueba de ajustes del sistema operativo en un teléfono físico.
- Desconexión de red simulada: mensaje útil, datos intactos, reintento disponible.
- Emails capturados: revisión visual en navegador de destinatario, servicios, enlaces y texto plano. **Sin prueba de recepción externa ni validación Outlook/Gmail real.**
- Auditorías HTML/SEO locales: 16 URLs canónicas, sin errores ni advertencias. No certifican indexación ni métricas de campo.

## Antes de publicar

1. Probar transporte y recepción externa con un destinatario de pruebas configurado. No hay credenciales locales de Cloudflare para certificar los bindings remotos. Verificar `CONTACT_DB` con `schema.sql`, `MAILER` o `EMAIL`, `FROM_EMAIL=hola@iman.ar`, `CONTACT_EMAIL`, `CONTACT_HASH_SECRET` (mínimo 32 caracteres), `SITE_URL=https://www.iman.ar`, dominio remitente y DNS. El README anterior describe configuración remota, pero esta sesión no la revalidó.
2. Revisión de emails en Gmail/Outlook y móvil real; verificación de entregabilidad y spam.
3. Compilar y revisar el paquete final. No desplegar hasta que el usuario lo indique.

## Referencias visuales revisadas

- https://hermes-agent.nousresearch.com/ — composición editorial, altura tipográfica, escala y márgenes.
- https://hermes-hk.vercel.app/ — acentos cian `#75cedd`, lavanda `#b5a3ee` y ámbar `#e5bd7c`. No se copiaron ilustraciones, símbolos ni textos.

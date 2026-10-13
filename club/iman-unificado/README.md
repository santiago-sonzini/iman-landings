# IMAN

## Gauss para estudios contables — 13 de octubre de 2026

Landing de Gauss para estudios contables, publicada en **https://gauss.iman.ar/**, y un informe de ejemplo (`/informe/`): copia estática de la pantalla donde el cliente del estudio ve y pide su informe en su app (`app.gauss.iman.ar`). La landing de compras (`experience/gauss.html`, `/gauss/`) no cambia.

- `experience/gauss-estudios.html`: la landing. Describe la app real (`app.gauss.iman.ar`, código en `club/gauss-app/`): los papeles entran por carga de archivos, no por WhatsApp, y cada cliente del estudio entra a su app (`/c/`) con su mail. La demo del hero es un cliente subiendo papeles desde su app mientras se llena la ficha del mes. El informe, la app del cliente, los avisos y el panel se muestran con capturas reales de la demo en `experience/assets/shots/`: `gauss-informe-mobile.webp` (600×3838), `gauss-app-mobile.webp` (600×1266), `gauss-avisos-desktop.webp` (1800×1660) y `gauss-desktop.webp` (1800×2582). Salen de los PNG que `node scripts/capture-demos.mjs gauss` deja en `club/tmp/demo-captures/` (la app del cliente se captura desde la vista previa de la demo, `/demo/clientes/{id}/app`), recortados y pasados a WebP con `magick` y `cwebp -q 82`; si cambia el alto hay que recalcular `--end` en la landing (marco de celular: `-(alto - ancho×19/9)/alto`; marco de navegador: `-(alto - ancho×0,65)/alto`).
- `experience/gauss-informe.html`: el informe de ejemplo, con las mismas secciones y textos que el informe real de la app y el botón «Pedir informe». Es una demo: los datos son ficticios y el pedido no se envía a ningún lado.
- `build_dark` las emite a `public/gauss/estudios/` y `public/gauss/estudios/informe/`, sin listar (`noindex`, fuera del sitemap y de `docs/pages.json`), con canonical a `gauss.iman.ar`.
- `server/worker.mjs` (`GAUSS_PAGES`): en `gauss.iman.ar`, `/` y `/informe/` sirven esas dos páginas, `/assets/` pasa tal cual y cualquier otra ruta va a `www.iman.ar`. `gauss.iman.ar` es un dominio más del proyecto en Cloudflare Pages.
- Los botones llevan a la demo (`https://app.gauss.iman.ar/demo`) y al alta (`https://app.gauss.iman.ar/`), con dirección completa porque en `gauss.iman.ar` cualquier otra ruta va a `www.iman.ar`. El formulario y `server/contact.mjs` conservan la opción «Gauss · Estudios contables» (`/contacto/?servicio=estudios`), aunque la landing ya no la enlaza.
- Ver en local: `python3 scripts/build.py` y la vista previa `iman` → `http://127.0.0.1:8791/gauss/estudios/`.
- Imagen para compartir: `variants/assets/share-gauss-estudios-v1.png`, definida en `scripts/render-brand-previews.cjs`.
- El asistente de WhatsApp conoce el producto: bloque «Gauss para estudios contables» en su `negocio.md`.

## Diagnóstico — 12 de octubre de 2026 (publicado el 13)

`/diagnostico/` es una landing de conversión: un onboarding de ocho preguntas que termina en un plan armado con las respuestas y en la llamada.

- Preguntas: rubro, problema, cómo lo resuelve hoy, volumen, qué le cuesta, para cuándo lo quiere, cuánto piensa invertir por mes y el nombre del negocio (opcional).
- Plan: titular y diagnóstico con sus respuestas, la solución principal con su demo (conversación de WhatsApp del rubro, club con Wallet, catálogo o cuadro de Gauss), el alcance ajustado al presupuesto y las soluciones que la acompañan.
- Cierre: «Agendar la llamada» (agenda.iman.ar), WhatsApp con el diagnóstico escrito en el mensaje y «Prefiero que me escriban ustedes», que manda el diagnóstico a `/api/contacto` como una consulta más.
- `experience/diagnostico.html` tiene la página y los estilos; `experience/diagnostico.js`, las tablas (rubros, problemas, soluciones, precios de referencia, conversaciones de ejemplo) y la lógica. Para cambiar textos o precios se editan las tablas del principio.
- Gauss aparece en todos los planes de los rubros que compran a varios proveedores (gastronomía, comercio, mayorista, industria; en «otro», con pedidos o carga manual): `gauss` y `gaussEn` en `RUBROS`. Es la solución principal cuando el problema es de compras.
- El campo de limaduras reacciona al puntero: `data-field-mouse` en el `<canvas>` lo activa en `v3.js` (el puntero es un tercer polo). La home y Gauss no lo llevan.
- Los precios «desde» son los que cotiza el asistente de WhatsApp. `/diagnostico/?rubro=autos` saltea la primera pregunta (ids en `RUBROS`), para anuncios por rubro.
- Sin listar: `noindex`, fuera del sitemap y de `docs/pages.json`. La emite `build_dark` en `scripts/dark_site.py`.
- Para probar el formulario en la vista previa hay que entrar por `http://127.0.0.1:8791`: con `localhost` el servidor local responde «Origen no permitido».

## Identidad V3 — 11 de octubre de 2026

V3 es la identidad V1 en blanco: Inter y Geist Mono, negro #121212 y el degradado cian, lavanda y champagne del logo usado como resaltador. Reemplaza a V1 en todo el sitio.

- `experience/v3.css` y `v3.js`: sistema compartido (barra flotante, botones, marcos de celular y navegador, chat de WhatsApp, pie, retícula de limaduras).
- `experience/home-v3.html`: la portada. El hero muestra la captura real de cafe.iman.ar, siguen las tres demos y después los cuatro servicios.
- `experience/gauss.html`: Gauss sobre el mismo sistema, con la palabra Gauss en el degradado.
- `experience/reading-v3.css`: servicios, contacto, guías, privacidad, agente, 404 y la demo de compras. `scripts/dark_site.py` genera esas páginas con `shell()`.
- El logo es `logo-v1.png` usado como máscara: tinta sobre blanco, blanco sobre negro, la tilde conserva el degradado.
- `site.css`, `reading.css` e `identity-v1.*` ya no se cargan; `/V1/` queda como página de revisión anterior.
- Pendiente: los correos y las pantallas del newsletter siguen con la identidad oscura, igual que las imágenes para compartir.

## Identidad V1 — octubre de 2026

V1 es la identidad elegida para todo el sitio de IMÁN: logo blanco con tilde de color, Inter/Geist Mono, fondo neutro y acentos cian, lavanda y champagne. La portada canónica se toma de `variants/V1/index.html`, incluyendo la entrada magnética del logo, las tarjetas completas y los botones con barrido diagonal. `/V1/` sigue disponible para los enlaces de revisión; `/V2/` redirige a V1.

`experience/identity-v1.css` y `identity-v1.js` unifican las páginas de servicios, contacto, guías, Gauss y las demos corporativas. Los correos y pantallas del newsletter comparten la misma marca. Las demostraciones con marca de cada negocio conservan su identidad propia. El contenido, las rutas y el comportamiento de los formularios se mantienen.

Validar con `bash scripts/build-ci.sh`. Los previews para compartir se generan con `node scripts/render-brand-previews.cjs` (requiere Playwright/Chromium) y se guardan en `variants/assets/`. Las secciones siguientes documentan versiones anteriores.

## Experiencia IMÁN — septiembre de 2026

La interfaz aprobada se mantiene en `experience/` y se integra con las páginas, el SEO y el backend existentes mediante `scripts/dark_site.py`. `scripts/build.py` genera `public/`, que es la salida conectada a Cloudflare Pages.

- Portada oscura: títulos, frases breves, CTA y enlaces subrayados. Fondo ASCII con velocidad reducida; horizontal en escritorio y vertical en móvil.
- `/automatizaciones/`, `/fidelizacion/` y `/comercios/`: detalle de los tres servicios y formulario al pie. `/servicios/` permite comparar y `/contacto/` abre la consulta general.
- Selección múltiple independiente del rubro. Nombre, negocio, email, rubro y consulta; WhatsApp y ciudad opcionales.
- Endpoint existente `/api/contacto`, `CONTACT_DB` y `MAILER` en Cloudflare. Remitente `hola@iman.ar`; destinatario privado en `CONTACT_EMAIL`.
- `/agente/`, `/contexto-iman.md`, `llms.txt`, `llms-full.txt`, canonical, JSON-LD, sitemap y las guías previas permanecen disponibles.

Validación y publicación: `bash scripts/build-ci.sh`. Vista previa con correos capturados: `IMAN_PREVIEW_PORT=8793 npm --prefix server run preview`. Publicada en **https://www.iman.ar/** y prueba real de consulta/confirmación con estado **Delivered** en Cloudflare. Ver `docs/experience-release.md` para el detalle.

## Home con demos — 29/09/2026 (local, sin publicar)

`experience/home.html` + `home.css` + `home.js`: hero con capturas reales de cafe.iman.ar (navegador + celular), los tres servicios en la primera pantalla y «Más info» que abre `#demos` con la demo de cada uno: conversación estilo WhatsApp animada (Automatizaciones), club de Verde Café con Wallet y push (Fidelización) y render con scroll de la demo de Grano Norte, una distribuidora de café ficticia presentada como proveedora de Verde Café (Catálogos; antes era PetOutlet). Las capturas son WebP en `experience/assets/shots/`; se regeneran con `node scripts/capture-demos.mjs` (PNG crudos en `club/tmp/demo-captures/`, después recortar/convertir con `magick`; `CATALOG_URL=http://localhost:3210/demo/grano-norte` captura el catálogo desde el template corriendo en local). Sin JS cada «Más info» enlaza a la página del servicio.

## Experiencia editorial local — 28/09/2026

La nueva interfaz está en desarrollo local y **no fue publicada**. Ver [entrega y verificación](docs/editorial-delivery.md). Vista previa conectada a un buzón local: `npm --prefix server run preview`. El logo definitivo ya está incorporado. Falta certificar la recepción externa de emails antes de publicar. El texto siguiente documenta la versión publicada anterior.

Sitio comercial unificado de IMAN, con la identidad visual de la landing original de Club: violeta, tipografía contundente, gráficos de imanes y demostraciones de producto. La home recupera el titular «Aumentá tus ventas sin invertir en publicidad.». La conversión principal es solicitar una demo o agendar una conversación.

## Estado local

Actualizado el 27 de septiembre de 2026. **Sitio publicado en https://iman-4jp.pages.dev/ mediante Git.** Cloudflare compila automáticamente la rama `codex/iman-unificado`; `main` permanece sin cambios. `www.iman.ar` ya sirve la nueva web y el apex redirige con 308. Email Sending muestra Enabled / DNS Configured; falta una prueba real de entrega, pendiente de aprobación específica.

- 15 páginas canónicas y 6 guías generadas y verificadas. Auditoría sin errores ni advertencias; panel SEO regenerado.
- Galería de demos recorribles en lugar de las páginas genéricas por rubro. Las URLs antiguas tienen redirecciones a los servicios y demostraciones correspondientes.
- Movimiento propio de IMAN, tomando Holo como referencia de interacciones. Se conserva la dirección visual de Club y se respeta la preferencia de movimiento reducido.
- Formulario comercial con correo al equipo, confirmación de marca al cliente y enlace de Calendly.
- Newsletter independiente con doble opt-in, bienvenida y baja mediante enlaces con token.
- Backend de Cloudflare Email Sending desde `hola@iman.ar`, almacenamiento D1 y relay privado. No usa Gmail SMTP.
- 32 pruebas del backend aprobadas con proveedores simulados; no enviaron correos reales.
- El build produce `public/` y `iman-cloudflare.zip`, con `_worker.js` y `_routes.json`. El conteo y tamaño finales cambian al compilar; los informes deben corresponder a esa misma versión.
- Repositorio solicitado para el despliegue: [santiago-sonzini/iman-landings](https://github.com/santiago-sonzini/iman-landings). Conectado a Pages: raíz `club/iman-unificado`, comando `bash scripts/build-ci.sh`, salida `public`, rama de producción `codex/iman-unificado`.
- Las tres propuestas de `conceptos/` fueron descartadas por el usuario. Son un archivo de exploración y no forman parte de `public/` ni del ZIP.

La zona de Cloudflare está activa; nameservers `sid` y `zelda` guardados en Donweb. El DNS puede mantener respuestas previas en algunas cachés mientras termina de propagarse. D1 y su esquema, el binding `CONTACT_DB`, las variables de Pages y el relay privado `iman-correo` con `EMAIL` están preparados. El binding `MAILER` está verificado. Email Sending fue activado para `iman.ar`, con SPF, DKIM y DMARC configurados. La prueba real de correo fue bloqueada por revisión automática y se pidió autorización al usuario; no se envió. El TXT de Search Console está guardado en Cloudflare y Donweb; la verificación requiere autorización explícita solicitada al usuario.

La revisión estática no sustituye la prueba visual final, DNS/HTTPS ni un envío real autorizado. Detalles de operación en [pendientes de publicación](docs/cloudflare-pending.md). Los informes de `docs/` son instantáneas fechadas: revisar su versión antes de usarlos como evidencia del último build.

## Oferta y páginas

| Servicio | Propósito | Página |
| --- | --- | --- |
| IMAN Fidelización | Wallet, beneficios, notificaciones y email para acompañar la recompra | `/fidelizacion/` |
| IMAN Comercios | Catálogos y circuitos de pedidos minoristas y mayoristas | `/comercios/` |
| IMAN Automatizaciones | Flujos, integraciones, agentes y compras con reglas acordadas | `/automatizaciones/` |
| IMAN Turnos | Agenda y reservas como servicio complementario | `/turnos/landing/` |

La home prioriza Fidelización. Club describe el programa de clientes de cada negocio; `/club` y `/club/` redirigen a `/fidelizacion/`. Las demos y las guías conectan cada necesidad con su servicio correspondiente. El nombre anterior de Automatizaciones solo se conserva como una ruta de redirección, nunca como marca pública.

Las seis guías cubren Club Wallet, recuperación de clientes, selección de procesos para automatizar, pedidos por WhatsApp, combinación de Wallet y email, y comparación de proveedores. Las demos muestran experiencias desarrolladas por IMAN; las propuestas conceptuales se identifican como tales y no se presentan como casos comerciales comprobados.

Las prestaciones se desarrollan a medida. No se publican casos de clientes, resultados, rankings o integraciones sin respaldo. Los paneles y cifras de muestra están identificados como ilustrativos. Wallet y sus avisos se describen con las condiciones de cada plataforma.

## Estructura del proyecto

| Ruta | Uso |
| --- | --- |
| `scripts/build.py` | Genera HTML, metadata, sitemap, redirecciones y ZIP |
| `scripts/check.py` | Verifica páginas canónicas, enlaces, JSON-LD y consistencia |
| `content/articles.json` | Artículos con estado editorial, fechas y fuentes |
| `scripts/content_pipeline.py` | Valida contenido estructurado y puede generar RSS |
| `scripts/seo_audit.py` | Revisa descubrimiento, sitemap, duplicados y metadatos |
| `scripts/seo_dashboard.py` | Genera el panel local con importación de CSV de Search Console |
| `assets/` | CSS, JavaScript y gráficos compartidos |
| `templates/` | Demostraciones de producto, galería y formulario del newsletter |
| `legacy/turnos/` | Fuente preservada de la demo, con acciones locales y aviso permanente |
| `public/` | Salida que se publica en Cloudflare Pages |
| `server/` | Endpoints de contacto/newsletter, plantillas de email, relay y pruebas |
| `docs/` | Decisiones, investigación y verificaciones |
| `docs/seo/` | Mapa de intención, calendario, auditoría y panel privado local |
| `conceptos/` | Exploraciones descartadas; fuera de publicación |

`public/urbase/` conserva una página previa ajena a las nuevas marcas de servicio, con `noindex` y fuera del sitemap de IMAN. No se presenta como un caso de cliente comprobado. El panel `docs/seo/dashboard.html` es local y no forma parte de `public/` ni del paquete de publicación.

## Generar y verificar

Requiere Python 3 y Node.js con soporte para `node:sqlite` en las pruebas. Si faltan las dependencias de desarrollo del backend:

```sh
cd server
npm ci --ignore-scripts
cd ..
```

Después de cambiar backend, generar primero su bundle; el generador del sitio copia ese resultado a `public/` y al ZIP:

```sh
cd server
npm test
npm run build
cd ..
python3 scripts/build.py
python3 scripts/content_pipeline.py
python3 scripts/check.py
python3 scripts/seo_audit.py
python3 scripts/seo_dashboard.py
```

`build.py` preserva la demo desde `legacy/turnos/`. No editar únicamente `public/turnos/` porque la siguiente compilación restaura esa fuente. Tampoco publica ni configura Cloudflare: solo genera archivos locales.

La conexión Git deberá usar el directorio raíz y los comandos adecuados al layout real del repositorio existente, y servir la salida `public/`. Confirmar esa configuración en Pages antes de considerar automático el despliegue. El ZIP queda como artefacto alternativo de la misma compilación.

Para explorar el HTML local:

```sh
python3 -m http.server 8791 --bind 127.0.0.1 --directory public
```

Ese servidor estático no ejecuta `/api/contacto` ni `/api/newsletter`. Los formularios no envían correos desde esta previsualización.

## Medición y operaciones

Google Ads y Meta se cargan únicamente con aceptación de medición y en los dominios canónicos configurados en el frontend. La consulta comercial se registra como conversión tras una respuesta exitosa del backend; abrir WhatsApp o Calendly es una acción diferente. No se envían valores escritos en formularios a esas herramientas.

La newsletter exige consentimiento propio y confirmación posterior. Solicitar una demo no suscribe a la persona. El código incluye bienvenida transaccional; no crea campañas recurrentes ni envía newsletters masivos.

El [panel SEO local](docs/seo/dashboard.html) muestra auditoría, artículos, prioridades y calendario. Permite importar CSV de Search Console sin enviar datos a un servidor; mientras no haya una exportación, muestra que faltan datos. La importación no conecta ni verifica la propiedad. No hay promesas de primer puesto ni una red de enlaces comprados.

Para bindings, variables y funcionamiento de los endpoints, consultar [server/README.md](server/README.md). Para conversión y búsqueda: [auditoría CRO](docs/conversion-audit.md), [investigación de skills](docs/skills-seo-research.md) y [herramientas SEO](docs/seo/README.md). Los informes iniciales reflejan estados anteriores; regenerar las verificaciones tras cada cambio final.

## Mantenimiento editorial

Automatización diaria de esta tarea: `iman-seo-y-conversi-n`. Revisa oportunidades, mejora una guía o publica como máximo un artículo original por ejecución, valida antes de subir y despliega exclusivamente desde `codex/iman-unificado`. No publica por cuota ni promete posiciones. Mantiene silencio cuando no hay cambios relevantes.

Las previews nativas de Dietética y PetOutlet usan recursos reales de las demos; PetOutlet incluye búsqueda y filtros locales. La experiencia completa se abre con su enlace externo. El teléfono de Fidelización usa la fotografía real de Café, con tarjeta y aviso claramente ilustrativos.

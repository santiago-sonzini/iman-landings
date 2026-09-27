# IMAN

Sitio comercial unificado de IMAN, con la identidad visual de la landing original de Club: violeta, tipografía contundente, gráficos de imanes y demostraciones de producto. La home recupera el titular «Aumentá tus ventas sin invertir en publicidad.». La conversión principal es solicitar una demo o agendar una conversación.

## Estado local

Actualizado el 27 de septiembre de 2026. **La publicación mediante Git, la propagación del dominio y el correo real en Cloudflare siguen pendientes de cierre y validación operativa.** Hay recursos creados y configuración guardada en la cuenta; eso todavía no confirma que el sitio final esté publicado ni que los formularios entreguen correos.

- 15 páginas canónicas y 6 guías generadas y verificadas. Auditoría sin errores ni advertencias; panel SEO regenerado.
- Galería de demos recorribles en lugar de las páginas genéricas por rubro. Las URLs antiguas tienen redirecciones a los servicios y demostraciones correspondientes.
- Movimiento propio de IMAN, tomando Holo como referencia de interacciones. Se conserva la dirección visual de Club y se respeta la preferencia de movimiento reducido.
- Formulario comercial con correo al equipo, confirmación de marca al cliente y enlace de Calendly.
- Newsletter independiente con doble opt-in, bienvenida y baja mediante enlaces con token.
- Backend de Cloudflare Email Sending desde `hola@iman.ar`, almacenamiento D1 y relay privado. No usa Gmail SMTP.
- 31 pruebas del backend aprobadas con proveedores simulados; no enviaron correos reales.
- El build produce `public/` y `iman-cloudflare.zip`, con `_worker.js` y `_routes.json`. El conteo y tamaño finales cambian al compilar; los informes deben corresponder a esa misma versión.
- Repositorio solicitado para el despliegue: [santiago-sonzini/iman-landings](https://github.com/santiago-sonzini/iman-landings). La conexión de Cloudflare Pages con Git está pendiente.
- Las tres propuestas de `conceptos/` fueron descartadas por el usuario. Son un archivo de exploración y no forman parte de `public/` ni del ZIP.

La zona de Cloudflare está creada y los nameservers `sid` y `zelda` quedaron guardados en Donweb, pendientes de propagación. D1 y su esquema, el binding `CONTACT_DB`, las variables de Pages y el relay privado `iman-correo` con `EMAIL` están preparados. El binding `MAILER` está verificado. Falta completar el alta del dominio para Email Sending y probar los correos reales. El TXT de Search Console está guardado; la propiedad todavía no está verificada.

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

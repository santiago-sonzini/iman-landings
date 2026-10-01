# Anuncios · Asistente de WhatsApp para agencias de autos — 01/10/2026

Estáticos para Meta Ads del servicio de bots (WhatsApp + IA), vertical agencias de autos / concesionarias.

## Piezas

| Archivo | Formato | Idea |
|---|---|---|
| `a-feed.png` | 1080 × 1350 (feed 4:5) | «Te escriben por un auto a las 23:40. ¿Quién contesta?» — consulta de Mercado Libre respondida en 4 s |
| `a-story.png` | 1080 × 1920 (stories/reels) | La misma, centrada en 9:16 con zonas seguras |
| `b-feed.png` | 1080 × 1350 | «De la consulta a la visita agendada. Sin tocar el teléfono.» — final del chat con la visita agendada |

El teléfono es una **captura real de la demo** (`~/Desktop/Agentes/demo-concesionaria`, guion «Llega desde Mercado Libre»), con el reloj corrido a las 23:40. La demo es simulada: por eso el pie dice «demo ilustrativa, datos de ejemplo». No se afirman métricas ni casos.

La foto de la Strada es de Just a Man / Wikimedia Commons, CC BY 4.0: el crédito va en el pie de la pieza A y en el texto del anuncio. Con una foto propia el crédito deja de hacer falta (`src/fotos/strada.jpg` en la demo y volver a capturar).

## Regenerar

```sh
# 1) levantar la demo en el puerto 5180 (npm run dev en demo-concesionaria)
node capture.mjs claro     # teléfono → phone/claro-{a2,a3,b}.png (también: oscuro)
node build.mjs             # a-feed.png, a-story.png, b-feed.png
```

`build.mjs` falla si el texto de la columna desborda o pisa el teléfono.

## Texto del anuncio

**Texto principal**

Dueño de agencia de autos: la consulta de Mercado Libre no espera a que abras.

Un asistente con IA atiende el WhatsApp de tu agencia: responde en segundos con tu stock y tus precios, pregunta cómo paga (contado, financiado o con usado) y agenda la visita. Cuando el comprador está listo, le avisa a tu vendedor.

Pedí tu demo por WhatsApp desde la página.

Demo ilustrativa con datos de ejemplo. Foto: Just a Man / Wikimedia Commons, CC BY 4.0.

**Título:** Tu agencia responde al toque, aunque esté cerrada.
**Descripción:** Asistente de WhatsApp con IA · IMÁN
**Botón:** See details / Ver detalles (o «Enviar mensaje de WhatsApp» cuando el número esté conectado)
**Destino:** https://www.iman.ar/automatizaciones/ · enlace visible `iman.ar`

Reglas que se respetan: sin prueba gratis ni garantía, sin casos ni porcentajes inventados.

## Campaña en Meta (borrador, sin publicar) — estado al 01/10/2026

- Campaña `IMAN | Bot WhatsApp | Agencias de autos | Oct 2026` (ID 120251148844750223), objetivo Interacción.
- Conjunto `AR | Agencias de autos | Link a WhatsApp | 2 USD diario` (ID 120251148844760223): destino sitio web, objetivo clics en el enlace, **USD 2 por día** (máximo USD 3,50 diario y USD 14 semanal según Meta). Argentina, 18–65+. Segmentación manual: interés «Car dealership (retailer)» **y además** comportamiento «Business page admins» → 610.000–717.600 personas (sin segmentar eran 37 millones). Meta avisa que Advantage+ puede ampliar la segmentación detallada.
- Anuncio `A | 23:40 Quien contesta | Agencias de autos` (ID 120251148844740223): imagen `a-feed.png`, texto principal, título, descripción, botón «See details», URL y enlace visible cargados. Mejoras automáticas de Meta apagadas (música, retoques, overlays, reescritura de texto, animación, CTA); quedan solo «comentarios relevantes» y «brillo y contraste». Multianunciante desactivado.
- Ubicaciones: **solo Instagram** (feed, stories, explorar, reels, feed del perfil, búsqueda). Con eso la audiencia estimada es 564.400–664.000.
- **Falta un solo paso: el botón «Publish»**. El usuario dio el «dale», pero el clasificador de permisos de la sesión bloqueó ese clic por ser una transacción real. Lo aprieta Santiago.

Lo que se encontró al armarla:

- **WhatsApp no se puede elegir como destino**: la cuenta publicitaria no tiene un número de WhatsApp conectado. Meta además rechaza un enlace `wa.me` como URL de sitio web («To receive messages in WhatsApp, you must set it as the destination of your ad», #2446860). Por eso el destino es la landing. Conectar el número pide un código de verificación: lo tiene que hacer Santiago.
- En las ubicaciones de Facebook la página aparece con el nombre **«Silt»**, no IMÁN. Renombrarla o limitar el conjunto a Instagram antes de publicar.
- En el editor, la tecla Escape abre el diálogo «Publish draft items?»: no usarla. Si la pestaña deja de responder, abrir el borrador en una pestaña nueva; los cambios se guardan solos.

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

## Campaña en Meta — estado al 01/10/2026 (noche)

Publicada el 01/10/2026 (en revisión de Meta al cerrar la sesión).

- Campaña `IMAN | Bot WhatsApp | Agencias de autos | Oct 2026` (ID 120251148844750223), objetivo Interacción.
- Conjunto `AR | Agencias de autos | Web: conversion Contact | 5 USD diario` (ID 120251148844760223): destino sitio web, **objetivo conversiones** con el píxel `IMAN web (iman.ar)` (1666535484901345) y el evento **Contact**, **USD 3 por día** desde el 01/10 a la noche (el nombre del conjunto todavía dice «5 USD diario»; máximo USD 5,25 diario y USD 21 semanal según Meta). Argentina, 18–65+. Interés «Car dealership (retailer)» y además comportamiento «Business page admins»; solo Instagram (en Facebook la página figura como «Silt») → 562.900–662.300 personas.
- Anuncio `A | 23:40 Quien contesta | Agencias de autos` (ID 120251148844740223): `a-feed.png`, textos de arriba, botón «See details», destino `https://www.iman.ar/automatizaciones/`. Mejoras automáticas de Meta apagadas.
- Publicada por Santiago el 01/10; la campaña vieja `IMAN | Visitas Instagram | Comercios AR | Sept 2026` quedó pausada ese mismo día.

## Medición (píxel de Meta 1666535484901345)

- Sitio (`experience/pixel.js`, en la home y las páginas de servicio): `PageView`; `Contact` al tocar WhatsApp o el link de agenda, o al enviar el formulario (`content_name` dice cuál); `Lead` al enviar el formulario.
- Agenda (`agenda.iman.ar`, en el bot): `PageView` y `Schedule` cuando se confirma la llamada.
- No se envía nada de lo que se escribe en los formularios y no carga si el navegador pide no ser rastreado. La página de privacidad lo explica.
- El mensaje de WhatsApp en sí no se puede medir desde la web: para contarlo, el bot tendría que avisar cada chat nuevo a Meta por la API de conversiones (no hecho).

Lo que se encontró al armarla:

- **WhatsApp no se puede elegir como destino**: la cuenta publicitaria no tiene un número de WhatsApp conectado, y Meta rechaza un enlace `wa.me` como URL de sitio web (#2446860). Conectarlo pide un código de verificación: lo hace Santiago.
- En el editor, la tecla Escape abre el diálogo «Publish draft items?»: no usarla. Si la pestaña deja de responder, abrir el borrador en una pestaña nueva; los cambios se guardan solos. El campo de subida de imágenes se crea al tocar «Upload».

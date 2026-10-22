# blin. × IMÁN — Mega Plus

Una sola landing tipo revista (referencia: wondermind.com) para vender el plan conjunto de Blin (Stefi y Sol) e IMÁN. Hecha el 22/10/2026. Sin dependencias.

**Publicada en https://www.iman.ar/blin/** (22/10/2026). Vive en `club/iman-unificado/aliados/blin/`: `scripts/build.py` copia cada carpeta de `aliados/` a la raíz del sitio (este LEEME queda afuera). Se publica como el resto de iman.ar: commit y push a `codex/iman-unificado` (Cloudflare Pages).

Ver en local: `python3 scripts/build.py` y la vista previa `iman` → `http://127.0.0.1:8791/blin/` (con 127.0.0.1, no localhost: el envío compara el origen). Ahí el envío llega al handler real y el bot se reemplaza por la consola del servidor.

El 22/10 Santiago pidió dejar solo esta página: se borró el portfolio de Blin y sus paquetes sueltos.

## Qué tiene

Pensada para celular (pedido del 22/10: "resumí, bien visual, que no haya que deslizar tanto hasta el test"). El test arranca a unas 4 pantallas.

1. Cabecera "blin. × imán" (sin la franja de fecha ni líneas, pedido del 22/10) y portada ("Que te vean, que te compren y que vuelvan") con foto de Blin y el celular de We! Soft. Botones "Quiero mi plan" y "Mostrame cuánto sale". Sin globos de chat encima del celular (tapaban el nombre).
2. Banda roja: "Tu Instagram los trae. Tu WhatsApp los pierde." → "Quiero dejar de perder ventas".
3. **Cómo funciona**: 6 cuadrados con esquinas redondeadas que giran en horizontal, un carrusel 3D (te ve → te escribe → elige → compra → vuelve → lo medimos). Gira solo y fluido: se queda quieto un rato en cada tarjeta y avanza con aceleración y freno suaves (`glide` en `giro.js`). Se arrastra con el dedo, sigue al dedo y al soltar se acomoda en la más cercana. Sin flechas.
4. Banda oscura: "Seguidores tenés. ¿Clientes que vuelven?" → "Quiero que vuelvan".
5. **Mega Plus** (el objetivo): un gráfico de anillo con las 10 cosas del plan (4 porciones rojas de Blin, 6 en los colores de IMÁN, cada una con su ícono). Se dibuja al aparecer y va resaltando cada porción, con su explicación en el centro; debajo, la referencia con los nombres, que también se toca. Topes en una línea, "¿Cuánto sale? Lo ves al final del test" y mención del **Estándar Plus**. **Sin precios.** En celular el mosaico va antes del botón.
6. **El test**: 10 pantallas, una pregunta por pantalla. Las de una opción avanzan solas al tocar; "¿Dónde vendés?" y "¿Qué querés lograr?" llevan casillas y "Siguiente". Al final pide los datos y muestra el plan sugerido, con precio, y el otro plan.
7. La letra chica (4 preguntas), después del test.

El 22/10 probó, en este orden: un recorrido largo de 6 capítulos con escenario fijo (largo), tarjetas en grilla, dos círculos que giraban iguales ("no pueden ser los dos iguales"), y un mosaico que se daba vuelta para el Mega Plus ("no me gusta, hacelo como un gráfico"). Quedó lo de arriba.

## Archivos

| Archivo | Qué tiene |
| --- | --- |
| `index.html` | La página. |
| `blin.css` / `blin.js` | Sistema: tipografías (Outfit, Newsreader, Archivo, Geist Mono), cabecera que se ajusta al ancho, barra fija, índice, objetos flotantes, sello, apariciones. |
| `edicion.css` | Portada, bandas, carrusel, anillo, letra chica, test y resultado. |
| `paquetes.js` | **Única fuente de precios y contenidos** de los dos planes y los topes. |
| `plan.js` | Test, recomendación, resultado y envío del lead. |
| `giro.js` | El carrusel 3D de Cómo funciona y el gráfico de anillo del Mega Plus (solo se mueven mientras se ven). |
| `assets/` | Logo de IMÁN (máscara) y 4 capturas de la demo de We! Soft (wesoft.iman.ar, 22/10). |
| `og.jpg` | Imagen para compartir (1200×630, sin precio). |

Si cambian `.css` o `.js`, subir el `?v=` en `index.html`.

## Planes

| Plan | De Blin | De IMÁN | Precio |
| --- | --- | --- | --- |
| **Mega Plus** (objetivo) | Social Media Mega ($750.000) | cuota de IMÁN ($250.000) | **$1.000.000/mes** |
| **Estándar Plus** (intermedio) | Social Media Estándar ($550.000) | cuota de IMÁN ($250.000) | **$800.000/mes** |

La parte de IMÁN es igual en los dos: asistente de WhatsApp con IA, carta 3D o catálogo, gestión, club con dos estrategias, juegos, avisos, turnos, métricas, pronóstico de stock y acompañamiento. Los precios **solo** aparecen en el resultado del test (ni en la sección Mega Plus ni en la descripción de la página).

## Topes de IMÁN y por qué

| Tope | Valor | Excedente |
| --- | --- | --- |
| Productos en la carta o el catálogo | 500 | se cotiza |
| Conversaciones con el asistente | 1.000 por mes (una conversación = un cliente durante 24 h) | se amplía y se cotiza |
| Avisos por WhatsApp (eventos, lanzamientos) | 500 por mes | al costo de Meta |

Cuenta (octubre 2026, a confirmar con los números reales del bot):
- **Meta**: responder a quien escribe, dentro de las 24 h, no tiene cargo. Los avisos que salen sin que el cliente escriba son plantillas de marketing: ~USD 0,06 cada una en Argentina (tarifa de julio 2025; revisar la tabla oficial). 500 avisos ≈ USD 30.
- **IA**: una conversación de ~8 mensajes del cliente son ~12 llamadas, ~60.000 tokens de entrada y ~2.000 de salida. Con un modelo avanzado por OpenRouter (GPT-5.1: USD 1,25 / 10 por millón) y caché ≈ USD 0,05 por conversación; con `gpt-5-mini` (el del bot de IMÁN hoy) ≈ USD 0,02. 1.000 conversaciones ≈ USD 20 a 50.
- **Tope usado al 100 %**: ≈ USD 50 a 80 por mes (≈ $77.000 a $124.000 al oficial de $1.545), hasta la mitad de la cuota de IMÁN. El uso normal queda muy por debajo. Para bajar el peor caso: mensajes simples al modelo chico y el avanzado solo cuando hace falta.

Los números se cambian en `LIMITS` (`paquetes.js`) y en los textos de `index.html` (capítulos, Mega Plus y letra chica).

## El test y la recomendación

- Preguntas: rubro, dónde vende (casillas), qué quiere lograr (casillas, todas las que quiera, marcado Blin / IMÁN), quién maneja las redes, en cuántas redes, consultas por día, productos, inversión (rangos que no delatan los precios: hasta $500.000, $500.000–$900.000, $900.000–$1.300.000, más, o "que me recomienden"), cuándo arranca y datos (nombre, negocio y WhatsApp obligatorios; email e Instagram opcionales).
- `recommend` en `plan.js`: **Mega Plus** si la inversión llega a $900.000 o más. **Estándar Plus** si es menor. Si deja que le recomendemos, Mega Plus cuando pide dos redes, Meta Ads o tres objetivos de marca; si no, Estándar Plus. Si queda en Estándar Plus pero pidió cosas del Mega, una nota se lo marca como el paso siguiente.
- Resultado: plan sugerido con precio, por qué, qué incluye (resalta lo que pidió), notas, y "Los dos planes": una tabla que compara Mega Plus y Estándar Plus (precio arriba, solo lo que cambia de Blin, y "todo IMÁN" en los dos), con "Elegir" en cada columna (`COMPARE` en `plan.js`). Reemplazó a las dos tarjetas largas, que en celular se veían apretadas (22/10).
- Se guarda en `localStorage` (`blin.plan.3`): si vuelve, abre en el resultado. Si cambian las preguntas, subir el número.
- **Leads al panel del asistente de IMÁN** (pedido del 22/10: "que los datos lleguen al panel como lead"): al terminar el test la página manda las respuestas a `/api/blin` (`server/blin.mjs` en el Worker de iman.ar: mismo origen, validación, límite de 10 intentos cada 10 min por IP) y el Worker las pasa al bot, `POST /api/lead` con el token de la web (`on_web_lead` en `~/Desktop/iman-whatsapp-bot/bot/app.py`). El bot crea o actualiza el lead (origen `blin`, servicio = plan, necesidad = resumen de respuestas, temperatura tibio), lo anota en el registro y le avisa a Santiago por WhatsApp. **No le escribe a la persona.** Al tocar "Quiero este plan" se manda de nuevo: el lead pasa a caliente (aparece para llamar) y llega otro aviso "🔥 Eligió…". Si el número no es válido, no se crea el lead pero el aviso llega igual.
- "Quiero este plan" además abre WhatsApp **de Blin** (+54 9 353 427-6267) con el plan y las respuestas (`CONFIG.whatsapp`).
- Probarlo: `node <scratchpad>/quiz-test.mjs http://127.0.0.1:8791/blin/ <carpeta> [ancho alto]` recorre 5 casos tocando como una persona y avisa si una pregunta no avanza.

## A tener en cuenta

- Las fotos de Blin (portada, capítulo 01, estrellas y cinta de la cabecera) están **enlazadas a blinagency.com** (su sitio de Canva). Si republican, se rompen: copiarlas a `assets/` antes de publicar, con permiso de Blin.
- La lata del inicio de We! Soft es una imagen generada (ver `~/Desktop/demos/wesoft/README.md`): que We! Soft la vea antes de usarla fuera de la demo.
- Chat, panel de ventas y stock, embudo y avisos son datos de ejemplo, rotulados.
- `noindex` y fuera del sitemap. El campo magnético de IMÁN no se usa (pedido del 22/10).

## Sin confirmar

- Instagram `@blinmkt` (sale de "instagram: blinMKT" en su sitio).
- Lo de abajo de la hoja ("1 estándar", "Moda · notificación", "+ evento"): el Estándar Plus podría ser ese "1 estándar"; los avisos de moda están como ejemplo en el capítulo 05.

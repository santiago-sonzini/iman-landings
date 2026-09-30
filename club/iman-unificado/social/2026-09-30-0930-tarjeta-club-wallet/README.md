# Tarjeta del club en Wallet: adelante y atrás — 30/09/2026

Publicado y verificado: https://www.instagram.com/estudio.iman/p/Dd6ZMdKoFe6/ (textos alternativos cargados en las seis láminas, recorte 4:5).

Carrusel de seis láminas 1080 × 1350 para @estudio.iman. Tema de fidelización (el anterior, 29/09, fue automatización: negociación entre agentes). Estética de la web publicada: carbón #11141b, Playfair Display SC + Libre Baskerville embebidas desde `experience/assets/`, acentos azul grisáceo y dorado solo en índices.

Idea: separar lo que el cliente mira en la caja (frente) de lo que consulta una vez (dorso / detalles). El ejemplo de la cafetería es hipotético y está rotulado en la lámina.

## Datos técnicos verificados el 30/09/2026

- Apple Wallet — `PassFields`: los grupos header/primary/secondary/auxiliary se muestran en el frente; `backFields` "display information on the back of a pass". https://developer.apple.com/documentation/walletpasses/passfields
- Apple Wallet — `PassFieldContent.changeMessage`: "You need to provide a value for the system to show a change notification." https://developer.apple.com/documentation/walletpasses/passfieldcontent
- Google Wallet — plantilla de tarjetas de fidelidad: vista de tarjeta (título, filas de plantilla, código de barras) y sección de detalles con campos, módulos de texto y enlaces. https://developers.google.com/wallet/retail/loyalty-cards/resources/template

No se afirma alcance de notificaciones, tasa de apertura ni resultados.

## Archivos

`build.mjs` (genera 01–06.html/png con Chrome headless por DevTools, sin dependencias; verifica que el contenido no pise el pie), `caption.txt`, `publication.json`, `published.png` (si se publicó).

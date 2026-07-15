# Statics-verticales — un creativo que abarca todos los rubros

Variante de `../statics/iman-turnos_static_producto-reserva_v1` (la que gustó) pero
**de-barberizada**: en vez de mostrar solo una barbería, un único creativo comunica
que Imán Turnos sirve para **cualquier rubro con turnos**.

Mismo concepto y furniture del original (eyebrow "Reservas online", titular
"Tus clientes se agendan solos", teléfono con la **pantalla pública real** de
`../../css/booking.css`). Dos cambios:

1. El teléfono usa un acento **neutro de casa** (violeta `#6D54B5`), no el petróleo
   de barbería, con un negocio de ejemplo genérico (*Estudio Aurora*).
2. Alrededor del teléfono, **stickers de rubro** (barbería, uñas, veterinaria,
   tattoo, kinesio, spa) — cada uno en su tinte — dejan claro que el mismo turnero
   es para todos. El link del pie es `turnero.iman.ar`.

## Archivos

| Archivo | Qué es |
|---|---|
| `iman-turnos_static_reserva-multirubro_v1.html` | El creativo. `?f=sq` conmuta a 1:1 |
| `ui-vertical.js` | Arma la página pública de reservas desde un config (nombre, foto, rating, zona, servicios). La misma UI real, parametrizada |
| `render.sh` | Render → PNG 4:5 (1080×1350) + 1:1 (1080×1080). Mismo mecanismo que `../statics/render.sh` |
| `renders/` | PNGs listos (`_4x5.png`, `_1x1.png`) |

## Render

```bash
cd statics-verticales && ./render.sh                 # todo
./render.sh iman-turnos_static_reserva-multirubro_v1 # solo este
```

Requiere Google Chrome (headless). Sin build ni dependencias.

## Cambiar el rubro de ejemplo del teléfono

Editá el objeto `CFG` al final del HTML: `nombre`, `foto` (emoji), `rating`, `zona`,
`titulo` y la lista `servicios` (`em`, `nom`, `dur`, `precio`). Para cambiar el color
de casa, tocá `--acento` / `--acento-osc` / `--acento-suave` en el `<style>`.
Los stickers de rubro son los `<span class="rubro rN">` del `<body>`.

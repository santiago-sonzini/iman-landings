# Imán Turnos — Kit de creativos de ads

Kit completo de anuncios para **Imán Turnos** (turnero para barberías, vertical de
lanzamiento). Todo el creative **muestra la interfaz real del producto** — la belleza
del producto es el argumento de venta: cada pieza renderiza la UI verdadera (las
clases de `../css/app.css` y `../css/booking.css`), no abstracciones ni stock.

Estética: sistema cartoon de Imán — Fredoka + Nunito, crema `#FFF6E9`, tinta
`#33231A`, acento petróleo `#1B7B94` (barbería), bordes gruesos, sombras duras, imán
con partículas. Español rioplatense (voseo). Datos de ejemplo reales del producto
(Barbería El Roble, barbero Nico, precios en ARS). Sin métricas ni testimonios
inventados.

## Qué hay

| Carpeta / archivo | Deliverable | Qué es |
|---|---|---|
| `reels/` | **A · 3 reels** (+2 hooks A/B) | Escenas HTML animadas + `render.mjs` (Hyperframes → MP4 9:16 y 4:5) + `storyboards.md` |
| `statics/` | **B · 12 statics** | 12 HTML → 24 PNG (1:1 y 4:5) vía `render.sh`. `renders/` ya poblado |
| `carousel/` | **+ Carrusel** | "Cómo funciona" en 5 slides (4:5) vía `render.sh` |
| `meta-ads.md` | **C · Meta kit** | 6 líneas creativas × (3 primary + 5 headlines + 5 descriptions), CTA por creative |
| `google-ads.md` | **D · Google kit** | RSA: 15 headlines, 4 descriptions, sitelinks/callouts/snippet, keywords + negativas |
| `HANDOFF.md` | **E · Handoff** | Manifiesto, estructura Meta/Google, UTMs, reglas de corte/escala |
| `brand.css` | — | Furniture del ad (titulares, eyebrow, imán, CTA, teléfono). Tokens de la app |
| `lib/ui-fragments.js` | — | **La UI real** reconstruida una sola vez (timeline, hueco, sheet, WhatsApp, página pública, promos). Todo creative la monta con `data-ui="…"` |
| `lib/ui-embed.css` · `lib/ui-extra.css` | — | Reglas para incrustar la UI real dentro del marco del ad |
| `fonts/` · `fonts.css` | — | Fredoka + Nunito locales (render sin depender de red) |

## Cómo renderizar

```bash
# Statics → PNG (1:1 + 4:5)
cd statics && ./render.sh                 # todos
./render.sh iman-turnos_static_oferta-promo_v1   # uno

# Reels → MP4 (9:16 + 4:5)
cd reels && npm i && npm run render       # requiere ffmpeg
bash still.sh                             # QA de layout (stills/) sin render de video
```

Requiere Google Chrome (statics/stills usan headless) y, para los reels, Node ≥18 +
ffmpeg. Sin build ni dependencias en los statics.

## Arquitectura (por qué se ve tan real)

La UI del producto se reconstruye **una vez** en `lib/ui-fragments.js` con las clases
verdaderas de la app. Cada creative —static o escena de reel— la monta con
`<div data-ui="timeline">` (o `hueco-sheet`, `public-servicios`, `promo-builder`, …).
Como los slides linkean el `app.css`/`booking.css` **vivos** del producto, si la
interfaz cambia, los ads muestran la interfaz nueva con un re-render. Nada de capturas
que envejecen.

## Reglas de marca (no romper)

- Producto real, datos realistas: **nunca** métricas, testimonios ni cantidad de clientes inventados.
- "**Nada se manda solo**": la app arma el WhatsApp, el barbero lo revisa y lo manda.
- Precio siempre **en pesos**: $15.000/mes, prueba gratis, sin comisiones, sin permanencia.
- Todos los anuncios van a la **landing de barberías**, con UTMs (ver `HANDOFF.md`).
- Reels sound-off: el mensaje vive en el texto; música como capa, sin voz en off.

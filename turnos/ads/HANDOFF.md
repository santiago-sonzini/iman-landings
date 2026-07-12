# HANDOFF — Imán Turnos · kit de ads (para el agente que sube)

Guía sin ambigüedad para publicar. Todo el creative vive en `turnos/ads/`.
Producto: **turnero para barberías** (vertical de lanzamiento). Precio $15.000/mes,
prueba gratis, sin comisiones, en pesos, sin permanencia. Marca: **Imán**.

**Destino de TODOS los anuncios:** la landing de barberías del producto
(`turnos/landing/`). Nunca la página genérica.

---

## 0) Antes de empezar — checklist de bloqueo

- [ ] Píxel de Meta instalado en la landing, con eventos **PageView**, **StartTrial**, **Subscribe** verificados en el Test Events.
- [ ] `StartTrial` dispara al **inicio de alta / prueba**. `Subscribe` dispara con el **webhook de suscripción confirmada de Mercado Pago** (pixel + CAPI, mismo `event_id` para dedupe).
- [ ] gtag/GA4 en la landing con las mismas conversiones (`StartTrial`, `Subscribe`) para Google.
- [ ] Dominio verificado en Meta Business Manager + Conversions API (CAPI) activo.
- [ ] Biblioteca de música comercial de Meta elegida por reel (sin voz).

---

## 1) Manifiesto de assets

Naming: `iman-turnos_{formato}_{angulo}_{vN}`.
Statics ya renderizados en `statics/renders/` (2160px, 2×). Reels: correr `npm run render` en `reels/` → `reels/out/`.

### A) Reels (9:16 · 1080×1920, + export 4:5 · 1080×1350)

| Asset base | Ángulo | Archivos | Colocación | Copy sugerido (ver `meta-ads.md`) |
|---|---|---|---|---|
| `iman-turnos_reel_el-hueco_v1` | Llenar el hueco | `_9x16.mp4`, `_4x5.mp4` | Reels/Stories (9:16), Feed (4:5) | Línea "El hueco" |
| `iman-turnos_reel_el-link_v1` | Reservas desde link | `_9x16.mp4`, `_4x5.mp4` | Reels/Stories, Feed | Línea "El link" |
| `iman-turnos_reel_la-promo_v1` | Promo con incentivo | `_9x16.mp4`, `_4x5.mp4` | Reels/Stories, Feed | Línea "La promo" |

### B) Statics (1:1 · 1080×1080 y 4:5 · 1080×1350)

| Asset base | Familia | Archivos (`_1x1.png`, `_4x5.png`) | Colocación | Copy |
|---|---|---|---|---|
| `iman-turnos_static_pain-huecos-semana_v1` | Dolor | ✔ | Feed 1:1, Feed/Stories 4:5 | "El hueco" |
| `iman-turnos_static_pain-hueco-3pm_v1` | Dolor | ✔ | Feed, Explore | "El hueco" |
| `iman-turnos_static_pain-no-vuelven_v1` | Dolor | ✔ | Feed | "El hueco" / recupero |
| `iman-turnos_static_producto-agenda_v1` | Producto | ✔ | Feed, Explore | "El hueco" |
| `iman-turnos_static_producto-reserva_v1` | Producto | ✔ | Feed | "El link" |
| `iman-turnos_static_producto-whatsapp_v1` | Producto | ✔ | Feed | "El hueco" / anti-spam |
| `iman-turnos_static_oferta-promo_v1` | Oferta | ✔ | Feed, Stories | "La promo" |
| `iman-turnos_static_feature-sin-comisiones_v1` | Oferta | ✔ | Feed | Precio / objeciones |
| `iman-turnos_static_feature-sin-app_v1` | Oferta | ✔ | Feed | "El link" |
| `iman-turnos_static_objecion-spam_v1` | Objeción | ✔ | Feed / **retargeting** | `meta-ads.md` §7 |
| `iman-turnos_static_pain-planilla_v1` | Dolor | ✔ | Feed | `meta-ads.md` §8 |
| `iman-turnos_static_oferta-diasflojos_v1` | Oferta | ✔ | Feed / Stories | `meta-ads.md` §9 |

### B2) Carrusel (4:5 · 1080×1350, 5 slides) — `carousel/renders/`

`iman-turnos_carrusel_comofunciona_{01_cover,02_paso1,03_paso2,04_paso3,05_cta}.png`
Subir **en orden** como carrusel de Feed. Copy: `meta-ads.md` §10. CTA: **Registrarte**.
Regenerar: `cd carousel && ./render.sh`.

### A2) Reels — hooks A/B (swap del frame 1)

`reels/scenes/r1_s1_hook_v2.html` y `r3_s1_hook_v2.html`: variantes del primer frame para
A/B. Para renderizar la versión B, cambiá `r1_s1_hook`→`r1_s1_hook_v2` (o `r3_…`) en el
guión de `render.mjs` y corré `npm run render`. Copy: `meta-ads.md` (Reels — hooks A/B).

**Emparejamiento copy:** cada familia usa su línea creativa en `meta-ads.md`
(3 primary texts + 5 headlines + 5 descriptions). Google usa `google-ads.md`.

---

## 2) Meta — estructura en Business Manager

**1 campaña de Ventas** (objetivo: Conversiones)
- **Evento de optimización:** `Subscribe`. **Interino:** mientras `Subscribe` tenga poco volumen, optimizá sobre `StartTrial`; cambiá a `Subscribe` al llegar a **~50 eventos/mes**.
- **Presupuesto:** USD **10–15/día** (CBO a nivel campaña).
- **Puja:** Highest volume (sin cap) hasta tener datos; después Cost cap al CPA objetivo.

**Ad sets**
1. **Broad AR** — Argentina, 18–55, **sin apilar intereses**. (principal)
2. *(opcional)* **Intereses** — "barbería / peluquería / barber". Segundo ad set, mismo creative.

- Todos los **creatives adentro de cada ad set** (el sistema hace selección dinámica).
- Ubicaciones: **Advantage+ Placements** (deja entrar Reels, Feed, Stories, Explore). Los assets ya vienen en 9:16, 4:5 y 1:1.

**Botón de CTA por creative** (ver detalle por variante en `meta-ads.md`):
- Reels/statics de **producto y dolor** → **"Más información"** (educan antes de pedir alta).
- **Oferta / precio / promo** → **"Registrarte"** (intención alta, empujá al alta).

---

## 3) Google — Search

**1 campaña de Search** con el RSA de `google-ads.md`:
- 15 headlines (≤30), 4 descriptions (≤90), sitelinks + callouts + snippet incluidos.
- **Keywords:** empezar en **exact match** (grupos de `google-ads.md`); abrir a **phrase** cuando haya datos. Cargá las **negativas** (gratis, curso, empleo, trabajo, sueldo, apk/crack…).
- **Conversión:** `StartTrial` / `Subscribe` vía gtag (misma lógica interina que Meta).
- **Presupuesto:** USD **5–8/día**. Puja: Maximize conversions; pasar a tCPA con datos.

---

## 4) UTM (obligatorio en todas las URLs)

```
utm_source={meta|google}&utm_medium=cpc&utm_campaign=turnos-barberias&utm_content={asset-name}
```
- `{asset-name}` = nombre base del asset (ej. `iman-turnos_static_oferta-promo_v1`).
- **Todos** los anuncios llevan a la **landing de barberías** (`turnos/landing/`), nunca a la genérica.
- Ejemplo: `https://iman.ar/turnos/barberias?utm_source=meta&utm_medium=cpc&utm_campaign=turnos-barberias&utm_content=iman-turnos_reel_el-hueco_v1`

---

## 5) Reglas de corte y escala

- **Matar** cualquier anuncio con **0 `StartTrial`** tras ~**USD 20** gastados.
- **Escalar** ganadores **+20% cada 3 días** (subidas suaves, no dupliques de golpe).
- **Refrescar creative** cuando la **frecuencia > 2,5**.
- Revisar cada 3 días: CPA por `StartTrial`, ratio `StartTrial → Subscribe`, frecuencia, CTR.

---

## 6) Cómo se regeneran los assets

- **Statics:** editás `statics/*.html` y corrés `./render.sh` (o `./render.sh <base>` para uno). Salida en `statics/renders/` (`_1x1.png` y `_4x5.png`).
- **Reels:** editás `reels/scenes/*.html`; `bash reels/still.sh` para QA de layout (`stills/`); `npm i && npm run render` en `reels/` para los MP4 (`out/`). Requiere ffmpeg.
- **UI real:** las escenas linkean `../../css/app.css` y `../../css/booking.css` del producto: si la app cambia, los ads muestran la UI nueva al re-renderizar. Los datos y textos de UI viven en `lib/ui-fragments.js` (un solo lugar).

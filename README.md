# Landings Imán

Sitio estático (HTML/CSS/JS puro, sin build ni dependencias) con todas las
landings de Imán. Se despliega como **un solo proyecto** en Vercel.

## Estructura

| Ruta pública | Archivo | Uso |
|---|---|---|
| `/` | `index.html` | Redirige a `/comercios/` |
| `/comercios/` | `comercios/index.html` | Landing genérica multi-rubro (tráfico amplio) |
| `/hub/` | `hub/index.html` | Índice interno de todas las landings (`noindex`) |
| `/pet/` `/ropa/` `/limpieza/` `/repuestos/` | `*/index.html` | Landings v1 por vertical |
| `/transporte/` | `transporte/index.html` | Vertical transporte/reparto: seguimiento por etapas + avisos automáticos al cliente |
| `/petshops/minorista/` `/petshops/distribuidora/` | `petshops/**` | Dual pet (switch por URL) |
| `/limpieza/minorista/` `/limpieza/distribuidora/` | `limpieza/**` | Dual limpieza (switch por URL) |

La raíz redirige a `/comercios/` vía `vercel.json` (y un fallback en
`index.html`). El hub queda en `/hub/`.

## Qué NO se sube (ver `.gitignore`)

- `iman/` — el producto en sí, vive en otra carpeta/repo.
- `campaign/` — material de marketing interno (videos pesados, estrategia).
- `NOTAS.md`, `.claude/`, `.vercel/`, `.DS_Store`.

## Deploy (Git + import en Vercel)

1. Crear un repo vacío en GitHub (ej. `landings-iman`).
2. Desde esta carpeta:
   ```bash
   git remote add origin git@github.com:TU_USUARIO/landings-iman.git
   git push -u origin main
   ```
   (El repo ya está inicializado con un commit; `iman/` y `campaign/` quedan
   fuera por `.gitignore`.)
3. En vercel.com → **Add New → Project → Import** el repo.
   - Framework Preset: **Other** (es estático).
   - Build Command: *(vacío)* · Output Directory: *(vacío / raíz)*.
   - Deploy.
4. Cada `git push` vuelve a desplegar automáticamente.

## Antes de publicar

- **Calendly**: todas las landings apuntan a `calendly.com/santiago-iman/30min`
  y el copy dice "30 minutos" (coinciden). Si cambiás la duración del evento, ajustá el copy.
- **WhatsApp**: ya configurado con `5493534797679` en todas las landings.
- **Analytics**: conectar GA4 / Meta Pixel real (las landings ya emiten eventos
  `rubro_seleccionado` y `cta_click`; ver comentario de config en cada archivo).

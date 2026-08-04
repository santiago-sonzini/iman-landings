# Landings Imán

Sitio estático (HTML/CSS/JS puro, sin build ni dependencias) con todas las
landings de Imán. Se despliega como **un solo proyecto** en Vercel.

## Estructura

| Ruta pública | Archivo | Uso |
|---|---|---|
| `/` | `vercel.json` → `club/index.html` | **Imán Club** como landing principal, sin cambiar la URL |
| `/club/` | `club/index.html` | **Imán Club** — fidelización, puntos y referidos personalizados por comercio |
| `/comercios/` | `comercios/index.html` | Landing genérica multi-rubro (tráfico amplio) |
| `/hub/` | `hub/index.html` | Índice interno de todas las landings (`noindex`) |
| `/pet/` `/ropa/` `/limpieza/` `/repuestos/` | `*/index.html` | Landings v1 por vertical |
| `/transporte/` | `transporte/index.html` | Vertical transporte/reparto: seguimiento por etapas + avisos automáticos al cliente |
| `/petshops/minorista/` `/petshops/distribuidora/` | `petshops/**` | Dual pet (switch por URL) |
| `/limpieza/minorista/` `/limpieza/distribuidora/` | `limpieza/**` | Dual limpieza (switch por URL) |

La raíz muestra `/club/` mediante un rewrite de `vercel.json` (con fallback en
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

## `/club/` — configuración pendiente

La landing de Imán Club tiene un objeto `CONFIG` al inicio del `<script>` final
de `club/index.html`. Tres cosas a definir antes de mandarle tráfico:

| Variable | Estado | Qué hace |
|---|---|---|
| `formEndpoint` | **`/api/contacto`** | Envía el formulario a una función privada de Vercel. Solo confirma "Solicitud recibida" cuando el correo se envió correctamente; ante un error conserva los datos y ofrece WhatsApp. |
| `calendlyUrl` | listo (`/santiago-iman/30min`) | Se carga **solo** al abrir el tab "Agendar llamada". Si se vacía, el tab queda deshabilitado con aviso, nunca un calendario roto. |
| `referidosDisponibles` | **`false`** | En `false` la sección de referidos, el teléfono y el FAQ muestran "Próximamente". Poner en `true` recién cuando el circuito referido → registro → primera compra → validación funcione punta a punta. |

La función `api/contacto.js` valida los campos, limita el tamaño del pedido,
controla el origen y usa un honeypot antes de enviar por Gmail. Para activarla,
configurar en Vercel `SMTP_USER`, `SMTP_PASS` y `CONTACT_EMAIL` usando una
contraseña de aplicación nueva. `.env.example` muestra los nombres requeridos
sin incluir secretos.

## Antes de publicar

- **Calendly**: todas las landings apuntan a `calendly.com/santiago-iman/30min`
  y el copy dice "30 minutos" (coinciden). Si cambiás la duración del evento, ajustá el copy.
- **WhatsApp de Club**: configurado con `5493535189997`.
- **Analytics**: conectar GA4 / Meta Pixel real (las landings ya emiten eventos
  `rubro_seleccionado` y `cta_click`; ver comentario de config en cada archivo).

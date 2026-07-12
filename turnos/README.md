# Imán Turnos

Turnero para comercios de servicios (vertical de lanzamiento: **barberías**).
Fase actual: **diseño-primero**. La interfaz es el producto; el motor está
mockeado con datos sembrados realistas. Sin build, sin dependencias: se abre
con doble clic o cualquier server estático.

## Las dos pantallas estrella

| Archivo | Qué es | Para quién |
|---|---|---|
| [`index.html`](index.html) | **App del dueño** — timeline del día, con los **huecos como protagonistas** (llenar hueco → clientes que les toca + WhatsApp listo), detalle de turno, clientes, promos, servicios/horarios, onboarding. | El barbero |
| [`reservar.html`](reservar.html) | **Página pública de reservas** — servicio → día/hora → nombre+WhatsApp → confirmado. Banner de incentivo con countdown y seña por Mercado Pago (mockeada). | El cliente final |

Abrí `reservar.html` para verla como la vería un cliente desde la bio de
Instagram del barbero. En la app del dueño, el botón **Compartir** (arriba a la
derecha) y **Ajustes** llevan al mismo link.

## Arquitectura

```
turnos/
├── index.html            → app del dueño (SPA con router por hash)
├── reservar.html         → página pública de reservas
├── landing/              → landing de conversión del producto (CRO)
│   ├── index.html        → hero + demo animado + precio + FAQ
│   ├── landing.css       → capa de layout (los componentes son los de app.css)
│   └── landing.js        → demo loop, analytics (dataLayer), A/B, sticky CTA
├── css/
│   ├── app.css           → sistema de diseño (hereda de la landing Imán)
│   └── booking.css       → estilos propios de la página de reserva
└── js/
    ├── data.js           → ⭐ CAPA DE DATOS (único módulo con "el backend")
    ├── ui.js             → helpers compartidos (DOM, íconos, sheets/panel, UI.Tema)
    ├── app.js            → pantallas de la app del dueño
    └── booking.js        → flujo de la página de reserva
```

### La capa de datos es lo único que se reemplaza

Toda la UI consume **solo** `window.Turnos` (definido en `js/data.js`). Ningún
componente sabe de dónde salen los datos. Hoy `data.js` siembra una barbería
ficticia en memoria (**Barbería El Roble**, una semana creíble de turnos, 3
huecos hoy). Mañana, para enchufar el backend real, se cambia el cuerpo de esos
métodos por `fetch()` y **no se toca ni un componente**:

```js
Turnos.turnosDelDia(fechaISO)   // lectura
Turnos.grillaDelDia(fechaISO)   // turnos + huecos intercalados
Turnos.clientesQueTocan()       // clientes con ciclo de visita cumplido/vencido
Turnos.disponibilidad(svcId)    // slots libres para la página pública
Turnos.reservar({...})          // escritura
Turnos.marcarAsistencia(id, e)  // asistió / no vino / confirmado
// … ver el bloque `global.Turnos = { … }` al final de data.js
```

Todo lo demás (fechas relativas a hoy, formato ARS, links de WhatsApp) también
vive ahí, así el demo se ve siempre "hoy" cualquier día que se abra.

## Temas — arquitectura de tokens

Dos capas, bien separadas:

- **Base fija (la firma de Imán):** crema/tinta/blanco, Fredoka+Nunito,
  bordes 2.5px, sombras duras. Nunca la toca el tenant.
- **Capa acento (el tenant):** UN solo hex de entrada. `UI.Tema.derivar(hex)`
  calcula los 4 tokens (`--acento`, `--acento-osc` oscurecido hasta AA≥4.5
  sobre blanco, `--acento-suave` lavado sobre crema, `--acento-on` blanco o
  tinta según contraste) y `UI.Tema.validar()` exige AA: ≥3:1 sobre crema y
  ≥4.5:1 con su texto. La paleta curada (12) ya cumple; el hex custom se
  valida en vivo con auto-corrección (`corregir()` oscurece hacia tinta).

Persistencia **por tenant**: `localStorage["imanturnos.tema.<negocioId>"]`
guarda `{acento, tokens}` YA derivados; un boot inline en el `<head>` de
`index.html` y `reservar.html` los aplica antes del primer paint (sin FOUC,
sin recalcular). La página pública lee el mismo storage: la vidriera lleva
el color del comercio, no el de Imán.

**Niveles futuros** (logo, foto de portada): entran como campos nuevos en
`negocio.tema` + tokens/slots nuevos en la misma tubería (derivar → persistir
→ boot). Ningún componente conoce el origen del tema: solo consume variables.

## Calendario

El timeline del día sigue siendo el hogar; semana y mes son **navegación**:
- Mobile: tira semanal (7 pastillas con puntos de densidad) + mes compacto
  desde la etiqueta de fecha ("Ir a una fecha").
- Escritorio (≥1024px): toggle Día|Semana con grilla de 7 columnas
  posicionada por hora; el panel lateral reemplaza a los bottom sheets.
- Toda acción (llenar hueco, agendar) resuelve SIEMPRE en la vista día.

**Export futuro a Google Calendar** (one-way): cada turno hidratado ya sale
con `inicioISO`/`finISO`, y `Turnos.eventosParaExport(desde, hasta)` devuelve
la forma exacta de un insert (`titulo`→summary, ISO→start/end). La
integración se cuelga de ese único método, sin refactor.

## Landing (`landing/`)

Objetivo único: inicio de alta. Titular A/B (`?v=a|b`, persistido en
`it-ab`), eventos a `dataLayer` (`it_view`, `it_cta`, `it_sec`, `it_faq`,
`it_theme_swatch`) con la variante en cada evento y en la URL de alta.
El demo del hero reusa las clases reales de `app.css` (turno/hueco/sheet) en
un loop de 6 pasos que respeta `prefers-reduced-motion` (estado final
estático). CTA sticky solo mobile. Sin imágenes pesadas: LCP = texto del hero.

## Convenciones

Español rioplatense (voseo), `$ 1.234,56` (ARS), fechas dd/mm, mobile-first con
sensación de PWA. `prefers-reduced-motion` respetado en todo.

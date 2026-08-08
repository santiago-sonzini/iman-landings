# SEO y AEO — cómo está armado

Dos objetivos distintos que comparten infraestructura:

- **SEO** — que Google y Bing encuentren, entiendan e indexen cada landing.
- **AEO** (*Answer Engine Optimization*) — que ChatGPT, Claude, Perplexity, Gemini y
  Copilot puedan **leer, citar y recomendar** Imán cuando alguien les pregunta algo
  que Imán resuelve. Los crawlers de IA casi nunca ejecutan JavaScript: todo lo que
  importa tiene que estar en el HTML crudo.

Dominio canónico: **`https://iman.ar`**. Está escrito en un solo lugar del generador
(`BASE`) y en los archivos de texto de la raíz.

---

## Archivos de la raíz

| Archivo | Para qué |
|---|---|
| `robots.txt` | Permite explícitamente los crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, meta-externalagent…), bloquea demos y material de ads, y bloquea scrapers sin valor (Bytespider, Semrush, Ahrefs). Declara el sitemap. |
| `sitemap.xml` | Las 13 URLs indexables con `lastmod` real tomado del último commit de cada archivo. |
| `llms.txt` | El archivo clave de AEO. Resumen curado de qué es Imán, cómo funciona, productos, precios publicados, condiciones y FAQ, en texto plano. Es lo que una IA lee cuando quiere entender el sitio sin recorrerlo entero. |
| `llms-full.txt` | Volcado completo: secciones y FAQ de cada landing, generado desde el HTML. |

`vercel.json` sirve `llms.txt` y `llms-full.txt` como `text/plain; charset=utf-8`
(si no, algunos clientes los descargan en vez de leerlos) y agrega `X-Robots-Tag:
noindex` sobre `/hub/`, `/turnos/ads/`, `/turnos/reservar.html` y `/api/`.

---

## Qué lleva cada landing

Dentro de un bloque marcado `<!-- ═══ SEO/AEO generado ... ═══ -->` antes de `</head>`:

1. **`<link rel="canonical">`** absoluto. `/club/` canonicaliza a `https://iman.ar/`
   (porque el rewrite de la raíz sirve el mismo contenido) y `/petshops/` canonicaliza
   a `/petshops/minorista/` (son el mismo HTML).
2. **`<meta name="robots">`** con `max-snippet:-1, max-image-preview:large,
   max-video-preview:-1` — sin esto Google recorta el snippet y no muestra imagen grande.
3. **Open Graph y Twitter Card completos** (solo se agregan las etiquetas que faltaban).
4. **JSON-LD en `@graph`**, que es lo que más mueve la aguja en AEO:

| Nodo | Dónde | Qué aporta |
|---|---|---|
| `Organization` | todas las de Imán | La entidad "Imán": qué es, dónde opera, cómo contactarla. Un solo `@id` compartido, así los buscadores no crean entidades duplicadas. |
| `WebSite` | todas | Ata las páginas a un sitio con editor conocido. |
| `SoftwareApplication` + `Product` | `/` y `/turnos/landing/` | Producto, categoría, `featureList`, sistema operativo ("web, sin instalación"). |
| `Offer` | `/turnos/landing/` | Precio real y público: $ 15.000 ARS/mes recurrente. |
| `Service` | cada vertical | El servicio por rubro, con `audience` (a quién sirve) y `areaServed`. |
| `FAQPage` | 13 páginas | Las preguntas y respuestas que ya estaban en los `<details>`, en formato que una IA cita textual. **Es la pieza de AEO con mejor relación esfuerzo/resultado.** |
| `BreadcrumbList` | subpáginas | Jerarquía del sitio. |
| `Product` + `Organization` propios | `/urbase/` | URBASE es una marca aparte: tiene su propia entidad para que no se mezcle con Imán. |

---

## Cómo regenerar

```bash
python3 scripts/seo.py
```

Reescribe el bloque `<head>` de las 14 landings, el `sitemap.xml` y `llms-full.txt`.
Es **idempotente**: correrlo dos veces da exactamente el mismo resultado.

La config vive en el diccionario `PAGES`, arriba de todo en `scripts/seo.py`.
Para agregar una landing nueva basta con sumar una entrada:

```python
"nuevo-rubro/index.html": P(
    url="/nuevo-rubro/", prio="0.8", aud=None,
    crumbs=[("Nombre del rubro","/nuevo-rubro/")], kind="service",
    svc_name="Imán para <rubro>",
    svc_aud="<a qué negocios sirve>",
),
```

y volver a correr el script.

Las FAQ **no se cargan a mano**: se extraen de los `<details><summary>` de cada
página. Escribir una pregunta nueva en el HTML alcanza para que aparezca en el
schema y en `llms-full.txt`.

`llms.txt` sí es curado a mano: es el resumen que lee una IA para entender el sitio
sin recorrerlo entero, y conviene que esté escrito, no generado. Actualizarlo cuando
cambie un producto, un precio o una condición comercial.

---

## Decisiones tomadas y por qué

- **`/petshops/` canonicaliza a `/petshops/minorista/`.** Eran archivos idénticos
  salvo el `og:url`: tres URLs con el mismo contenido se pisan entre sí en Google.
- **`/petshops/distribuidora/` y `/limpieza/distribuidora/` ahora nacen con
  `<body data-aud="dist">`.** Antes el HTML crudo decía `min` y el JS lo corregía
  según la URL. Googlebot renderiza JS y no lo notaba, pero GPTBot y ClaudeBot no:
  leían contenido de minorista en la URL de distribuidora. Un atributo, cambio grande.
- **Títulos y descripciones propios para minorista vs distribuidora.** Antes las
  cuatro URLs compartían título; para un buscador eso son duplicados.
- **El mockup de `/turnos/landing/` dejó de usar `<h1>`.** Había dos H1 en la página
  y uno era el nombre de una barbería ficticia. Ahora es un `<p>` con los mismos estilos.
- **La demo del turnero (`/turnos/`, `/turnos/reservar.html`) va a `noindex`.** Es
  contenido de una barbería inventada: indexado, compite con la landing real y
  confunde a las IA sobre qué vende Imán.
- **Sin precio inventado.** Solo Imán Turnos tiene `Offer` con precio, porque es el
  único publicado. En URBASE el `Product` va sin `offers` en vez de con un precio falso.
- **Se bloquean Ahrefs/Semrush/Bytespider** — consumen ancho de banda y no traen ni
  tráfico ni citaciones. Si algún día se contrata Ahrefs para auditar el sitio, hay
  que sacar esa línea de `robots.txt`.

---

## Pendientes que dependen de vos

Estas son las que no se pueden hacer desde el código:

1. **Apuntar `iman.ar` al proyecto en Vercel** y dejarlo como dominio principal, con
   redirect 301 desde `iman-landings.vercel.app`. Hasta que eso pase, los `canonical`
   apuntan a un dominio que todavía no responde.
2. **Google Search Console** — verificar `iman.ar`, mandar `sitemap.xml` y pedir
   indexación de `/` y `/comercios/`.
3. **Bing Webmaster Tools** — importa la propiedad desde Search Console en dos clics.
   Importa más de lo que parece: **ChatGPT y Copilot se apoyan en el índice de Bing.**
4. **Perfil de Google Business** — si Imán atiende desde una dirección física, es la
   vía más rápida a búsquedas locales ("software fidelización clientes Córdoba").
5. **`sameAs` de la marca.** El `Organization` no tiene redes cargadas porque Imán no
   tiene Instagram/LinkedIn propios en el repo. Cuando existan, agregarlos: es la señal
   principal que usan los buscadores para confirmar que la entidad es real.
6. **Una imagen OG propia para `/turnos/landing/`** — hoy usa la genérica `/og.png`.
7. **GA4 y Search Console conectados** para poder medir si esto funcionó.

## Cómo verificar que quedó bien

```bash
curl -s https://iman.ar/robots.txt | head -20
```

- Rich Results Test: https://search.google.com/test/rich-results
- Validador de schema: https://validator.schema.org/
- Probar el AEO en vivo: preguntarle a ChatGPT o Perplexity *"¿qué es Imán, la
  herramienta argentina para que los clientes de un comercio vuelvan a comprar?"*
  y ver si cita `iman.ar`. Tarda semanas después de indexar — no esperes resultado el día uno.

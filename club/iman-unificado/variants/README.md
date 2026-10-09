# Variantes de identidad · 9 de octubre de 2026

Dos landings estáticas e independientes para comparar los PDFs de identidad:

- `/V1/`: logo blanco con degradado sólo en la tilde.
- `/V2/`: logo completo en cian, lavanda y durazno, más acentos puntuales.

Cada carpeta tiene su `index.html`, con CSS y JavaScript incluidos. Los logos y
las fuentes se copian desde `assets/` a `/assets/identity-variants/`. Las capturas
de las demos conservan sus archivos existentes en `/assets/experience/shots/`.

La información, enlaces, cuatro servicios (incluido Gauss) y tres demostraciones
provienen de `experience/home.html`. Las variantes usan Inter y Geist Mono, el
fondo Noche y la iluminación blanca neutra de los PDFs. No modifican la portada
original, páginas de servicio, formularios, backend ni recursos compartidos.

`scripts/build.py` sólo agrega las dos carpetas y sus recursos a `public/` antes
de generar el ZIP. Las variantes llevan `noindex,follow`, canonical a la portada
original y su propia imagen para compartir. No se agregan al sitemap.

Publicación: el flujo existente de Cloudflare Pages, rama `codex/iman-unificado`.

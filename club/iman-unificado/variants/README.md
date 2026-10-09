# Variantes de identidad · 9 de octubre de 2026

Dos landings estáticas e independientes para comparar los PDFs de identidad:

- `/V1/`: logo blanco con degradado sólo en la tilde; detalles de interfaz a color.
- `/V2/`: logo completo en cian, lavanda y durazno; los mismos detalles a color.

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

## Entrada del logo

Al abrir cada versión, un degradado a pantalla completa se contrae hasta formar
la tilde y revela la palabra. Un destello pequeño cierra la transformación y el
logo se acomoda en la barra superior. La secuencia dura aproximadamente 2,9
segundos y usa Web Animations nativa, sin dependencias. La barra acompaña el scroll.

La preferencia de movimiento reducido, un enlace con ancla o volver desde otra
página omiten la entrada. Teclado, scroll, un cambio de tamaño o de pestaña la
terminan de inmediato. Sin JavaScript, con error de imagen o con un script
interrumpido, el contenido queda disponible; hay un límite de tiempo de respaldo.

## Detalles de color e interacción

Los acentos suaves, de azul acero, lavanda y champán, aparecen en el titular,
números, enlaces e indicadores. Los botones usan un reflejo plateado neutro. Los
contornos de botones y pestañas llevan entre 1,5 y 2 px de color metálico, con un
reflejo lento. Las tarjetas llevan únicamente una línea superior de 1,5 px con
un brillo suave que la recorre; no tienen contorno. Movimiento reducido deja
estos detalles estáticos. El resto de los títulos mantiene el gris. Se conservan
los logos propios de cada versión y las marcas originales de las demos.

Las tarjetas de servicios se pueden activar desde todo el bloque: las primeras
tres seleccionan su demo y Gauss conserva el enlace a su página. El enlace real
mantiene teclado, apertura en otra pestaña y funcionamiento sin JavaScript.

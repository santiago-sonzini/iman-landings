# Variantes de identidad · 9 de octubre de 2026

Identidad elegida: logo blanco con degradado únicamente en la tilde.

- `/V1/`: logo blanco con degradado sólo en la tilde; detalles de interfaz a color.
- `/V2/`: enlace anterior; redirige a `/V1/`, conservando parámetros y ancla.
  La opción de logo completo a color se descartó; su código anterior queda en Git.

`V1/index.html` incluye el CSS y JavaScript de la landing. `V2/index.html` es
únicamente una redirección con alternativa sin JavaScript. Los logos y
las fuentes se copian desde `assets/` a `/assets/identity-variants/`. Las capturas
de las demos conservan sus archivos existentes en `/assets/experience/shots/`.

La información, enlaces, cuatro servicios (incluido Gauss) y tres demostraciones
provienen de `experience/home.html`. La landing usa Inter y Geist Mono, el
fondo Noche y la iluminación blanca neutra de los PDFs. No modifican la portada
original, páginas de servicio, formularios, backend ni recursos compartidos.

`scripts/build.py` sólo agrega las dos carpetas y sus recursos a `public/` antes
de generar el ZIP. Las variantes llevan `noindex,follow`, canonical a la portada
original y su propia imagen para compartir. No se agregan al sitemap.

Publicación: el flujo existente de Cloudflare Pages, rama `codex/iman-unificado`.

## Entrada del logo

Al abrir V1, la silueta inclinada de la tilde aparece delineada. Líneas finas de
cian, lavanda y durazno entran por su borde inferior siguiendo esa inclinación
y llenan la tilde de abajo hacia arriba. La tilde se coloca sobre la palabra blanca,
y el logo completo se acomoda en la barra. La secuencia dura aproximadamente
3 segundos y usa SVG y Web Animations nativa, sin dependencias.

La entrada funciona al abrir y recargar URLs con ancla, como `/V1/#demos`, y
conserva esa sección al terminar. Una precarga en pestaña oculta espera a que
se muestre antes de empezar. Movimiento reducido omite la entrada. Teclado,
rueda, interacción táctil o un cambio de tamaño la terminan de inmediato.
Sin JavaScript o ante errores de imagen/script, el contenido queda disponible;
un respaldo de tiempo evita dejar la página oculta.

## Detalles de color e interacción

El titular usa “Vendé más. Ganá tiempo.”; “Ganá tiempo” y “A tu medida” llevan el
mismo degradado cian, lavanda y durazno. Las tarjetas no muestran línea en reposo:
al hacer hover o enfocar su enlace, la línea superior se dibuja de izquierda a
derecha. No hay animaciones continuas en los controles.

Los CTA parten de fondo negro y texto blanco. En hover/foco, el degradado avanza
en diagonal desde abajo a la izquierda hacia arriba a la derecha; el texto
oscuro se revela dentro del mismo plano para mantener el contraste. Las pestañas
son texto sobre fondo transparente, con una línea de color bajo la seleccionada.
Se mantienen los enlaces, navegación por teclado y marcas de las demos.

Las tarjetas de servicios se pueden activar desde todo el bloque: las primeras
tres seleccionan su demo y Gauss conserva el enlace a su página. El enlace real
mantiene teclado, apertura en otra pestaña y funcionamiento sin JavaScript.

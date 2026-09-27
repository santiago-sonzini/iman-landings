# SEO y descubrimiento de IMAN

Trabajo local del 27 de septiembre de 2026. El objetivo es atraer consultas pertinentes para Fidelización, Comercios y Automatizaciones y poder relacionarlas con una página y un origen. No se promete una posición, tráfico ni recomendaciones de asistentes.

## Ejecutar la auditoría

Desde la raíz del proyecto:

```sh
python3 scripts/seo_audit.py
```

Produce `docs/seo/audit.md` y `audit.json`. Sale con código 1 si hay errores y 0 si solo hay advertencias u observaciones. Lee todo `public/`, no solamente el manifiesto de páginas. No necesita red, cuenta, dependencias ni credenciales. Para inspeccionar otra compilación sin reemplazar este informe:

```sh
python3 scripts/seo_audit.py --public /ruta/al/sitio --out /tmp/iman-seo-audit
```

Complementa `scripts/check.py` con descubrimiento de HTML fuera del sitemap, conflictos de noindex/robots, títulos/descripciones/H1 repetidos, recorrido por enlaces desde inicio, detección de páginas huérfanas, similitud del texto principal sin formularios ni bloques repetidos, tipo Article en guías e identificación accesible de imágenes y demos. La similitud es una alerta editorial; no afirma que Google aplique una penalización. No usa un mínimo de palabras como criterio de calidad.

## Estado y archivos

| Entregable | Estado local | Archivo |
| --- | --- | --- |
| Auditoría reproducible e inventario | Implementado; volver a ejecutar después del último build | `scripts/seo_audit.py`, `audit.md`, `audit.json` |
| Investigación del servicio solicitado | Revisada contra fuentes primarias | `autoseo-investigacion.md` |
| Mapa de consultas, páginas e intención | Hipótesis editorial basada en productos reales; sin volumen inventado | `keyword-map.csv` |
| Calendario y briefs | Secuencia editorial; seguimiento diario en Codex a las 09:00, con publicación condicionada a validaciones | `plan-editorial.md` |
| Medición y validación publicada | Protocolo; conexión de cuentas y resultados aún no certificados por esta auditoría | `medicion.md` |
| Panel local de seguimiento | Implementado, sin APIs ni datos de búsqueda inventados | `dashboard.html`, `scripts/seo_dashboard.py` |

Los artículos nuevos y su validador pertenecen a `content/articles.json` y `scripts/content_pipeline.py`, mantenidos por el agente de contenido. Este módulo no modifica el generador ni publica páginas. No registrar contenido como publicado hasta que realmente esté disponible en su URL canónica.

## Panel local

```sh
python3 scripts/seo_audit.py
python3 scripts/seo_dashboard.py
```

Abrir `docs/seo/dashboard.html` en un navegador. Es un archivo independiente, sin librerías externas ni solicitudes de red, que incorpora auditoría, mapa de prioridades y estado de los artículos. La verificación de la propiedad se lee de `search-console-status.json`, independientemente de los CSV y de la conexión a una API. Una importación local no verifica la propiedad; una propiedad verificada tampoco crea métricas.

La propiedad `sc-domain:iman.ar` está confirmada como verificada; el [registro de configuración](search-console-setup.md) documenta el sitemap procesado y las solicitudes de indexación. El archivo usa `verified_at` como fecha de constatación, no como fecha de alta. Para registrar futuras verificaciones, completar `property`, fecha ISO con zona y `evidence`; no guardar tokens ni credenciales. El generador rechaza un estado verificado sin esos campos y sigue mostrando «Sin métricas importadas» cuando no hay CSV. La conexión a la API continúa sin implementarse.

El panel permite importar CSV de Consultas y Páginas en español o inglés. También se pueden incorporar al generar el archivo:

```sh
python3 scripts/seo_dashboard.py --queries /ruta/Consultas.csv --pages /ruta/Paginas.csv
```

Los datos se procesan localmente. Clics e impresiones se suman sólo dentro de la dimensión elegida; el CTR se recalcula con esos totales y la posición se pondera por las impresiones que tienen posición válida. Consultas y páginas no se suman entre sí. Si hay diferencias respecto al CTR exportado o filas descartadas, el importador lo informa. La última importación de un mismo tipo reemplaza la anterior, evitando acumular períodos por accidente.

La importación desde pantalla dura hasta recargar. «Descargar informe JSON» conserva los datos y su fecha; los CSV incluidos mediante la opción de línea de comandos quedan dentro del HTML local. Cuando se usen exportaciones reales, indicar `--out docs/seo/private/<fecha>/dashboard.html`: esa carpeta está excluida de Git. Mantener el panel versionado sin `--queries` ni `--pages`. La opción `--data-note` permite mostrar el período y aclarar si es una línea base anterior al sitio nuevo.

El panel privado de la exportación actual está en `docs/seo/private/2026-09-27-search-console/dashboard.html`; su contexto y evidencia permanecen en esa misma carpeta. No se incluye en `public/` ni en el ZIP de Cloudflare. No compartirlo públicamente: contiene datos comerciales de la propiedad.

## Cómo usarlo en cada cambio

1. Elegir una pregunta de compra real y comprobar si ya tiene una URL adecuada en el mapa.
2. Revisar el texto, los ejemplos y cualquier afirmación técnica con fuentes o evidencia propia.
3. Compilar y ejecutar `scripts/check.py`, el validador editorial y esta auditoría.
4. Después del despliegue, verificar HTTPS, respuesta 200/301/404, encabezados y formulario. El HTML local no prueba esos comportamientos.
5. Cuando haya datos, actualizar prioridades con Search Console y consultas calificadas; no crear páginas por cada sinónimo o ciudad.

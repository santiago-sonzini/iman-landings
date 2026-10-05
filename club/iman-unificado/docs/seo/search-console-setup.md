# Search Console: configuración confirmada

## Seguimiento del 5 de octubre de 2026

Las cuatro URLs prioritarias muestran «La URL está en Google» y «La página está indexada». El sitemap está Correcto, con última lectura el 3/10/2026 y 20 páginas descubiertas (antes: 15). Esto no equivale a 20 páginas indexadas. Sin solicitudes nuevas ni cambios de DNS. Evidencia privada en `docs/seo/private/2026-10-05-search-console/`.

Se amplió la guía existente Wallet/email con una tabla de decisiones y controles para cancelar avisos tras un canje. No se creó una URL adicional.

## Seguimiento del 29 de septiembre de 2026

Las cuatro inspecciones prioritarias (inicio, Fidelización, Comercios y Automatizaciones) vuelven a mostrar **La URL está en Google** y **La página está indexada**. Sin cambio respecto del 28/9; no se enviaron solicitudes nuevas ni se modificó DNS.

El sitemap continúa **Correcto**, con 15 páginas descubiertas y última lectura el **28/9/2026**. El sitemap de la nueva versión publicada contiene 17 URLs; el conteo anterior de Search Console no prueba un fallo de lectura ni justifica reenviarlo. Evidencia de hoy en `docs/seo/private/2026-09-29-search-console/`, excluida de Git y del sitio público. No se exportaron métricas comerciales nuevas.

Se amplió la guía de compras con una negociación hipotética entre dos agentes: solicitud, oferta, contrapropuesta y aprobación. Se mantiene el URL existente y se evita crear otra guía que compita por la misma intención.

## Seguimiento del 28 de septiembre de 2026

Constatación: **2026-09-28T12:06:50.472Z**. Las inspecciones del índice muestran **La URL está en Google** y **La página está indexada** para las cuatro páginas prioritarias:

| URL | Estado observado el 28/9 |
| --- | --- |
| `https://www.iman.ar/` | Indexada; conserva el estado anterior. |
| `https://www.iman.ar/fidelizacion/` | Indexada; confirmada después de la solicitud del 27/9. |
| `https://www.iman.ar/comercios/` | Indexada; la inspección actual ya no muestra la duplicación histórica. |
| `https://www.iman.ar/automatizaciones/` | Indexada; confirmada después de la solicitud del 27/9. |

El sitemap continúa **Correcto**, con **15 páginas descubiertas** y última lectura el 27/9. No se reenviaron el sitemap ni solicitudes de indexación, y no se modificó DNS. No se detectaron nuevos problemas en estas cuatro inspecciones; esto no sustituye una auditoría de todas las URLs de la propiedad.

Las capturas y el registro estructurado se conservan en `docs/seo/private/2026-09-28-search-console/`, fuera de Git y del sitio público. No se exportaron métricas de rendimiento nuevas. Estar indexado no confirma posiciones ni resultados comerciales.

## Registro histórico del 27 de septiembre

Constatación final: **27 de septiembre de 2026, 22:16:01 UTC**. Esta es la hora de comprobación del estado, no la hora exacta de cada acción ni la fecha de alta de la propiedad.

## Propiedad y sitemap

- Propiedad existente: `sc-domain:iman.ar`. En [Ajustes de Search Console](https://search.google.com/search-console/settings?resource_id=sc-domain%3Aiman.ar), la sección de verificación mostró **Propietario verificado**. No se creó una propiedad nueva.
- Sitemap: `https://www.iman.ar/sitemap.xml`. El detalle de [Sitemaps](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Aiman.ar) confirmó **El sitemap se ha procesado correctamente**, con **15 páginas descubiertas** y última lectura el 27/9/2026.
- La lectura inicialmente falló y se reenvió una sola vez. La comprobación posterior confirmó el procesamiento correcto, sin modificar código ni DNS para resolver ese fallo transitorio. No queda pendiente volver a enviarlo por aquel error.

## Inspección y solicitudes

| URL | Estado observado / acción confirmada |
| --- | --- |
| `https://www.iman.ar/` | Ya estaba en Google e indexada. La prueba en vivo la mostró disponible e indexable; solicitud de actualización aceptada. |
| `https://www.iman.ar/fidelizacion/` | URL nueva desconocida en la inspección inicial; solicitud de indexación aceptada. |
| `https://www.iman.ar/comercios/` | La inspección anterior reflejaba una duplicación con canonical a la home, correspondiente a un rastreo del 25/7/2026. Solicitud de indexación de la versión actual aceptada. |
| `https://www.iman.ar/automatizaciones/` | Solicitud de indexación aceptada. |

Que Google acepte la solicitud no confirma todavía que las tres páginas de servicio estén indexadas. Las 15 URLs descubiertas por el sitemap tampoco equivalen a 15 páginas indexadas ni a posiciones de búsqueda. El seguimiento diario revisará esos estados sin reenviar solicitudes de forma repetida.

## Datos y evidencia privada

La exportación de rendimiento descargada desde la interfaz se conserva únicamente en `docs/seo/private/2026-09-27-search-console/`, excluida de Git. El panel con datos reales es `docs/seo/private/2026-09-27-search-console/dashboard.html`. La misma carpeta conserva CSV originales, contexto del período y capturas de las confirmaciones disponibles. No se incluyen métricas comerciales ni consultas exportadas en este documento.

La exportación representa actividad anterior al sitio nuevo y puede abarcar contenido previo o subdominios de la propiedad de dominio. No se atribuyen sus resultados a esta publicación. El panel versionado `docs/seo/dashboard.html` conserva las métricas vacías; muestra la verificación confirmada por separado. No se conectó una API de Search Console.

El seguimiento «IMAN · SEO y conversión» está programado en Codex diariamente a las 09:00. Prioriza sitemap, indexación y revisión de datos disponibles, conservando las exportaciones en privado. No publica por cumplir una cuota ni promete posiciones. La tarea de Codex puede publicar hasta una guía por ejecución si supera las validaciones.

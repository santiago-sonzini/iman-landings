# Search Console: configuración confirmada

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

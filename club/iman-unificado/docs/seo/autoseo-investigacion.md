# AutoSEO: alcance comprobado y aplicación a IMAN

Consulta de las páginas públicas el 27 de septiembre de 2026. No se contrató una cuenta ni se probó su panel privado. Los resultados comerciales que publican no constituyen resultados esperables de IMAN.

## Qué anuncia

AutoSEO ofrece investigación del negocio, competidores y Search Console; calendario; artículos con imágenes e infografías; revisión previa, publicación en CMS/RSS o blog alojado; panel de seguimiento y enlaces de su red. Anuncia 30 artículos mensuales o 365 anuales, y 5–10 enlaces mensuales. El precio final no apareció de forma verificable en el texto recuperado; no se deduce de descuentos o capturas. Los enlaces de navegación «How It Works» y «Pricing» apuntan a secciones de la misma página. [Producto y planes](https://getautoseo.com/).

Su API/MCP permite consultar sitios, artículos, enlaces y resúmenes; modificar artículos e imágenes; conservar revisiones. No permite modificar palabras clave, configuración o enlaces. Requiere autorización de cuenta. [Documentación técnica](https://getautoseo.com/developers).

## Qué se implementa para IMAN

| Necesidad | Base que ya existe en el proyecto | Trabajo concreto / límite |
| --- | --- | --- |
| Conocer producto y público | Tres ofertas principales, demos identificadas, contacto contextual | `keyword-map.csv` vincula consultas con una sola intención y URL. Validar demanda con datos antes de ampliar. |
| Planificación editorial | Tres guías iniciales en `/recursos/` | `plan-editorial.md` prioriza dudas de contratación y mejoras de esas guías. No duplicarlas por rubro. |
| Redacción y control | HTML estático y generador local | Nuevos artículos se guardan como contenido estructurado con fuentes y revisión. No habilitar publicaciones masivas ni claims sin evidencia. |
| Visibilidad técnica | Sitemap, canonicals, redirecciones, robots y JSON-LD; Article ya presente en guías | `seo_audit.py` agrega cobertura de todos los HTML, descubrimiento, duplicados y alertas editoriales. |
| Imágenes y demos | Demos propias y galería de experiencias | Usar captura/diagrama que explique el paso descrito, con leyenda de demo. Una portada decorativa no demuestra funcionamiento. |
| Publicación | Build y alojamiento Cloudflare en curso del equipo principal | Este módulo no despliega ni certifica el sitio remoto. Un scheduler editorial todavía no está implementado. |
| Medición | Eventos de CTA, inicio/error de formulario, confirmación de consulta y consentimiento en `assets/site.js` | `medicion.md` define la relación con Search Console y resultados comerciales. Google Ads/Meta no reemplazan un informe orgánico. |
| Autoridad externa | No se comprobaron menciones/casos propios | Preparar demostraciones útiles, documentación propia y casos con permiso y respaldo. No incorporar una red de intercambio de enlaces. |
| Integración con agentes | Contenido semántico, URLs estables y documentación pública | Un MCP de administración de artículos es opcional; no es requisito para aparecer en respuestas ni está implementado aquí. |

## Contraste con Google

Google considera spam comprar o intercambiar enlaces para manipular rankings y generar muchas páginas sin valor para el lector, independientemente de si se usa IA. Un enlace publicitario debe identificarse apropiadamente. Por eso el equivalente local conserva investigación, producción y medición, pero no reproduce una cuota de enlaces ni una cuota ciega de artículos. [Políticas de spam](https://developers.google.com/search/docs/essentials/spam-policies).

No hay un número preferido de palabras. La originalidad, la utilidad, la experiencia demostrable y una autoría clara importan más que imitar la extensión de los primeros resultados. Los textos de IMAN deben explicar el proceso que se entrega y sus límites con ejemplos propios. [Contenido útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

La guía actual para funciones generativas indica que Google Search no utiliza `llms.txt`, no necesita schema especial para IA ni cada variante de una consulta. Recomienda una base técnica clara y contenido propio; permite medir sus experiencias generativas en Search Console. Esto no certifica visibilidad en otros asistentes. [Guía oficial para IA en Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

## Referencias de competencia, sin asumir resultados

Se revisaron ofertas públicas encontradas al buscar fidelización con Wallet en Argentina. No es un estudio exhaustivo, un ranking ni una medición de ventas:

- [Habitué](https://www.habitue.ar/) distingue experiencia del cliente, operación en caja y control del equipo. La lección aplicable es mostrar los tres recorridos de IMAN, sin atribuirse sus funcionalidades.
- [Loyaltick Argentina](https://loyaltick.com/ar) explica alta por QR, tarjeta digital y modalidad comercial. IMAN debería dejar igual de explícito qué se cotiza como implementación a medida.
- [Fastidelity](https://www.fastidelity.com/) presenta la personalización del programa y las tarjetas Wallet. Para diferenciar a IMAN hace falta demostrar cómo se combinan beneficio, email, catálogo y operación del comercio en una propuesta concreta.

La oportunidad editorial inferida es explicar decisiones que una lista de funcionalidades no resuelve: qué aviso sirve en cada canal, qué ve caja, quién aprueba un canje, cómo llega un pedido mayorista y qué acción de compras necesita aprobación.

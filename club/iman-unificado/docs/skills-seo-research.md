# Skills, conversión y descubrimiento de IMAN

Investigación: 27 de septiembre de 2026. Revisión del borrador `scripts/build.py` y `assets/site.js` al comenzar esta iteración. Es un diagnóstico del código local, no una medición de rendimiento del sitio publicado. No se ejecutaron instaladores externos.

## Selección de skills

Se consultó primero el [leaderboard de skills.sh](https://skills.sh/), después los archivos originales `SKILL.md`. La popularidad sirve como señal de adopción, no demuestra resultados. El conjunto adecuado para este proyecto es pequeño:

| Skill | Aplicación concreta en IMAN | Fuente revisada |
| --- | --- | --- |
| CRO | Una conversión principal por página, jerarquía de CTA, prueba visible, objeciones y formulario breve. Ya instalada. | [SKILL.md original](https://github.com/coreyhaines31/marketingskills/blob/main/skills/cro/SKILL.md) |
| Copywriting | Explicar el resultado que compra cada negocio; reemplazar frases genéricas por beneficios, entregables y próximos pasos. Ya instalada y leída localmente. | [SKILL.md original](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/SKILL.md) |
| Analytics | Definir el embudo y distinguir clic, apertura de WhatsApp, conversación recibida y venta. Ya instalada; contenido original consultado. | [SKILL.md original](https://github.com/coreyhaines31/marketingskills/blob/main/skills/analytics/SKILL.md) |
| SEO audit | Revisar indexación, URLs, canonicals, redirecciones, contenido, velocidad y enlaces. Útil para la migración. | [SKILL.md original](https://github.com/coreyhaines31/marketingskills/blob/main/skills/seo-audit/SKILL.md) |
| Site architecture | Unir Fidelización, Comercios y Automatizaciones con rutas claras por intención; conservar URLs antiguas útiles. | [SKILL.md original](https://github.com/coreyhaines31/marketingskills/blob/main/skills/site-architecture/SKILL.md) |
| Offers | Volver tangible Automatizaciones: caso de uso, entrada, resultado, entregables y forma de cotizar. Usar esas preguntas; no inventar garantías, descuentos o urgencia. | [SKILL.md original](https://github.com/coreyhaines31/marketingskills/blob/main/skills/offers/SKILL.md) |
| AI SEO | Útil para auditar preguntas relevantes y claridad de las respuestas. Necesita correcciones frente a documentación oficial; no adoptar todo su contenido. | [SKILL.md original](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ai-seo/SKILL.md) |
| Web design guidelines | Revisión funcional de móvil, foco, formularios, movimiento reducido y estabilidad del layout conservando la identidad visual existente. | [Skill de Vercel](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md), [reglas originales](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md) |

El directorio mostraba aproximadamente 215 mil instalaciones para SEO audit, 132 mil para AI SEO y 52 mil estrellas para el repositorio de marketing. Es una colección comunitaria: no son instrucciones de Google ni garantías. La ficha de SEO audit mostraba además una advertencia de Snyk; no se ejecutó código ni se instaló el paquete. [Ficha consultada](https://www.skills.sh/coreyhaines31/marketingskills/seo-audit), [ficha AI SEO](https://www.skills.sh/coreyhaines31/marketingskills/ai-seo).

No hace falta instalar ads, popups, directorios, programmatic SEO ni una colección entera para resolver esta iteración. Los anuncios requieren una estrategia y presupuesto propios; generar muchas variantes no reemplaza el valor de cada página. Las skills instaladas ya cubren CRO, textos, producto y medición.

## Qué conviene corregir del consejo encontrado

La skill AI SEO contiene afirmaciones demasiado amplias sobre bots, archivos especiales, formatos y porcentajes de mejora. Se conserva la disciplina de auditar visibilidad y escribir respuestas claras; se descartan porcentajes de crecimiento, atribuciones universales sobre motores y supuestas garantías de cita.

Google recomienda contenido útil propio, accesible e indexable. No usa `llms.txt` para mejorar visibilidad o ranking, no requiere fragmentos de una longitud determinada ni schema especial para IA, y desaconseja fabricar contenido para cada variación de búsqueda. La guía vigente también remite al informe de rendimiento de IA generativa de Search Console; esto contradice partes desactualizadas de la skill. [Guía oficial actualizada el 10 de julio de 2026](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

Googlebot controla el acceso de Google Search. Google-Extended es otro control, relacionado con Gemini y ciertos usos de sus contenidos, y no es una señal de ranking en Search. No mezclar ambos ni describir todos los rastreadores como equivalentes. [Documentación oficial de rastreadores](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers).

El resultado enriquecido de FAQ dejó de mostrarse en Google desde mayo de 2026. Las preguntas frecuentes siguen ayudando al visitante y pueden mantenerse; su JSON-LD no debe presentarse como un beneficio garantizado en resultados. [Registro oficial de cambios](https://developers.google.com/search/updates).

Para navegación por agentes son útiles los elementos semánticos, labels asociados, acciones visibles y un layout estable. No hay razón para agregar una plataforma experimental a una web comercial de contacto. [Guía de web.dev para sitios accesibles a agentes](https://web.dev/articles/ai-agent-site-ux).

## Hallazgos del borrador local

### Prioridad 1 — consulta comercial observable

- `site.js` emitía un `CustomEvent('iman:cta_click')`, pero no había transporte ni almacenamiento analítico asociado. Eso no constituye medición en producción.
- El CTA principal de inicio y “Cómo funciona” tenían el mismo destino `/fidelizacion/`. Separar intención: consulta directa frente a exploración del funcionamiento.
- El formulario abre WhatsApp con un borrador. No marcar esta acción como mensaje enviado, lead recibido o venta. El sitio no puede observar esos resultados sin una integración posterior.
- Enlaces sueltos del footer y envío del formulario quedaban fuera del selector de tracking de botones. Medir todos los caminos relevantes con nombres consistentes y sin nombre, teléfono, negocio o texto libre en el evento.
- Varias páginas terminan en “Conversemos” o “Veámoslo en mi negocio”. La mejora propuesta es un CTA asociado al producto y al beneficio: “Quiero mi Club”, “Quiero mi catálogo”, “Evaluar mi automatización”; el texto definitivo debe seguir la voz original de IMAN.

Embudo mínimo propuesto: visita de landing → CTA de servicio → contacto iniciado → WhatsApp abierto / agenda abierta → conversación efectivamente recibida → oportunidad calificada → venta. Los primeros pasos se miden en la web, los últimos necesitan registro comercial. Sin esa última parte solo se optimiza la intención, no la conversión real.

### Prioridad 2 — proteger búsqueda durante la publicación

El generador ya incluye HTML estático, títulos y descripciones, canonicals, sitemap, robots, redirecciones de marca y JSON-LD. No falta un “truco SEO”; falta verificar el sitio real después del cambio de alojamiento:

1. Probar HTTPS, dominio con/sin `www`, códigos HTTP y ausencia de bucles. Conservar una única variante canónica coherente.
2. Verificar que las antiguas URLs con visitas, enlaces o anuncios lleguen a la página equivalente. `/club/` debe llevar al contenido principal de fidelización y conservar una experiencia reconocible.
3. Confirmar que sitemap y URLs canónicas sirven 200 y que demos siguen fuera del índice. El chequeo local no prueba encabezados de Cloudflare ni configuración de Donweb.
4. Revisar Search Console si ya está disponible: indexación, URLs importantes y sitemap. Su acceso/configuración no se comprobó en esta investigación.
5. Medir rendimiento móvil en la URL publicada. Un preview local no demuestra Core Web Vitals reales.

### Prioridad 3 — contenido que merece tráfico

- Las páginas de rubro tienen ejemplos adaptados, pero comparten gran parte de la estructura y preguntas genéricas. Profundizar las de mayor valor con recorrido concreto, requisitos, resultado observable y objeciones reales antes de multiplicar más rutas.
- Separar los resultados de las tres ofertas: Fidelización genera motivos para volver; Comercios ordena catálogo y pedidos; Automatizaciones conecta el proceso y reduce tareas manuales. Un comprador debe entender cuál necesita sin conocer la arquitectura interna de IMAN.
- No se observan casos de clientes comprobados en el generador. Usar demos explícitas y entregables como prueba del proceso; incorporar casos y métricas solo cuando exista respaldo.
- Los recursos tienen autor “IMAN” y fecha visible, pero solo se marcan como WebPage. Un schema `Article` con autor editorial real sería una mejora semántica razonable; es secundaria frente a la calidad del contenido.
- El logo de Organization usa el favicon SVG y todas las páginas comparten una imagen social. Revisar legibilidad del logo y previews de las tres ofertas; esto ayuda a reconocer la marca al compartirla, sin atribuirle un aumento de ranking.
- La página 404 del borrador todavía dice “Club” en el listado principal. Alinear el mensaje con Fidelización, Comercios y Automatizaciones al finalizar la nueva iteración.

## Mapa de intención recomendado

| Entrada | Oferta principal | Qué debe resolver la página | Acción |
| --- | --- | --- | --- |
| Marca IMAN / visitantes generales | Fidelización | Qué vende IMAN y cómo ayuda después de una compra | Consultar por un Club |
| Wallet / tarjetas de fidelización / retención | Fidelización | Alta por QR, pase, beneficios, notificaciones, email y reglas del programa | Ver la experiencia y consultar implementación |
| Catálogo digital / catálogo mayorista | Comercios | Productos, condiciones, cantidades y recepción del pedido | Consultar por su catálogo |
| Automatizar pedidos / seguimiento / compras | Automatizaciones | Tarea inicial, sistemas, reglas, excepciones y entrega verificable | Evaluar un proceso concreto |
| Rubro específico | Oferta adecuada al rubro | Un caso creíble de uso, evitando repetir toda la home | Consulta con contexto del rubro |
| Guía informativa | Servicio relacionado | Resolver la duda antes de ofrecer contratación | CTA contextual al final del argumento |

Esta tabla es una hipótesis editorial basada en el alcance confirmado por el usuario. No es investigación de volumen de búsquedas ni prueba de demanda; debe ajustarse con consultas y leads reales.

## Criterio de éxito

El objetivo medible es aumentar consultas calificadas por visita y conocer qué página/origen las produce. Hasta tener línea base, los cambios de copy y jerarquía son hipótesis razonadas, no mejoras de conversión demostradas. No se promete primer puesto, cobertura de todas las categorías ni citas automáticas por asistentes.

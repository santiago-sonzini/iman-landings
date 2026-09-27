# Medición de adquisición y consultas

## Línea base

Registrar fecha de despliegue, versión del sitio y las URLs cambiadas. Si existe acceso, exportar Search Console por consulta, página, fecha, país y dispositivo para un período anterior comparable. Conservar impresiones, clics, CTR y posición media como datos de búsqueda; no interpretarlos como ventas ni como posiciones constantes. Si el dominio no tiene datos, declarar «sin línea base».

Revisar indexación de inicio, los tres servicios y cada recurso publicado. Verificar sitemap y variante canónica después de DNS/Cloudflare. La [guía de Google para IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) remite al informe de rendimiento generativo de Search Console; comprobar su disponibilidad en la cuenta antes de declarar que se mide.

## Embudo y definiciones

| Señal | Qué significa | Qué no prueba |
| --- | --- | --- |
| Clic desde búsqueda | Visita desde un resultado registrada por Search Console | Consulta o venta |
| `cta_click` / `form_start` | Interés y comienzo del contacto en la web | Datos recibidos |
| `whatsapp_click` | Apertura del destino de WhatsApp | Mensaje enviado o conversación recibida |
| `calendar_open` | Apertura de agenda | Reunión reservada o asistida |
| `generate_lead` | Backend confirmó la recepción del formulario | Lead calificado o cliente |
| Consulta calificada | IMAN registró necesidad, encaje y siguiente paso | Venta cerrada |
| Venta | Aceptación comercial registrada por IMAN | Causalidad exclusiva del SEO |

El código local actual emite eventos de intención y conversión a Google Ads/Meta sólo con consentimiento y en dominio de producción. No se verificó recepción en esas cuentas. El panel SEO local admite exportaciones CSV de Search Console; no tiene conexión a su API. El estado de propiedad se registra por separado en `search-console-status.json` y requiere evidencia antes de marcarse como verificado. Registrar fuentes/campañas disponibles junto con la consulta comercial sin mandar nombre, email, teléfono o texto libre a herramientas analíticas.

## Revisión semanal propuesta

El seguimiento «IMAN · SEO y conversión» está programado en Codex diariamente a las 09:00. Prioriza sitemap e indexación y mantiene las exportaciones de Search Console en la carpeta privada ignorada. El panel local no publica contenido ni se conecta a la API. La tarea de Codex puede publicar hasta una guía por ejecución si supera las validaciones, sin una cuota obligatoria. Al revisar, registrar:

1. Páginas con impresiones relevantes pero poca respuesta comercial: mejorar claridad, demo o próximo paso según evidencia.
2. Consultas que muestran una duda no resuelta: ampliar la página existente o redactar una guía diferente si corresponde.
3. URLs que compiten por la misma pregunta: aclarar intención y enlaces; no asumir canibalización sólo porque comparten una palabra.
4. Formularios fallidos y consultas recibidas: distinguir problemas técnicos de falta de demanda.
5. Cambios y resultados con fecha: conservar períodos comparables y advertir muestras pequeñas, estacionalidad o campañas simultáneas.

## Observación en asistentes

Preparar una muestra estable de preguntas de compra: «¿Qué necesita un café para ofrecer fidelización con Wallet?», «¿Cómo recibir pedidos mayoristas ordenados?» y «¿Qué automatizar al comparar proveedores?». Registrar fecha, motor/modelo, pregunta literal, país/contexto, respuesta y enlaces citados. Observar con qué páginas fundamenta la respuesta y si describe correctamente IMAN. No convertir una muestra de respuestas en cuota de mercado, ranking universal ni prueba de que todos los usuarios ven lo mismo.

## Autoridad basada en evidencia

Documentar demostraciones, guías y casos propios. Si un cliente autoriza un caso, detallar el punto de partida, alcance, período, cómo se midió y factores externos. Las menciones editoriales deben ganarse por la utilidad del material; cualquier colaboración comercial se identifica. No se han enviado mensajes ni adquirido enlaces como parte de este trabajo.

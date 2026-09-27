# Auditoría de conversión — IMAN

Fecha: 27 de septiembre de 2026. Fuente revisada: `scripts/build.py`, `assets/site.js`, páginas generadas y copia local del Club original. Skills aplicadas: CRO, Copywriting y referencia de formularios. Esta auditoría no mide una mejora real: no hay un embudo instrumentado ni datos de conversión disponibles.

## Objetivo y arquitectura

Objetivo principal: una consulta comercial calificada por WhatsApp o una llamada agendada. Abrir WhatsApp es un paso del embudo, no una consulta enviada. La métrica final debe ser conversación recibida, propuesta y contratación.

Conservar la estética del Club original solicitada por Santiago. El trabajo de conversión debe concentrarse en mensaje, recorrido, claridad de la oferta y facilidad de contacto.

- IMAN Fidelización: oferta principal. Programa del negocio con Apple Wallet, Google Wallet, beneficios, avisos y email.
- IMAN Comercios: catálogo y pedidos minoristas o mayoristas.
- IMAN Automatizaciones: tareas y procesos conectados; incluye compras mayoristas.
- IMAN Turnos: solución complementaria.
- Club es el programa de clientes de un negocio, no otra marca que el visitante deba entender.

## Cambios prioritarios

### P0 — Un CTA comercial desde la primera pantalla

La home actual tiene «Quiero fidelizar mis clientes» y «Cómo funciona» apuntando ambos a `/fidelizacion/`. Esto impone otra página a quien ya quiere consultar y no diferencia las dos acciones.

Texto propuesto para home:

> Hacé que tus clientes vuelvan. Una y otra vez.
>
> Creamos el programa de fidelización de tu negocio con Apple Wallet, Google Wallet, notificaciones y email. Tus clientes guardan su tarjeta, reciben beneficios y tienen un motivo para volver.

- Primario: **Quiero una propuesta** → `#contacto`.
- Secundario: **Ver cómo funciona** → sección local `#como-funciona` con tres pasos y ejemplo visible.
- Microcopy: **Con tu marca. Sin una app extra para tus clientes.**
- Encabezado global: **Consultar por mi negocio** → `#contacto`.

No usar «Empezar gratis» ni precios, urgencia o plazos no confirmados. La consulta abre una conversación; no crea una cuenta ni activa un producto.

### P0 — El formulario debe explicar qué obtiene el visitante

Hoy el cierre «Contanos qué querés hacer crecer» es amplio; el botón «Preparar consulta en WhatsApp» hace protagonista el mecanismo. Mantener claro el destino, con texto más directo.

> **Veamos cómo funcionaría en tu negocio.**
>
> Contanos qué vendés y qué querés mejorar. Te orientamos sobre la solución y definimos alcance y presupuesto.

Formulario de una columna:

1. **Tu negocio** — requerido. Placeholder: «Nombre o rubro de tu negocio».
2. **Qué querés resolver** — selector ya elegido por página. Opciones: «Que mis clientes vuelvan», «Mostrar productos y recibir pedidos», «Automatizar una tarea», «Organizar turnos», «Necesito orientación».
3. **Contanos un poco más (opcional)** — placeholder contextual por servicio.

El nombre puede pedirse dentro de WhatsApp. Si se conserva en web, hacerlo opcional. No pedir teléfono ni email para una apertura de WhatsApp.

- Botón: **Continuar por WhatsApp**.
- Ayuda: **Se abre WhatsApp con tu consulta. Revisás el mensaje antes de enviarlo.**
- Alternativa visible: **Prefiero agendar una llamada**. Conservar «30 minutos» solo si se verifica que el enlace realmente ofrece esa duración.
- Salida sin formulario: **Escribir directamente por WhatsApp** con servicio contextual en el mensaje.
- No mostrar «Consulta enviada» al abrir una URL de WhatsApp.

El selector puede mostrar beneficios en vez de nombres internos; el mensaje final debe conservar el servicio asociado. No transmitir valores personales del formulario en analítica.

### P0 — Captar la intención en la misma página

Cada CTA a contacto debe mantener servicio y, si aplica, rubro. El visitante de «Distribuidoras pet» no debería llegar a una consulta sin contexto. Ejemplo de mensaje:

> Hola IMAN. Me interesa un catálogo mayorista para mi distribuidora pet. Mi negocio es [negocio]. Quiero resolver: [mensaje].

Las páginas de guías hoy llaman `page()` sin `contact_service` y quedan en «Quiero que me orienten». Cambiar el destino contextual: Wallet y recuperación → Fidelización; procesos → Automatizaciones. No pedirle al visitante que vuelva a clasificar su necesidad.

## Texto por solución

| Página | H1 | Bajada | CTA principal | CTA secundario |
|---|---|---|---|---|
| Fidelización | Tu marca en su Wallet. Un motivo para volver. | Creamos el programa de fidelización de tu negocio: tarjeta en Apple Wallet y Google Wallet, beneficios y campañas para seguir en contacto después de la compra. | Quiero mi programa de fidelización | Ver el recorrido del cliente |
| Comercios | Tus productos, en un link. Tus pedidos, más claros. | Creamos tu catálogo digital con productos, precios y condiciones de venta. Para que tus clientes elijan y tu equipo reciba la información que necesita para avanzar. | Quiero mi catálogo | Ver minorista y mayorista |
| Automatizaciones | Menos tareas repetidas. Más tiempo para tu negocio. | Conectamos consultas, pedidos, compras y reportes con las herramientas que ya usás. Empezamos por un proceso concreto, con reglas claras y una entrega que podés probar. | Evaluar mi proceso | Ver ejemplos de automatización |
| Turnos | Más tiempo para atender. Menos para coordinar. | Tus clientes consultan servicios y horarios y reservan desde un enlace. Tu equipo organiza el día en una misma agenda. | Consultar por mi agenda | Probar el recorrido de reserva |

Mantener «catálogo» en el primer bloque de Comercios. La fidelización y las automatizaciones son expansiones posteriores; no deben hacer que parezca obligatorio comprar tres servicios.

## Fidelización: hacer tangible el servicio principal

Orden recomendado: beneficio → experiencia visible → qué se entrega → ejemplos de uso → proceso → dudas → consulta.

Sección «Así se suma un cliente»:

1. **Escanea tu QR.** Accede al programa desde el local, tus redes o un enlace.
2. **Guarda tu tarjeta.** Lleva su identificación y beneficios en Apple Wallet o Google Wallet.
3. **Encuentra un motivo para volver.** Consulta sus premios y recibe las comunicaciones del programa por los canales acordados.

Sección «Qué armamos para tu negocio»:

- **Tu tarjeta con tu marca.** Diseño y recorrido de alta para el programa.
- **Reglas fáciles de explicar.** Puntos, visitas o beneficios definidos según tu operación y margen.
- **Wallet + email.** Avisos de la tarjeta y campañas de bienvenida, cumpleaños o recuperación.
- **Una forma de medirlo.** Altas, canjes y compras vinculadas al programa, según la información disponible.

Sección comercial:

> **Tu primera compra ya pasó. La próxima se puede trabajar.**
>
> Armemos una propuesta para seguir cerca de tus clientes y darles una razón para elegirte otra vez.

CTA: **Consultar por mi programa**.

Condiciones de Wallet en FAQ y breve nota junto al ejemplo: **Las funciones y los avisos dependen del dispositivo, los permisos y el tipo de tarjeta.** Mantener visible una distinción suficiente; evitar repetir párrafos de limitaciones en cada sección. No afirmar notificaciones ilimitadas, entrega garantizada, integración ya activada o geofencing infalible.

## Automatizaciones: paquetes por resultado, etapas como proceso

Las tres cajas actuales «Diagnóstico / Implementación / Acompañamiento» son etapas, pero están presentadas como paquetes con tres CTAs diferentes. Para una oferta más tangible, mostrar primero qué problema se contrata. Después explicar una única secuencia de trabajo.

### 1. Consultas ordenadas

> La consulta entra, se registra y llega a la persona indicada con el contexto necesario.

Entregables: origen de consultas conectado; registro acordado; clasificación y derivación; seguimiento; pruebas de casos incompletos.

CTA: **Ordenar mis consultas**.

### 2. Pedidos conectados

> Del catálogo o formulario a un pedido con los datos necesarios para trabajar.

Entregables: captura estructurada; validación de productos y cantidades; detección de faltantes; registro en herramienta disponible; estado y avisos acordados.

CTA: **Automatizar mis pedidos**.

### 3. Compras con reglas

> Compará propuestas de proveedores con los mismos criterios y dejá las decisiones importantes bajo aprobación.

Entregables: necesidad de compra; proveedores y condiciones; comparación por precio y entrega; límites de presupuesto; aprobación; historial de decisiones.

CTA: **Evaluar mis compras**. Secundario: **Explorar un ejemplo** hacia la demo ilustrativa.

### 4. Reportes preparados

> Reuní la información que revisás cada semana sin armar la misma planilla desde cero.

Entregables: fuentes acordadas; campos y métricas; frecuencia; salida; manejo de datos faltantes.

CTA: **Preparar mis reportes**.

Debajo, una secuencia común:

> **Elegimos un proceso → Acordamos alcance y presupuesto → Lo desarrollamos y probamos → Te lo entregamos y definimos el seguimiento.**

Nota comercial única: **La propuesta separa implementación, mantenimiento y servicios externos. Las conexiones se confirman al revisar tus herramientas.**

No inventar paquetes con precios fijos, límites de flujos, horas de soporte o fechas de entrega sin datos comerciales confirmados. No mencionar la denominación anterior de la unidad.

## Comercios: catálogo primero, conexión después

Ejemplo comercial más claro que «Tu producto / Otra elección»: mostrar una ficha ilustrativa con nombre, presentación, precio ilustrativo y cantidad. En mayoristas mostrar caja/bulto, pedido mínimo y condición de venta como campos; no inventar que hay pagos o stock integrado.

Dos opciones con CTA al contacto de la misma página:

- **Vendo a consumidores:** «Un catálogo que puedan abrir desde tu bio o WhatsApp, elegir productos y armar una consulta o pedido.» CTA **Consultar por catálogo minorista**.
- **Vendo a comercios:** «Productos, presentaciones y condiciones para que cada comprador prepare un pedido completo.» CTA **Consultar por catálogo mayorista**.

Texto de conexión posterior:

> **El catálogo abre la venta. IMAN puede acompañar lo que sigue.**
>
> Sumá un programa de fidelización para la próxima compra o conectá pedidos y compras con tus procesos. Podemos empezar por el catálogo y ampliar cuando lo necesites.

## Páginas por rubro: mensaje que coincide con la necesidad

Conservar vocabulario específico. Reemplazar CTAs uniformes «Veámoslo en mi negocio» cuando haya un beneficio claro:

| Página | CTA principal | Ejemplo relevante |
|---|---|---|
| Gastronomía | Quiero que vuelvan a mi local | Tarjeta de visitas y premio alcanzado |
| Pet | Trabajar la recompra de mis clientes | Reposición de alimento según historial |
| Indumentaria | Volver a conectar con mis clientes | Campaña de nueva colección |
| Limpieza minorista | Activar la recompra en mi negocio | Recordatorio de reposición y combo |
| Repuestos / talleres | Ordenar el seguimiento de mis clientes | Próximo mantenimiento definido por el taller |
| Distribuidoras | Ordenar catálogo y pedidos | Presentaciones, condiciones y pedido estructurado |
| Transporte | Automatizar mis avisos de entrega | Cambio confirmado de estado y aviso |
| Distribuidoras pet / limpieza | Consultar por mi catálogo mayorista | Comprador recurrente y sus condiciones |

En Distribuidoras la página actual prioriza recuperación de cartera y agentes B2B; por el posicionamiento solicitado debe empezar con catálogo y pedidos, y luego sumar seguimiento y compras automatizadas.

## Credibilidad sin prueba inventada

Mientras no haya casos verificables, usar demostración del trabajo: vista del cliente, vista del comercio, entregables y un proceso de implementación explicado. Etiquetar ejemplos una vez en un lugar legible. Evitar curvas ascendentes sin datos: visualmente sugieren resultados medidos aunque haya una nota «ilustrativo».

No publicar logos de clientes, testimonios, ahorros, incrementos de ventas, integraciones desplegadas o número de comercios sin evidencia y autorización. Tampoco insertar formularios que simulen una cuenta ya creada.

## Medición y experimentos posteriores

La implementación actual solo emite `iman:cta_click` como evento de navegador; eso no guarda datos ni demuestra que exista analítica. Instrumentar después de resolver el destino de medición:

- Vista de página con servicio, rubro, fuente/campaña y dispositivo.
- Clic de CTA con posición y destino.
- Inicio del formulario y error de validación sin valores personales.
- Apertura de WhatsApp, separada de consulta recibida.
- Clic a agenda, separado de reserva confirmada.
- Clasificación comercial de consultas, propuestas y contrataciones.

Hipótesis a probar cuando haya volumen suficiente: WhatsApp directo frente a formulario breve; «Quiero una propuesta» frente a CTA por beneficio; ejemplo visible de Wallet frente a imagen estática. No afirmar que alguna versión convierte mejor antes de medir.

## Aceptación antes de publicar

1. La home comunica fidelización y muestra un CTA comercial sin navegar a otra página.
2. Cada servicio explica qué se contrata y qué sucede después de consultar.
3. Formulario y WhatsApp conservan producto/rubro; campos opcionales se manejan sin textos vacíos extraños.
4. Los botones funcionan en móvil, con teclado y sin doble envío.
5. No hay promesas de rankings, resultados o capacidades ya activadas que no estén verificadas.
6. El seguimiento distingue clics, aperturas y conversiones reales.

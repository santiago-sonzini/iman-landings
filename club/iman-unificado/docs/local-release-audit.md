# Auditoría local previa a publicación

Fecha: 27 de septiembre de 2026. Alcance: archivos locales, HTML generado, código del frontend y pruebas del backend. Sin navegador, cambios de DNS ni envíos reales durante esta auditoría.

## Verificación realizada

| Comprobación | Resultado |
| --- | --- |
| `python3 scripts/build.py` | 21 páginas generadas y ZIP actualizado |
| `python3 scripts/check.py` | 0 errores |
| HTML canónico | Un H1, título, descripción y canonical coherente por página |
| Navegación local | Archivos, assets y anchors comprobados por el chequeo; sin destinos faltantes |
| JSON-LD | Parseable; preguntas FAQ presentes en el contenido visible |
| Sitemap | 21 URLs canónicas; demos excluidas |
| Branding | Sin nombre anterior de Automatizaciones en las páginas públicas; solo ruta antigua en `_redirects` |
| Turnos | Fuente `legacy/turnos/` preservada exactamente tras compilar; aviso de demo y contactos ficticios sin envíos |
| ZIP | 61 archivos; 1.765.934 bytes en esta revisión; incluye bundle de Worker y rutas |
| Bundle | 32.526 bytes; coincide byte a byte entre `server/dist`, `public/` y el ZIP |
| Archivos privados | Sin `.env`, `node_modules`, README ni propuestas descartadas en el paquete |
| Backend | 31 pruebas aprobadas con SQLite local y transporte simulado |

Los tamaños pueden cambiar en futuras compilaciones. El resultado automatizado del sitio se guarda en [validation.json](validation.json).

## Conversión y copy

- La home prioriza fidelización y distingue su CTA de contacto de la explicación de funcionamiento.
- Cada servicio presenta una aplicación y entregables concretos. Comercios cubre catálogos y pedidos; las compras automatizadas quedan dentro de Automatizaciones.
- El formulario admite contacto por email, con WhatsApp opcional. Calendly es una alternativa visible y se carga al elegir la pestaña de agenda.
- La newsletter es independiente y su mensaje de éxito solicita revisar el email; no afirma que la persona ya esté suscripta.
- Las cifras 1.248, 320, 12% y 28% pertenecen a un panel de demostración. Tanto el panel como la leyenda indican que son ilustrativas; no se presentan como resultados de IMAN.
- Las vistas de Wallet y avisos son ilustrativas. No se promete envío garantizado por ubicación, notificaciones ilimitadas ni integraciones ya operativas para un cliente específico.
- No se encontró una promesa de primer puesto en buscadores, crecimiento garantizado o testimonios inventados en las páginas generadas.
- Las respuestas exitosas de los formularios dependen de aceptación del proveedor. Eso no demuestra entrega en bandeja de entrada ni lectura del correo.

## Observaciones abiertas de frontend

Estas observaciones fueron comunicadas al responsable de integración; no se modificó el código desde esta auditoría:

1. El campo opcional `rubro` del newsletter permitía 120 caracteres mientras el backend acepta 100. Alinear el límite para evitar rechazos de datos que el navegador considera válidos.
2. Los manejadores del frontend no distinguían `retryable:false`. Ante un resultado de envío ambiguo conservado por el backend, evitar indicar que reintentar volverá a enviar. Ofrecer revisar el correo, WhatsApp o Calendly; no cambiar la clave para forzar un duplicado.

No afectan la deduplicación del servidor, pero conviene resolverlas antes del cierre del paquete.

## Límites del resultado

La revisión no mide la tasa de conversión ni demuestra una mejora comercial. No valida Core Web Vitals reales, aspecto móvil, cabeceras/redirects de producción, disponibilidad real de Calendly ni recepción de correo. Esas verificaciones pertenecen al despliegue y a la medición posterior. La publicación en Cloudflare sigue pendiente de confirmación documental del responsable.

// Los dos planes de Blin × IMÁN. Única fuente de precios y contenidos de la página.
// Cada plan = un paquete de social media de Blin + la cuota de IMÁN ($250.000, hasta 500 productos).
// Los precios solo se muestran en el resultado del test.
window.BLIN = (() => {
  const money = n => '$' + Math.round(n).toLocaleString('es-AR');

  // Topes de la parte de IMÁN (iguales en los dos planes). Ver la cuenta de costos en LEEME.md.
  const LIMITS = { productos: 500, conversaciones: 1000, avisos: 500 };
  const CUOTA_IMAN = 250000;

  // Paquetes de social media de Blin (presupuesto 2026 de blinagency.com/portfolio).
  const blin = {
    estandar: {
      name: 'Social Media Estándar', price: 550000,
      items: ['Producción de contenido de 1 a 3 horas', 'Gestión de 1 plataforma (Instagram, Facebook, TikTok…)', 'Calendario mensual', '4 días de historias (mínimo 3)', '2 días de publicación semanal: reel, carrusel o publicación', 'Estrategias de contenido', 'Uso de IA para mejorar el contenido', 'Análisis de marca', 'Análisis de métricas mensuales'],
    },
    mega: {
      name: 'Social Media Mega', price: 750000,
      items: ['Producción de contenido de 1 a 4 horas', 'Gestión de 2 plataformas (Instagram, Facebook, TikTok…)', 'Calendario mensual', '5 días de historias (mínimo 3 por día, sin máximo)', '3 días de publicación semanal: reel, carrusel o publicación', 'Estrategias de contenido', 'Análisis de marca', 'Análisis de métricas mensuales', 'Uso de IA para el contenido creativo', '1 pieza de diseño gráfico: gift card, plotter, packaging…', 'Campañas publicitarias con Meta Ads', 'Asesoría digital a disposición'],
    },
  };

  // Lo que suma IMÁN (la hoja del Mega Plus).
  const imanItems = [
    { k: 'whatsapp', t: 'Asistente de WhatsApp con IA', d: `Responde al instante, recomienda, toma pedidos y reservas. Hasta ${LIMITS.conversaciones.toLocaleString('es-AR')} conversaciones por mes.` },
    { k: 'catalogo', t: 'Carta 3D o catálogo online', d: `Hasta ${LIMITS.productos} productos, con el diseño de Blin.` },
    { k: 'gestion', t: 'Sistema de gestión con tu diseño', d: 'Pedidos, clientes y ventas en un solo lugar.' },
    { k: 'club', t: 'Club de fidelización', d: 'Con dos estrategias para que vuelvan, a la medida de tu marca.' },
    { k: 'juegos', t: 'Juegos para tus clientes', d: 'Pulsador, ruleta o raspadita para el club y los eventos.' },
    { k: 'avisos', t: 'Avisos de eventos y lanzamientos', d: `Por WhatsApp a quien corresponde: nueva colección, evento, beneficio. Hasta ${LIMITS.avisos} por mes.` },
    { k: 'turnos', t: 'Reservas y turnos online', d: 'Agenda propia, sin idas y vueltas por chat.' },
    { k: 'metricas', t: 'Métricas de redes y web', d: 'Un tablero con lo que pasa en redes, en la web y en ventas.' },
    { k: 'stock', t: 'Pronóstico de stock', d: 'Te avisa qué se va a agotar y cuánto pedir.' },
    { k: 'acomp', t: 'Acompañamiento', d: 'Ajustamos todo con vos, mes a mes.' },
  ];

  const offers = [
    { id: 'megaplus', name: 'Mega Plus', base: 'mega', price: blin.mega.price + CUOTA_IMAN, tag: 'El plan completo: más contenido, dos redes y campañas, con todo IMÁN.' },
    { id: 'estandarplus', name: 'Estándar Plus', base: 'estandar', price: blin.estandar.price + CUOTA_IMAN, tag: 'Para arrancar: una red con estrategia, con todo IMÁN.' },
  ];
  const byId = Object.fromEntries(offers.map(o => [o.id, o]));

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Tarjeta de plan para el resultado: lo de Blin y lo de IMÁN en dos grupos.
  const planCard = (o, opts = {}) => `
    <article class="plan${o.id === 'megaplus' ? ' plus' : ''}" data-plan="${o.id}">
      ${opts.badge ? `<span class="plan-badge">${esc(opts.badge)}</span>` : ''}
      <header><span class="plan-line">Blin × IMÁN</span><h3 class="plan-name">${esc(o.name)}</h3></header>
      <p class="plan-tag">${esc(o.tag)}</p>
      <div class="plan-price"><span>${money(o.price)}</span><small>por mes</small></div>
      <h4 class="plan-g">De Blin · ${esc(blin[o.base].name)}</h4>
      <ul class="plan-list">${blin[o.base].items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      <h4 class="plan-g iman">De IMÁN</h4>
      <ul class="plan-list iman">${imanItems.map(i => `<li>${esc(i.t)}</li>`).join('')}</ul>
      ${opts.action ? `<button class="btn ${o.id === 'megaplus' ? 'light' : 'line'} sm plan-act" type="button" data-choose="${o.id}">${esc(opts.action)}</button>` : ''}
    </article>`;

  return { money, esc, LIMITS, CUOTA_IMAN, blin, imanItems, offers, byId, planCard };
})();

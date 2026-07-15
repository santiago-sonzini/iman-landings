/* ==========================================================================
   ui-vertical.js — la MISMA página pública de reservas de Imán Turnos
   (clases reales de ../../css/booking.css) pero parametrizada por rubro.
   El creative que gustó (producto-reserva) estaba cableado a barbería; acá
   el mismo interface se arma desde un config: nombre, foto, rating, zona,
   pregunta y lista de servicios. El color de acento lo pone cada HTML
   sobreescribiendo --acento en :root. Uso:
     document.querySelector('[data-reserva]').innerHTML = buildReserva(CFG)
   ========================================================================== */
(function (global) {
  'use strict';

  /* logo imán idéntico a UI.imanLogo() de la app (mismo markup que ui-fragments) */
  const LOGO = `
    <span class="iman-wrap" style="position:relative;display:inline-block">
      <svg class="iman-logo" viewBox="0 0 120 132" aria-hidden="true">
        <path class="iman-cuerpo-borde" d="M34 92 V56 A26 26 0 0 1 86 56 V92"/>
        <path class="iman-cuerpo" d="M34 92 V56 A26 26 0 0 1 86 56 V92"/>
        <rect class="iman-polo" x="13" y="88" width="42" height="20" rx="4"/>
        <rect class="iman-polo" x="65" y="88" width="42" height="20" rx="4"/>
        <path class="iman-chispa" d="M28 114 l-7 9 M60 117 v10 M92 114 l7 9"/>
      </svg>
    </span>`;

  const STAR = '★';

  function hero(cfg) {
    return `<div class="bk-hero">
      <div class="powered">${LOGO} con Imán</div>
      <div class="foto">${cfg.foto}</div>
      <h1>${cfg.nombre}</h1>
      <div class="meta"><span class="estrellas">${STAR.repeat(5)} ${cfg.rating}</span>
        <span>·</span><span>${cfg.zona}</span></div>
    </div>`;
  }

  /* barra de progreso: paso 1 (servicio) — done el 0, now el 1 */
  function prog() {
    return `<div class="bk-prog">${[0, 1, 2, 3].map(i =>
      `<div class="step ${i < 1 ? 'done' : i === 1 ? 'now' : ''}"><i></i></div>`).join('')}</div>`;
  }

  function svc(s) {
    return `<button class="svc"><div class="em">${s.em}</div>
      <div class="info"><div class="nom">${s.nom}</div><div class="dur">🕒 ${s.dur}</div></div>
      <div class="precio">$ ${s.precio}</div></button>`;
  }

  function buildReserva(cfg) {
    return `<div class="bk">
      ${hero(cfg)}
      ${prog()}
      <div class="bk-body">
        <h2 class="bk-titulo">${cfg.titulo}</h2>
        <p class="bk-sub">${cfg.sub || 'Elegí el servicio y después el horario.'}</p>
        ${cfg.servicios.map(svc).join('')}
      </div>
    </div>`;
  }

  global.buildReserva = buildReserva;
})(typeof window !== 'undefined' ? window : this);

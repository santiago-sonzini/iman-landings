/* ==========================================================================
   ui-fragments.js — la UI REAL de Imán Turnos, reconstruida con las clases
   verdaderas de ../../css/app.css y ../../css/booking.css. Un solo lugar:
   cada creative (static o reel) monta el mismo interface, con los datos
   sembrados del producto (Barbería El Roble, barbero Nico, precios en ARS,
   nombres argentinos). Uso: <div data-ui="timeline"></div> + este script.
   Estados para animar: agregá clases al contenedor y la escena reacciona.
   ========================================================================== */
(function (global) {
  'use strict';

  /* logo imán idéntico a UI.imanLogo() de la app */
  const LOGO = (parts) => `
    <span class="iman-wrap" style="position:relative;display:inline-block">
      <svg class="iman-logo" viewBox="0 0 120 132" aria-hidden="true">
        <path class="iman-cuerpo-borde" d="M34 92 V56 A26 26 0 0 1 86 56 V92"/>
        <path class="iman-cuerpo" d="M34 92 V56 A26 26 0 0 1 86 56 V92"/>
        <rect class="iman-polo" x="13" y="88" width="42" height="20" rx="4"/>
        <rect class="iman-polo" x="65" y="88" width="42" height="20" rx="4"/>
        <path class="iman-chispa" d="M28 114 l-7 9 M60 117 v10 M92 114 l7 9"/>
      </svg>
      ${parts ? `<span class="iman-parts">
        <span class="iman-part p1">✂️</span>
        <span class="iman-part p2">💈</span>
        <span class="iman-part p3">🪒</span></span>` : ''}
    </span>`;

  const ICO_CHEV_L = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
  const ICO_CHEV_R = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`;
  const ICO_BOLT   = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13z"/></svg>`;
  const ICO_WA     = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.5-.1 1z"/></svg>`;
  const ICO_CHECK  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
  const ICO_PLUS   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
  const ICO_SHARE  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>`;
  const ICO_STAR   = `★`;

  const av = (n) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  /* ---------------- APP DEL DUEÑO — TIMELINE DEL DÍA -------------------- */
  function topBar() {
    return `<header class="top">
      ${LOGO(false)}
      <span class="marca">Imán<small>El Roble</small></span>
      <span class="top-sp"></span>
      <button class="icon-btn" aria-label="Compartir">${ICO_SHARE}</button>
    </header>`;
  }
  function fechaNav() {
    return `<nav class="fecha-nav">
      <button class="nav-btn">${ICO_CHEV_L}</button>
      <div class="fecha-lbl"><span class="dia">Hoy, miércoles 12 <span class="caret">▾</span></span>
        <span class="hoy-chip">Hoy</span></div>
      <button class="nav-btn">${ICO_CHEV_R}</button>
    </nav>`;
  }
  function ocupa(pct, huecos) {
    return `<div class="ocupa">
      <div class="lbl"><b>${pct}%</b> lleno</div>
      <div class="barra"><i style="width:${pct}%"></i></div>
      <div class="huecos-tag">${huecos} ${huecos === 1 ? 'hueco' : 'huecos'}</div>
    </div>`;
  }
  function semana(sel) {
    const dd = [['LU', 9, 3], ['MA', 10, 2], ['MI', 11, 3], ['JU', 12, 3], ['VI', 13, 1], ['SÁ', 14, 3], ['DO', 15, 0]];
    return `<div class="semana-strip">${dd.map(([dw, dn, on], i) => {
      const dots = [0, 1, 2].map(k => `<i class="${k < on ? 'on' : ''}"></i>`).join('');
      const cls = i === sel ? 'sel' : (on === 0 ? 'cerrado' : (i === 3 ? 'hoy' : ''));
      return `<div class="dia-mini ${cls}"><div class="dw">${dw}</div><div class="dn">${dn}</div><div class="dots">${dots}</div></div>`;
    }).join('')}</div>`;
  }
  function turno(h, m, nom, det, dur, estado) {
    const pill = estado === 'ok' ? `<span class="estado-pill ok">${ICO_CHECK} vino</span>`
      : estado === 'conf' ? `<span class="estado-pill" style="background:var(--acento-suave)"><span class="canal-ico">📲</span> confirmó</span>` : '';
    return `<div class="tl-item"><div class="tl-rail"><div class="h">${h}</div><div class="m">${m}</div></div>
      <div class="tl-body"><div class="turno ${estado === 'ok' ? 'asistio' : ''}">
        <div class="ava">${av(nom)}</div>
        <div class="info"><div class="nom">${nom}</div><div class="det">${det}${pill ? '<span class="pto"></span>' + pill : ''}</div></div>
        <div class="lado"><div class="dur">${dur}′</div></div>
      </div></div></div>`;
  }
  function huecoDestacado(h, m, rango, prime) {
    return `<div class="tl-item"><div class="tl-rail"><div class="h">${h}</div><div class="m">${m}</div></div>
      <div class="tl-body"><div class="hueco destacado ${prime ? 'prime' : ''}" id="hueco-hero">
        <div class="prox">${ICO_BOLT} Próximo hueco</div>
        <div class="h-fila"><div class="h-info">
          <div class="h-rango"><span class="z-mark"></span> ${rango}</div>
          <div class="h-sub">40 min libres · llenalo con un cliente tuyo</div>
        </div></div>
        <div class="h-acciones">
          <button class="btn btn-acento btn-llenar" id="btn-llenar">${ICO_BOLT} Llenar este hueco</button>
        </div>
      </div></div></div>`;
  }
  function huecoBooked(h, m, nom, det) {
    // el mismo slot, ahora agendado (estado "después")
    return `<div class="tl-item"><div class="tl-rail"><div class="h">${h}</div><div class="m">${m}</div></div>
      <div class="tl-body"><div class="turno recien" id="turno-nuevo">
        <div class="ava">${av(nom)}</div>
        <div class="info"><div class="nom">${nom}</div><div class="det">${det}<span class="pto"></span>
          <span class="estado-pill" style="background:var(--verde-ok);color:#fff">${ICO_CHECK} agendado</span></div></div>
        <div class="lado"><div class="dur">40′</div></div>
      </div></div></div>`;
  }
  function tabbar(active) {
    const items = [['Agenda', '📅'], ['Clientes', '👥'], ['Promos', '🎁'], ['Ajustes', '⚙️']];
    return `<nav class="tabbar">${items.map(([t, e], i) =>
      `<a class="${i === active ? 'activo' : ''}"><span style="font-size:22px">${e}</span><span>${t}</span><span class="pt"></span></a>`).join('')}</nav>`;
  }

  function timeline(opts) {
    opts = opts || {};
    const booked = opts.booked;
    return `<div class="app" style="min-height:auto">
      ${topBar()}
      <div class="pantalla">
        ${fechaNav()}
        ${ocupa(booked ? 82 : 74, booked ? 2 : 3)}
        ${semana(3)}
        <div class="tl">
          ${turno('11', '00', 'Diego Sosa', 'Corte', 40, 'ok')}
          ${turno('12', '15', 'Lucas Ferreyra', 'Corte + Barba', 55, 'ok')}
          ${booked
            ? huecoBooked('15', '00', 'Rodrigo Núñez', 'Corte + Barba')
            : huecoDestacado('15', '00', '15:00 – 15:40', false)}
          ${turno('16', '30', 'Juan Cruz Molina', 'Corte + Barba', 55, 'conf')}
          ${turno('17', '30', 'Pablo Herrera', 'Corte + Barba', 55, '')}
        </div>
      </div>
      ${tabbar(0)}
    </div>`;
  }

  /* ---------------- SHEET "LLENAR ESTE HUECO" --------------------------- */
  function cliFila(nom, servicio, por, urgente) {
    return `<div class="cli-fila">
      <div class="ava" style="background:var(--acento-suave);color:var(--acento-osc)">${av(nom)}</div>
      <div class="info"><div class="nom">${nom}</div>
        <div class="por">${servicio} · ${urgente ? '<b>' + por + '</b>' : por}</div></div>
      <button class="btn btn-wa sm">${ICO_WA} WhatsApp</button>
    </div>`;
  }
  function huecoSheet() {
    return `<div class="sheet-static">
      <div class="handle" style="margin:11px auto 4px"></div>
      <div class="sheet-head"><div style="flex:1">
        <h3>Llenar el hueco de las 15:00</h3>
        <p>A estos clientes ya les toca volver. Elegí y mandales el WhatsApp.</p>
      </div></div>
      <div class="sheet-body">
        ${cliFila('Tomás Aguilar', 'Corte', 'hace 52 días · le toca', true)}
        ${cliFila('Diego Sosa', 'Corte', 'hace 40 días · le toca', true)}
        ${cliFila('Marta Giménez', 'Corte', 'hace 31 días', false)}
      </div>
    </div>`;
  }

  /* WhatsApp listo (mock del mensaje que arma la app, editable) */
  function waPreview() {
    return `<div class="wa-mock">
      <div class="wa-top"><span class="wa-ava">TA</span><div><b>Tomás Aguilar</b><small>en línea</small></div></div>
      <div class="wa-msg">¡Hola Tomás! Soy Nico de <b>El Roble</b> 💈 Tengo un lugar hoy a las <b>15:00</b> si querés pasar por tu corte. ¿Te lo reservo?</div>
      <div class="wa-hint">Vos lo revisás y lo mandás — nada se envía solo.</div>
    </div>`;
  }

  /* ---------------- PÁGINA PÚBLICA (reservar.html) --------------------- */
  function bkHero() {
    return `<div class="bk-hero">
      <div class="powered">${LOGO(false)} con Imán</div>
      <div class="foto">💈</div>
      <h1>Barbería El Roble</h1>
      <div class="meta"><span class="estrellas">${ICO_STAR}${ICO_STAR}${ICO_STAR}${ICO_STAR}${ICO_STAR} 4,9</span>
        <span>·</span><span>Palermo, CABA</span></div>
    </div>`;
  }
  function prog(step) {
    return `<div class="bk-prog">${[0, 1, 2, 3].map(i =>
      `<div class="step ${i < step ? 'done' : i === step ? 'now' : ''}"><i></i></div>`).join('')}</div>`;
  }
  function svc(em, nom, dur, precio) {
    return `<button class="svc"><div class="em">${em}</div>
      <div class="info"><div class="nom">${nom}</div><div class="dur">🕒 ${dur} min</div></div>
      <div class="precio">$ ${precio}</div></button>`;
  }
  function publicServicios() {
    return `<div class="bk">
      ${bkHero()}
      ${prog(1)}
      <div class="bk-body">
        <h2 class="bk-titulo">¿Qué te hacés?</h2>
        <p class="bk-sub">Elegí el servicio y después el horario.</p>
        ${svc('✂️', 'Corte', 40, '8.000')}
        ${svc('💈', 'Corte + Barba', 55, '12.000')}
        ${svc('🧔', 'Barba', 25, '5.000')}
        ${svc('🪒', 'Perfilado + diseño', 20, '4.500')}
      </div>
    </div>`;
  }
  function publicHoras(conIncentivo) {
    const dias = [['MIÉ', 12, 'JUL'], ['JUE', 13, 'JUL'], ['VIE', 14, 'JUL'], ['SÁB', 15, 'JUL']];
    const horas = ['14:00', '14:40', '15:00', '15:40', '16:30', '17:10'];
    return `<div class="bk">
      ${bkHero()}
      ${prog(2)}
      <div class="bk-body">
        <a class="bk-volver">${ICO_CHEV_L} Corte + Barba · $ 12.000</a>
        <h2 class="bk-titulo">¿Cuándo te viene?</h2>
        ${conIncentivo ? `<div class="incentivo"><div class="ping"></div>
          <div class="tit">🎁 Lavado gratis</div>
          <div class="txt">Si reservás en los próximos 30 min, el lavado va de regalo.</div>
          <div class="cd"><span class="lbl">termina en</span> 29:14</div></div>` : ''}
        <div class="dias-scroll">${dias.map(([dw, n, m], i) =>
      `<div class="dia-pastilla ${i === 0 ? 'sel' : ''}"><div class="dow">${dw}</div><div class="num">${n}</div><div class="mes">${m}</div></div>`).join('')}</div>
        <div class="horas-grid">${horas.map((hh, i) =>
      `<button class="hora-btn ${i === 2 ? 'sel' : ''}">${hh}${i === 2 ? '<span class="fuego">🔥</span>' : ''}</button>`).join('')}</div>
      </div>
    </div>`;
  }
  function publicOk() {
    return `<div class="bk"><div class="bk-ok">
      <div class="marca-ok">${ICO_CHECK}</div>
      <h1>¡Listo, Tomás!</h1>
      <p class="sub">Te esperamos el miércoles 12 a las 15:00 en El Roble.</p>
      <div class="resumen">
        <div class="r-fila"><span class="k">Servicio</span><span class="v">Corte + Barba</span></div>
        <div class="r-fila"><span class="k">Día y hora</span><span class="v">Mié 12 · 15:00</span></div>
        <div class="r-fila r-total"><span class="k">Total</span><span class="v">$ 12.000</span></div>
      </div>
    </div></div>`;
  }

  /* ---------------- BUILDER DE PROMOS ---------------------------------- */
  function promoBuilder(step) {
    return `<div class="app" style="min-height:auto">
      ${topBar()}
      <div class="pantalla">
        <div class="seccion-tit"><h2>Nueva promo</h2></div>
        <div class="tarjeta">
          <div class="campo"><label>Incentivo</label>
            <div class="promo-opts">
              <span class="chip ${step >= 1 ? 'on' : ''}">🎁 Lavado gratis</span>
              <span class="chip">💸 15% off</span>
              <span class="chip">🧔 Barba gratis</span>
            </div>
          </div>
          <div class="campo"><label>¿Cuándo aparece?</label>
            <div class="promo-opts">
              <span class="chip ${step >= 2 ? 'on' : ''}">🕳️ En los huecos</span>
              <span class="chip">📅 Días flojos</span>
            </div>
          </div>
          <div class="campo"><label>Urgencia</label>
            <div class="promo-opts"><span class="chip sena ${step >= 3 ? 'on' : ''}">⏱️ Reservá en 30 min</span></div>
          </div>
        </div>
        <button class="btn btn-acento block ${step >= 3 ? 'listo' : ''}">${ICO_BOLT} Activar promo</button>
      </div>
    </div>`;
  }

  /* ---------------- CROPS (componentes reales sueltos, para pain/oferta) */
  function cropHueco() {
    return `<div class="crop"><div class="hueco destacado" style="max-width:440px">
      <div class="prox">${ICO_BOLT} Próximo hueco</div>
      <div class="h-fila"><div class="h-info">
        <div class="h-rango"><span class="z-mark"></span> 15:00 – 15:40</div>
        <div class="h-sub">40 min libres · llenalo con un cliente tuyo</div></div></div>
      <div class="h-acciones"><button class="btn btn-acento btn-llenar">${ICO_BOLT} Llenar este hueco</button></div>
    </div></div>`;
  }
  function cropOcupa() {
    return `<div class="crop" style="max-width:460px">
      <div class="ocupa" style="margin:0 0 12px"><div class="lbl"><b>62%</b> lleno</div>
        <div class="barra"><i style="width:62%"></i></div><div class="huecos-tag">7 huecos</div></div>
      ${semana(3)}</div>`;
  }
  function cropLetoca() {
    return `<div class="crop" style="max-width:460px">${cliFila('Tomás Aguilar', 'Corte', 'hace 52 días · le toca', true)}
      <div style="margin-bottom:0">${cliFila('Diego Sosa', 'Corte', 'hace 40 días · le toca', true)}</div></div>`;
  }
  function cropPromo() {
    return `<div class="crop" style="max-width:440px"><div class="incentivo"><div class="ping"></div>
      <div class="tit">🎁 Lavado gratis</div>
      <div class="txt">Si reservás en los próximos 30 min, el lavado va de regalo.</div>
      <div class="cd"><span class="lbl">termina en</span> 29:14</div></div></div>`;
  }
  function cropSvc() {
    return `<div class="crop" style="max-width:460px">
      ${svc('✂️', 'Corte', 40, '8.000')}${svc('💈', 'Corte + Barba', 55, '12.000')}
      <div style="margin-bottom:0">${svc('🧔', 'Barba', 25, '5.000')}</div></div>`;
  }

  /* ---------------- montaje automático --------------------------------- */
  const FRAGS = {
    'crop-hueco': cropHueco,
    'crop-ocupa': cropOcupa,
    'crop-letoca': cropLetoca,
    'crop-promo': cropPromo,
    'crop-svc': cropSvc,
    timeline: () => timeline({ booked: false }),
    'timeline-booked': () => timeline({ booked: true }),
    'hueco-sheet': huecoSheet,
    'wa-preview': waPreview,
    'public-servicios': publicServicios,
    'public-horas': () => publicHoras(false),
    'public-horas-promo': () => publicHoras(true),
    'public-ok': publicOk,
    'promo-builder': () => promoBuilder(3),
    logo: () => LOGO(true),
  };

  function mount(root) {
    (root || document).querySelectorAll('[data-ui]').forEach(el => {
      const key = el.getAttribute('data-ui');
      if (FRAGS[key]) el.innerHTML = FRAGS[key]();
    });
  }

  global.UIFrag = { mount, FRAGS, LOGO, timeline, huecoSheet, waPreview, publicServicios, publicHoras, publicOk, promoBuilder };
  if (typeof document !== 'undefined') {
    if (document.readyState !== 'loading') mount();
    else document.addEventListener('DOMContentLoaded', () => mount());
  }
})(typeof window !== 'undefined' ? window : this);

/* ==========================================================================
   Imán Turnos — helpers de UI compartidos (sin dependencias)
   DOM builder · íconos SVG · logo imán · bottom sheet físico · toasts
   ========================================================================== */
(function (global) {
  'use strict';

  /* mini DOM builder: h('div.clase#id', {attrs}, ...hijos) */
  function h(sel, props, ...kids) {
    const [tagPart, ...rest] = sel.split(/(?=[.#])/);
    const tag = tagPart || 'div';
    const el = document.createElement(tag);
    for (const token of rest) {
      // tolera espacios dentro del segmento: '.turno asistio' → 2 clases
      if (token[0] === '.') token.slice(1).split(/\s+/).forEach(c => c && el.classList.add(c));
      else if (token[0] === '#') el.id = token.slice(1).trim();
    }
    if (props && (props.nodeType || typeof props !== 'object' || Array.isArray(props))) {
      kids.unshift(props); props = null;
    }
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(kid));
    }
    return el;
  }

  /* iniciales para avatar */
  function iniciales(nombre) {
    return nombre.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  /* íconos SVG (stroke, cartoon-limpio) */
  const P = 'stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const ICO = {
    cal: `<svg viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="16" rx="3" ${P}/><path d="M3 9h18M8 2.5v4M16 2.5v4" ${P}/></svg>`,
    users: `<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2" ${P}/><path d="M3.5 20c0-3.3 2.5-5.2 5.5-5.2s5.5 1.9 5.5 5.2" ${P}/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 20c0-2.4-1-4-2.4-4.8" ${P}/></svg>`,
    tag: `<svg viewBox="0 0 24 24"><path d="M3.5 12.5 12 4h6.5V10.5L10 19a2 2 0 0 1-2.8 0l-3.7-3.7a2 2 0 0 1 0-2.8Z" ${P}/><circle cx="15" cy="8" r="1.4" fill="currentColor" stroke="none"/></svg>`,
    gear: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" ${P}/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" ${P}/></svg>`,
    prev: `<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" ${P}/></svg>`,
    next: `<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" ${P}/></svg>`,
    plus: `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" ${P}/></svg>`,
    wa: `<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z" ${P}/><path d="M8.5 8.8c.2-.6.5-.6.8-.6h.6c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .6.3.5.8 1.2 1.5 1.7.6.4.9.5 1.1.5.2 0 .3-.1.4-.2l.5-.6c.2-.2.4-.2.6-.1l1.5.8c.3.2.4.3.4.5 0 .3-.4 1.2-1.4 1.4-.7.1-1.6.1-3.3-.7-2-.9-3.3-2.9-3.4-3.1-.1-.2-.9-1.2-.9-2.3 0-1 .5-1.5.7-1.5Z" fill="currentColor" stroke="none"/></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M5 13l4 4 10-11" ${P}/></svg>`,
    x: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" ${P}/></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" ${P}/><path d="M12 7.5V12l3 2" ${P}/></svg>`,
    scissors: `<svg viewBox="0 0 24 24"><circle cx="6" cy="7" r="2.6" ${P}/><circle cx="6" cy="17" r="2.6" ${P}/><path d="M8.2 8.6 20 17M8.2 15.4 20 7M12 12l-3.8 2.6M12 12 8.2 9.4" ${P}/></svg>`,
    search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" ${P}/><path d="m20 20-3.6-3.6" ${P}/></svg>`,
    bolt: `<svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" ${P}/></svg>`,
    link: `<svg viewBox="0 0 24 24"><path d="M9 15l6-6M10.5 7.5 12 6a3.5 3.5 0 0 1 5 5l-1.5 1.5M13.5 16.5 12 18a3.5 3.5 0 0 1-5-5l1.5-1.5" ${P}/></svg>`,
    share: `<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.4" ${P}/><circle cx="17" cy="6" r="2.4" ${P}/><circle cx="17" cy="18" r="2.4" ${P}/><path d="m8.2 10.8 6.6-3.6M8.2 13.2l6.6 3.6" ${P}/></svg>`,
    back: `<svg viewBox="0 0 24 24"><path d="M10 5l-7 7 7 7M3 12h18" ${P}/></svg>`,
    trash: `<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" ${P}/></svg>`,
    edit: `<svg viewBox="0 0 24 24"><path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17l-1 3Z" ${P}/></svg>`,
    money: `<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="2.5" ${P}/><circle cx="12" cy="12" r="2.6" ${P}/><path d="M6 9v6M18 9v6" ${P}/></svg>`,
  };
  function ico(name) {
    const s = document.createElement('span'); s.innerHTML = ICO[name] || '';
    const svg = s.firstChild;
    if (svg && svg.classList) svg.classList.add('ic');   // tamaño por defecto (ver .ic en CSS)
    return svg;
  }

  /* logo imán (magnet) con float; opcionalmente con partículas atraídas */
  function imanLogo(conParticulas) {
    const wrap = h('span', { style: { position: 'relative', display: 'inline-flex' } });
    wrap.innerHTML = `<svg class="iman-logo" viewBox="0 0 120 132" aria-hidden="true">
      <path class="iman-cuerpo-borde" d="M34 92 V56 A26 26 0 0 1 86 56 V92"/>
      <path class="iman-cuerpo" d="M34 92 V56 A26 26 0 0 1 86 56 V92"/>
      <rect class="iman-polo" x="13" y="88" width="42" height="20" rx="4"/>
      <rect class="iman-polo" x="65" y="88" width="42" height="20" rx="4"/>
      <path class="iman-chispa" d="M28 114 l-7 9 M60 117 v10 M92 114 l7 9"/></svg>`;
    if (conParticulas) wrap.appendChild(particulasBarber());
    return wrap;
  }

  /* partículas temáticas de barbería (tijeras/peines) atraídas al imán */
  function particulasBarber() {
    const cont = h('span.iman-parts');
    const defs = [
      { c: 'p1', svg: `<path d="M4 6a2 2 0 1 0 0-.01M4 18a2 2 0 1 0 0-.01M6 8l12 8M6 16 18 8" stroke="var(--acento)" stroke-width="1.6" fill="none"/>` },
      { c: 'p2', svg: `<rect x="4" y="6" width="16" height="5" rx="1.5" stroke="var(--tinta)" stroke-width="1.5" fill="var(--amarillo)"/><path d="M6 11v5M9 11v5M12 11v5M15 11v5M18 11v5" stroke="var(--tinta)" stroke-width="1.4"/>` },
      { c: 'p3', svg: `<circle cx="6" cy="7" r="2.4" stroke="var(--acento)" stroke-width="1.6" fill="none"/><circle cx="6" cy="17" r="2.4" stroke="var(--acento)" stroke-width="1.6" fill="none"/><path d="M8 8.5 18 15M8 15.5 18 9" stroke="var(--acento)" stroke-width="1.6"/>` },
    ];
    defs.forEach(d => {
      const p = h(`span.iman-part.${d.c}`);
      p.innerHTML = `<svg viewBox="0 0 24 24">${d.svg}</svg>`;
      cont.appendChild(p);
    });
    return cont;
  }

  /* ---------- Temas: derivación de acento + contraste WCAG ---------------
     Un solo hex de entrada → 4 tokens (--acento/-osc/-suave/-on). La base
     crema/tinta/blanco NUNCA cambia: es la firma del producto. Niveles
     futuros de tema (logo, foto de portada) agregan tokens acá sin tocar
     componentes.                                                          */
  const Tema = (function () {
    const CREMA = '#FFF6E9', TINTA = '#33231A', BLANCO = '#FFFDF8';
    function hex2rgb(hx) {
      hx = hx.replace('#', '');
      if (hx.length === 3) hx = hx.split('').map(c => c + c).join('');
      const n = parseInt(hx, 16);
      return [n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    const rgb2hex = (r, g, b) => '#' + [r, g, b]
      .map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
    function lum(rgb) {
      const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
      return .2126 * f(rgb[0]) + .7152 * f(rgb[1]) + .0722 * f(rgb[2]);
    }
    // ratio de contraste WCAG (1..21)
    function contraste(a, b) {
      const la = lum(hex2rgb(a)), lb = lum(hex2rgb(b));
      const [hi, lo] = la > lb ? [la, lb] : [lb, la];
      return (hi + .05) / (lo + .05);
    }
    function mezclar(a, b, t) {
      const A = hex2rgb(a), B = hex2rgb(b);
      return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
    }
    function derivar(acento) {
      // -osc: oscurecer hasta servir como TEXTO sobre blanco (AA ≥ 4.5)
      let osc = mezclar(acento, '#000000', .28);
      for (let i = 0; i < 14 && contraste(osc, BLANCO) < 4.5; i++) osc = mezclar(osc, '#000000', .08);
      // -suave: lavado del acento sobre crema (fondo de huecos y chips)
      const suave = mezclar(acento, CREMA, .84);
      // -on: texto sobre el acento pleno (blanco si alcanza AA, si no tinta)
      const on = contraste(acento, BLANCO) >= 4.5 ? BLANCO : TINTA;
      return { acento: rgb2hex(...hex2rgb(acento)), osc, suave, on };
    }
    // AA: legible sobre crema como componente (≥3) y con su texto (≥4.5)
    function validar(acento) {
      const tokens = derivar(acento);
      const sobreCrema = contraste(acento, CREMA);
      const textoOn = contraste(acento, tokens.on);
      return { ok: sobreCrema >= 3 && textoOn >= 4.5, sobreCrema, textoOn, tokens };
    }
    // oscurece hacia tinta hasta que pase ambas barras
    function corregir(acento) {
      let c = acento;
      for (let i = 0; i < 24 && !validar(c).ok; i++) c = mezclar(c, TINTA, .07);
      return c;
    }
    function aplicar(tokens, raiz) {
      const s = (raiz || document.documentElement).style;
      s.setProperty('--acento', tokens.acento);
      s.setProperty('--acento-osc', tokens.osc);
      s.setProperty('--acento-suave', tokens.suave);
      s.setProperty('--acento-on', tokens.on);
    }
    // 12 curados: todos pasan AA sobre crema y con su texto-on
    const PALETA = [
      { n: 'Petróleo', c: '#1B7B94' }, { n: 'Rojo barber', c: '#C1272D' },
      { n: 'Terracota', c: '#B4552D' }, { n: 'Naranja quemado', c: '#C63E10' },
      { n: 'Cuero', c: '#8C5A2B' }, { n: 'Oliva', c: '#59761D' },
      { n: 'Bosque', c: '#1F7A48' }, { n: 'Turquesa', c: '#0C7B78' },
      { n: 'Azul', c: '#2F5AA8' }, { n: 'Violeta', c: '#6C3FA8' },
      { n: 'Fucsia', c: '#C13E7C' }, { n: 'Tinta', c: '#33231A' }
    ];
    return { derivar, validar, corregir, aplicar, contraste, mezclar, PALETA };
  })();

  /* ---------- bottom sheet físico / panel lateral -------------------------
     abrirSheet({titulo, sub, cuerpo:Node, pie:Node, onClose}) → cierra()
     En ≥1024px, si la pantalla actual tiene un .panel-slot, el MISMO
     contenido se abre en el panel lateral en vez de tapar la agenda.      */
  let sheetActual = null;
  let panelActual = null;
  function panelVacio() {
    return h('div.panel-hint',
      h('span.emo', '🧲'),
      h('h4', 'Tocá un turno o un hueco'),
      h('p', 'El detalle se abre acá, sin taparte la agenda.'));
  }
  function abrirSheet({ titulo, sub, cuerpo, pie, onClose }) {
    const slot = document.querySelector('.panel-slot');
    if (slot && window.matchMedia('(min-width:1024px)').matches) {
      cerrarSheet(true);
      const head = h('div.sheet-head',
        h('div', { style: { flex: '1' } },
          h('h3', titulo || ''),
          sub ? h('p', sub) : null),
        h('button.icon-btn', { 'aria-label': 'Cerrar', onclick: () => cerrarSheet() }, ico('x'))
      );
      const body = h('div.sheet-body'); if (cuerpo) body.append(cuerpo);
      slot.replaceChildren(head, body);
      if (pie) slot.append(h('div.sheet-foot', pie));
      slot.classList.add('activo');
      panelActual = { slot, onClose };
      return cerrarSheet;
    }
    cerrarSheet(true);
    const bg = h('div.sheet-bg');
    const sheet = h('div.sheet', { role: 'dialog', 'aria-modal': 'true' });
    const head = h('div.sheet-head',
      h('div', { style: { flex: '1' } },
        h('h3', titulo || ''),
        sub ? h('p', sub) : null),
      h('button.icon-btn', { 'aria-label': 'Cerrar', onclick: () => cerrarSheet() }, ico('x'))
    );
    const body = h('div.sheet-body'); if (cuerpo) body.append(cuerpo);
    sheet.append(h('div.handle'), head, body);
    if (pie) sheet.append(h('div.sheet-foot', pie));
    bg.append(sheet);
    document.body.append(bg);
    document.body.style.overflow = 'hidden';

    // arrastre para cerrar
    let y0 = null, dy = 0;
    const handleArea = () => { };
    sheet.addEventListener('touchstart', e => {
      if (body.scrollTop > 0) return;
      y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = 'none';
    }, { passive: true });
    sheet.addEventListener('touchmove', e => {
      if (y0 == null) return;
      dy = e.touches[0].clientY - y0;
      if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    sheet.addEventListener('touchend', () => {
      if (y0 == null) return;
      sheet.style.transition = '';
      if (dy > 110) cerrarSheet(); else sheet.style.transform = '';
      y0 = null;
    });

    bg.addEventListener('click', e => { if (e.target === bg) cerrarSheet(); });
    requestAnimationFrame(() => { bg.classList.add('abierto'); sheet.classList.add('abierto'); });
    sheetActual = { bg, sheet, onClose };
    return cerrarSheet;
  }
  function cerrarSheet(inmediato) {
    if (panelActual) {
      const { slot, onClose } = panelActual;
      panelActual = null;
      if (onClose) onClose();
      if (slot.isConnected) { slot.classList.remove('activo'); slot.replaceChildren(panelVacio()); }
      return;
    }
    if (!sheetActual) return;
    const { bg, sheet, onClose } = sheetActual;
    sheetActual = null;
    document.body.style.overflow = '';
    if (onClose) onClose();
    if (inmediato) { bg.remove(); return; }
    bg.classList.remove('abierto'); sheet.classList.remove('abierto');
    sheet.style.transform = '';
    setTimeout(() => bg.remove(), 380);
  }

  /* ---------- toast ------------------------------------------------------ */
  function toast(msg, tipo) {
    let zona = document.querySelector('.toast-zona');
    if (!zona) { zona = h('div.toast-zona'); document.body.append(zona); }
    const t = h(`div.toast${tipo === 'ok' ? '.ok' : ''}`,
      tipo === 'ok' ? ico('check') : null, h('span', msg));
    zona.append(t);
    setTimeout(() => { t.style.transition = 'opacity .3s,transform .3s'; t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; setTimeout(() => t.remove(), 300); }, 2600);
  }

  global.UI = { h, ico, ICO, iniciales, imanLogo, abrirSheet, cerrarSheet, toast, Tema, panelVacio };
})(window);

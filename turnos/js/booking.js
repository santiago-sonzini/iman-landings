/* ==========================================================================
   Imán Turnos — Página pública de reservas (flujo del cliente)
   servicio → día/hora → nombre+WhatsApp (obligatorio) → email (opcional) → ✓
   Banner de incentivo con countdown · chip de seña (Mercado Pago mock).
   ========================================================================== */
(function () {
  'use strict';
  const { h, ico, iniciales, imanLogo } = UI;
  const T = Turnos;
  const root = document.getElementById('bk');
  const n = T.negocio();

  // tema del comercio (reconcilia por si el boot inline no tenía tokens)
  const tg = T.tema();
  UI.Tema.aplicar(tg.tokens || UI.Tema.derivar(tg.acento));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--acento').trim() || '#1B7B94';

  const S = {
    paso: 'servicio',        // servicio | fecha | datos | ok
    servicioId: null,
    fecha: null, inicio: null, fin: null,
    incentivo: false,        // el slot elegido tiene lavado gratis
    sena: false,
    datos: { nombre: '', tel: '', email: '' },
    cdTimer: null, cdFin: 0
  };

  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  // El barbero puede colgar un incentivo en huecos puntuales. Para el demo,
  // marcamos el ÚLTIMO hueco libre de HOY (la silla vacía de fin de jornada)
  // así el banner siempre se ve, sin depender de la hora en que abran el link.
  function idxIncentivo(dia) { return dia.offset === 0 && dia.slots.length ? dia.slots.length - 1 : -1; }

  /* ---------- header vidriera -------------------------------------------- */
  function hero() {
    const el = h('div.bk-hero',
      h('div.powered', imanLogo(false), 'Imán Turnos'),
      h('div.foto', n.logoEmoji),
      h('h1', n.nombre),
      h('div.meta',
        h('span.estrellas', '⭐⭐⭐⭐⭐'),
        h('span', '·'), h('span', n.zona))
    );
    return el;
  }

  function progreso() {
    const orden = ['servicio', 'fecha', 'datos'];
    const idx = orden.indexOf(S.paso);
    return h('div.bk-prog', ...orden.map((_, i) =>
      h('div.step' + (i < idx ? '.done' : i === idx ? '.now' : ''), h('i'))));
  }

  /* =======================================================================
     PASO 1 — servicio
     ===================================================================== */
  function pasoServicio() {
    const body = h('div.bk-body',
      h('h2.bk-titulo', '¿Qué te hacés hoy?'),
      h('p.bk-sub', 'Elegí un servicio para ver los horarios libres.'));
    T.serviciosActivos().forEach(s => {
      body.append(h('button.svc', { onclick: () => { S.servicioId = s.id; S.paso = 'fecha'; render(); } },
        h('div.em', s.emoji),
        h('div.info',
          h('div.nom', s.nombre),
          h('div.dur', ico('clock'), `${s.dur} min`)),
        h('div.precio', T.fmtPrecio(s.precio))));
    });
    return body;
  }

  /* =======================================================================
     PASO 2 — día y hora
     ===================================================================== */
  function pasoFecha() {
    const disp = T.disponibilidad(S.servicioId, 14);
    const body = h('div.bk-body');
    body.append(h('button.bk-volver', { onclick: () => { S.paso = 'servicio'; render(); } }, ico('back'), 'Cambiar servicio'));
    body.append(h('h2.bk-titulo', '¿Qué día te viene?'));
    const svc = T.servicio(S.servicioId);
    body.append(h('p.bk-sub', `${svc.emoji} ${svc.nombre} · ${svc.dur} min · ${T.fmtPrecio(svc.precio)}`));

    if (!disp.length) { body.append(h('div.vacio', h('span.emo', '📅'), h('h3', 'Sin turnos libres'), h('p', 'Escribinos por WhatsApp y coordinamos.'))); return body; }

    if (!S.fecha || !disp.some(d => d.fecha === S.fecha)) S.fecha = disp[0].fecha;

    // selector de días
    const scroll = h('div.dias-scroll');
    const dow = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    disp.forEach(d => {
      const [y, m, dd] = d.fecha.split('-').map(Number);
      const dt = new Date(y, m - 1, dd);
      const et = T.etiquetaDia(d.fecha);
      const pill = h('div.dia-pastilla' + (d.fecha === S.fecha ? '.sel' : ''), { onclick: () => { S.fecha = d.fecha; render(); } },
        h('div.dow', et || dow[dt.getDay()]),
        h('div.num', dd),
        h('div.mes', meses[m - 1]));
      scroll.append(pill);
    });
    body.append(scroll);

    // grilla de horas del día elegido
    const dia = disp.find(d => d.fecha === S.fecha);
    body.append(h('h3', { style: { fontSize: '1.02rem', margin: '10px 0 10px' } }, 'Horarios'));
    const grid = h('div.horas-grid');
    const incIdx = idxIncentivo(dia);
    dia.slots.forEach((sl, i) => {
      const inc = i === incIdx;
      grid.append(h('button.hora-btn' + (S.inicio === sl.inicio && S.fecha === dia.fecha ? '.sel' : ''), {
        onclick: () => { S.inicio = sl.inicio; S.fin = sl.fin; S.incentivo = inc; S.paso = 'datos'; render(); }
      }, inc ? h('span.fuego', '🔥') : null, sl.inicio));
    });
    body.append(grid);
    if (incIdx >= 0)
      body.append(h('p', { style: { fontWeight: '700', fontSize: '.8rem', color: 'var(--tinta-suave)', marginTop: '12px', display: 'flex', gap: '5px', alignItems: 'center' } }, '🔥 ', 'ese hueco tiene un beneficio especial'));
    return body;
  }

  /* =======================================================================
     PASO 3 — datos + seña
     ===================================================================== */
  function pasoDatos() {
    const svc = T.servicio(S.servicioId);
    const body = h('div.bk-body');
    body.append(h('button.bk-volver', { onclick: () => { pararCountdown(); S.paso = 'fecha'; render(); } }, ico('back'), 'Cambiar horario'));
    body.append(h('h2.bk-titulo', 'Últimos datos'));
    body.append(h('p.bk-sub', 'Te llega la confirmación por WhatsApp al toque.'));

    // banner incentivo con countdown
    if (S.incentivo) {
      const cd = h('span.cd', ico('clock'), h('span', { id: 'cd-num' }, '30:00'));
      body.append(h('div.incentivo',
        h('span.ping'),
        h('div.tit', '🎁 Lavado + peinado ', h('span', { style: { color: 'var(--acento-osc)' } }, 'GRATIS')),
        h('div.txt', 'Reservá este hueco en los próximos 30 minutos y el lavado va de regalo.'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '9px' } }, cd, h('span.cd-lbl', { style: { fontWeight: '800', fontSize: '.72rem', color: 'var(--tinta-suave)' } }, 'para que sea tuyo'))));
      arrancarCountdown();
    }

    // resumen
    const resumen = h('div.resumen',
      h('div.r-fila', h('span.k', 'Servicio'), h('span.v', `${svc.emoji} ${svc.nombre}`)),
      h('div.r-fila', h('span.k', 'Día'), h('span.v', T.fmtFechaLarga(S.fecha))),
      h('div.r-fila', h('span.k', 'Hora'), h('span.v', `${S.inicio} hs`)),
      S.incentivo ? h('div.r-fila', h('span.k', 'Beneficio'), h('span.v', { style: { color: 'var(--verde-ok)' } }, 'Lavado gratis 🎁')) : null,
      h('div.r-fila.r-total', h('span.k', { style: { fontWeight: '800', color: 'var(--tinta)' } }, 'Total'), h('span.v', T.fmtPrecio(svc.precio))));
    body.append(resumen);

    // formulario
    const inNom = h('input', { type: 'text', placeholder: 'Tu nombre', value: S.datos.nombre, autocomplete: 'name' });
    const inTel = h('input', { type: 'tel', placeholder: '11 2345-6789', value: S.datos.tel, autocomplete: 'tel', inputmode: 'tel' });
    const inMail = h('input', { type: 'email', placeholder: 'para el recordatorio', value: S.datos.email, autocomplete: 'email', inputmode: 'email' });
    inNom.oninput = () => S.datos.nombre = inNom.value;
    inTel.oninput = () => S.datos.tel = inTel.value;
    inMail.oninput = () => S.datos.email = inMail.value;
    body.append(
      h('div.campo', h('label', 'Nombre'), inNom),
      h('div.campo', h('label', 'WhatsApp'), inTel, h('div.ayuda', 'Te mandamos la confirmación y el recordatorio acá.')),
      h('div.campo', h('label', 'Email ', h('span.opt', '· opcional')), inMail));

    // chip seña (Mercado Pago mock)
    if (n.senaActiva) {
      const chip = h('div.sena-chip' + (S.sena ? '.on' : ''), { onclick: () => { S.sena = !S.sena; chip.classList.toggle('on', S.sena); ctaTxt(); } },
        h('div.tick', ico('check')),
        h('div.info',
          h('div.nom', `Dejar seña de ${T.fmtPrecio(n.senaMonto)}`),
          h('div.sub', 'Asegurás tu lugar. Se descuenta del total.')),
        h('div.mp', '💳 Mercado Pago'));
      body.append(chip);
    }

    // CTA
    const cta = h('button.btn.btn-acento.block', { onclick: confirmar },
      ico('check'), h('span', { id: 'cta-txt' }, S.sena ? `Pagar seña y reservar` : 'Confirmar turno'));
    function ctaTxt() { const t = document.getElementById('cta-txt'); if (t) t.textContent = S.sena ? 'Pagar seña y reservar' : 'Confirmar turno'; }
    body.append(h('div.bk-cta', cta,
      h('p', { style: { textAlign: 'center', fontSize: '.74rem', color: 'var(--tinta-suave)', fontWeight: '700', marginTop: '9px' } }, 'Sin crear cuenta · cancelás cuando quieras')));

    return body;

    function confirmar() {
      if (!S.datos.nombre.trim() || !S.datos.tel.trim()) {
        UI.toast('Completá nombre y WhatsApp 🙏');
        (!S.datos.nombre.trim() ? inNom : inTel).focus();
        sacudir(!S.datos.nombre.trim() ? inNom : inTel);
        return;
      }
      const turno = T.reservar({
        fecha: S.fecha, inicio: S.inicio, servicioId: S.servicioId,
        nombre: S.datos.nombre.trim(), tel: S.datos.tel.replace(/\D/g, ''),
        email: S.datos.email.trim(), sena: S.sena
      });
      pararCountdown();
      S.turnoOk = turno;
      S.paso = 'ok';
      render();
    }
  }

  function sacudir(el) {
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 });
  }

  /* countdown de 30 min */
  function arrancarCountdown() {
    if (S.cdTimer) return;
    if (!S.cdFin) S.cdFin = Date.now() + 30 * 60 * 1000;
    const tick = () => {
      const el = document.getElementById('cd-num'); if (!el) return;
      let rest = Math.max(0, S.cdFin - Date.now());
      const mm = Math.floor(rest / 60000), ss = Math.floor((rest % 60000) / 1000);
      el.textContent = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
      if (rest <= 0) pararCountdown();
    };
    tick();
    S.cdTimer = setInterval(tick, 1000);
  }
  function pararCountdown() { if (S.cdTimer) { clearInterval(S.cdTimer); S.cdTimer = null; } }

  /* =======================================================================
     PASO 4 — confirmado
     ===================================================================== */
  function pasoOk() {
    const t = S.turnoOk;
    confeti();
    const cont = h('div.bk-ok',
      h('div.marca-ok', ico('check')),
      h('h1', '¡Turno confirmado!'),
      h('p.sub', S.sena ? 'Seña recibida ✓ Te esperamos.' : '¡Te esperamos!'),
      h('div.resumen', { style: { textAlign: 'left' } },
        h('div.r-fila', h('span.k', 'Cliente'), h('span.v', t.nombre)),
        h('div.r-fila', h('span.k', 'Servicio'), h('span.v', `${t.servicio.emoji} ${t.servicio.nombre}`)),
        h('div.r-fila', h('span.k', 'Cuándo'), h('span.v', `${T.fmtFechaCorta(t.fecha)} · ${t.inicio} hs`)),
        h('div.r-fila', h('span.k', 'Dónde'), h('span.v', n.nombre)),
        S.incentivo ? h('div.r-fila', h('span.k', 'Beneficio'), h('span.v', { style: { color: 'var(--verde-ok)' } }, 'Lavado gratis 🎁')) : null),
      h('a.btn.btn-wa.block.mb', { href: waRecordatorio(t), target: '_blank', rel: 'noopener' }, ico('wa'), 'Guardar en WhatsApp'),
      h('button.btn.block', { onclick: reiniciar }, 'Reservar otro turno'),
      h('p', { style: { marginTop: '22px', fontSize: '.72rem', color: 'var(--tinta-suave)', fontWeight: '700', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' } },
        imanLogo(false), 'Reservás con Imán Turnos'));
    root.replaceChildren(cont);
    window.scrollTo(0, 0);
  }
  function waRecordatorio(t) {
    const txt = `Hola! Reservé ${t.servicio.nombre} el ${T.fmtFechaLarga(t.fecha)} a las ${t.inicio} hs en ${n.nombre} ${n.logoEmoji}`;
    return `https://wa.me/${n.telefono}?text=${encodeURIComponent(txt)}`;
  }
  function reiniciar() {
    Object.assign(S, { paso: 'servicio', servicioId: null, fecha: null, inicio: null, fin: null, incentivo: false, sena: false, turnoOk: null, cdFin: 0 });
    render();
  }

  function confeti() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const acento = getComputedStyle(document.documentElement).getPropertyValue('--acento').trim() || '#1B7B94';
    const cols = [acento, '#FFC53D', '#35B36B', '#E23D3D', '#FFFDF8'];
    const c = h('div.confeti');
    for (let i = 0; i < 46; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = cols[i % cols.length];
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      p.style.animationDelay = (Math.random() * .5) + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      c.append(p);
    }
    document.body.append(c);
    setTimeout(() => c.remove(), 3600);
  }

  /* ---------- render maestro --------------------------------------------- */
  function render() {
    if (S.paso === 'ok') { pasoOk(); return; }
    let body;
    if (S.paso === 'fecha') body = pasoFecha();
    else if (S.paso === 'datos') body = pasoDatos();
    else body = pasoServicio();
    root.replaceChildren(hero(), progreso(), body);
    window.scrollTo(0, 0);
  }
  render();
})();

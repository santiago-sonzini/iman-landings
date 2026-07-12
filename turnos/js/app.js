/* ==========================================================================
   Imán Turnos — App del dueño (barbero)
   Router por hash · pantallas: Hoy (timeline) · Clientes · Promos · Ajustes
   · Onboarding. Toda lectura/escritura pasa por `Turnos` (capa de datos).
   ========================================================================== */
(function () {
  'use strict';
  const { h, ico, iniciales, imanLogo, abrirSheet, cerrarSheet, toast, Tema } = UI;
  const T = Turnos;
  const root = document.getElementById('app');

  // tema del comercio (el boot inline ya lo aplicó pre-paint; acá se
  // reconcilia por si no había tokens persistidos)
  const temaGuardado = T.tema();
  Tema.aplicar(temaGuardado.tokens || Tema.derivar(temaGuardado.acento));

  const estado = { offset: 0, vista: 'dia' };  // día visible · 'dia' | 'semana' (escritorio)

  /* ---------- utilidades ------------------------------------------------- */
  const fechaISO = () => T.iso(T.masDias(T.HOY, estado.offset));
  const aMin = (s) => { const [hh, mm] = s.split(':').map(Number); return hh * 60 + mm; };
  const minAhora = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const esEscritorio = () => window.matchMedia('(min-width:1024px)').matches;
  function avatarColor(nombre) {
    const paleta = [['#D9EAF0', '#115161'], ['#FFF1D6', '#9a6b00'], ['#E4E9DA', '#4d6b2f'],
    ['#F3DEDE', '#8f2020'], ['#E7DDF2', '#5a3d8a'], ['#DDEEE8', '#1f6b52']];
    let s = 0; for (const c of nombre) s += c.charCodeAt(0);
    return paleta[s % paleta.length];
  }
  function avatar(nombre, cls) {
    const [bg, fg] = avatarColor(nombre);
    return h(`div.ava${cls ? '.' + cls : ''}`, { style: { background: bg, color: fg } }, iniciales(nombre));
  }

  /* ---------- shell: top bar + tabbar ------------------------------------ */
  function topBar() {
    const n = T.negocio();
    return h('div.top',
      imanLogo(false),
      h('div.marca', h('div', n.nombre, h('small', 'Imán Turnos'))),
      h('div.top-sp'),
      h('button.icon-btn', { 'aria-label': 'Compartir link', onclick: compartirLink }, ico('share'))
    );
  }
  function tabbar(activa) {
    const item = (ruta, icon, txt, onclick) => h(`a${activa === ruta ? '.activo' : ''}`,
      { href: '#/' + ruta, onclick }, ico(icon), h('span', txt), h('span.pt'));
    // tocar "Hoy" siempre vuelve al día de hoy (aunque estés viendo otro día)
    const irHoy = (e) => { estado.offset = 0; if (location.hash === '#/hoy' || location.hash === '') { e.preventDefault(); renderHoy(); } };
    return h('div.tabbar',
      item('hoy', 'cal', 'Hoy', irHoy),
      item('clientes', 'users', 'Clientes'),
      item('promos', 'tag', 'Promos'),
      item('ajustes', 'gear', 'Ajustes'));
  }

  function compartirLink() {
    const url = 'iman.ar/' + T.negocio().handle;
    if (navigator.clipboard) navigator.clipboard.writeText('https://' + url).catch(() => { });
    toast('Link copiado: ' + url, 'ok');
  }

  /* =======================================================================
     PANTALLA 1 — HOY (timeline) · la estrella
     El timeline del día es el hogar; semana y mes son navegación y vista
     general: toda acción (llenar hueco, agendar) resuelve SIEMPRE acá.
     ===================================================================== */
  function renderHoy() {
    const iso = fechaISO();
    const off = estado.offset;
    const cerrado = T.diaCerrado(iso);
    const items = cerrado ? [] : T.grillaDelDia(iso);
    const oc = cerrado ? { turnos: 0, huecos: 0, total: 0 } : T.ocupacionDelDia(iso);
    const pct = oc.total ? Math.round(oc.turnos / oc.total * 100) : 0;
    const etiqueta = T.etiquetaDia(iso);
    const esPasado = off < 0, esHoy = off === 0;
    const ahora = minAhora();
    const vistaSemana = estado.vista === 'semana' && esEscritorio();

    // el ÚNICO hueco con CTA fuerte: el próximo del día
    const esPerdido = (hu) => esPasado || (esHoy && aMin(hu.fin) <= ahora);
    let idxDestacado = -1;
    if (!esPasado) idxDestacado = items.findIndex(i => i.tipo === 'hueco' && !esPerdido(i));
    const hayHuecoAccionable = idxDestacado >= 0;

    const pantalla = h('div.pantalla');

    // navegación de fecha (la etiqueta abre el mes; ‹ › mueven de a un día)
    pantalla.append(h('div.fecha-nav',
      h('button.nav-btn', { 'aria-label': 'Día anterior', onclick: () => { estado.offset--; go(); } }, ico('prev')),
      h('button.fecha-lbl', { 'aria-label': 'Elegir fecha en el calendario', onclick: sheetMes },
        h('div.dia', cap(T.fmtFechaLarga(iso)), h('span.caret', '▾')),
        etiqueta ? h('span.hoy-chip', etiqueta) : null),
      h('button.nav-btn', { 'aria-label': 'Día siguiente', onclick: () => { estado.offset++; go(); } }, ico('next')),
      h('div.seg',
        h('button' + (vistaSemana ? '' : '.on'), { onclick: () => { estado.vista = 'dia'; go(); } }, 'Día'),
        h('button' + (vistaSemana ? '.on' : ''), { onclick: () => { estado.vista = 'semana'; go(); } }, 'Semana')),
      h('button.icon-btn.btn-nuevo-dt', { 'aria-label': 'Nuevo turno', onclick: () => sheetAgendar(iso) }, ico('plus'))
    ));

    if (vistaSemana) {
      pantalla.append(semanaGrid());
    } else {
      // tira de la semana con densidad por día
      pantalla.append(semanaStrip());

      if (cerrado) {
        pantalla.append(h('div.vacio', { style: { marginTop: '14px' } },
          h('span.emo', '😴'),
          h('h3', 'Cerrado'),
          h('p', 'Este día no atendés. Lo cambiás cuando quieras desde Ajustes.'),
          h('button.btn.sm', { onclick: () => sheetAgendar(iso) }, ico('plus'), 'Cargar un turno igual')));
      } else {
        pantalla.append(h('div.ocupa',
          h('div.lbl', h('b', `${oc.turnos}/${oc.total}`), ' turnos'),
          h('div.barra', h('i', { style: { width: pct + '%' } })),
          h('div.huecos-tag', oc.huecos > 0 ? `${oc.huecos} hueco${oc.huecos > 1 ? 's' : ''} libre${oc.huecos > 1 ? 's' : ''}` : '¡día lleno! 🔥')
        ));

        if (!items.length) {
          pantalla.append(estadoVacioDia());
        } else {
          const tl = h('div.tl');
          items.forEach((it, i) => tl.append(
            it.tipo === 'turno' ? filaTurno(it) : filaHueco(it, i === idxDestacado, esPerdido(it))));
          pantalla.append(tl);
        }
      }
    }

    // FAB solo si el día no tiene huecos accionables (cada hueco ya trae su +)
    const conFab = !vistaSemana && !esPasado && !cerrado && !hayHuecoAccionable;
    if (conFab) pantalla.classList.add('con-fab');
    const fab = conFab
      ? h('button.fab', { 'aria-label': 'Nuevo turno', onclick: () => sheetAgendar(iso) }, ico('plus'))
      : null;

    // panel lateral (escritorio): los sheets del día se abren acá
    const panel = h('div.panel', h('div.panel-slot', UI.panelVacio()));

    root.classList.add('con-panel');
    root.replaceChildren(topBar(), pantalla, panel, fab, tabbar('hoy'));
  }

  /* tira semanal: 7 pastillas con puntos de densidad */
  function semanaStrip() {
    const dow = T.diaSemana(T.masDias(T.HOY, estado.offset));
    const lunes = estado.offset - ((dow + 6) % 7);
    const res = T.resumenRango(lunes, 7);
    const DW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const wrap = h('div.semana-strip');
    res.forEach((r, i) => {
      const dots = h('div.dots');
      const nivel = r.cerrado || !r.total ? 0 : Math.min(3, Math.ceil(r.turnos / r.total * 3));
      for (let k = 0; k < 3; k++) dots.append(h(`i${k < nivel ? '.on' : ''}`));
      wrap.append(h('button.dia-mini'
        + (r.offset === estado.offset ? '.sel' : '')
        + (r.offset === 0 ? '.hoy' : '')
        + (r.cerrado ? '.cerrado' : ''),
        { onclick: () => { estado.offset = r.offset; go(); }, 'aria-label': `${DW[i]} ${+r.fecha.slice(8)}` },
        h('div.dw', DW[i]),
        h('div.dn', String(+r.fecha.slice(8))),
        dots));
    });
    return wrap;
  }

  /* grilla semanal de escritorio: vista general, todo resuelve al día */
  function semanaGrid() {
    const n = T.negocio();
    const dow = T.diaSemana(T.masDias(T.HOY, estado.offset));
    const lunes = estado.offset - ((dow + 6) % 7);
    const res = T.resumenRango(lunes, 7);
    const abre = aMin(n.abre), cierra = aMin(n.cierra), span = cierra - abre;
    const DW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const irADia = (offDia) => { estado.offset = offDia; estado.vista = 'dia'; go(); };

    const grid = h('div.sgrid');
    grid.append(h('div'));
    res.forEach((r, i) => grid.append(
      h('button.sg-cab' + (r.offset === 0 ? '.hoy' : ''), { onclick: () => irADia(r.offset) },
        DW[i], h('b', String(+r.fecha.slice(8))))));

    const gut = h('div.sg-gut');
    for (let hh = Math.ceil(abre / 60); hh * 60 <= cierra; hh++)
      gut.append(h('i', { style: { top: ((hh * 60 - abre) / span * 100) + '%' } }, String(hh)));
    grid.append(gut);

    res.forEach(r => {
      if (r.cerrado) { grid.append(h('div.sg-col.cerrado', 'cerrado')); return; }
      const col = h('div.sg-col' + (r.offset === 0 ? '.hoy' : ''),
        { onclick: () => irADia(r.offset), title: 'Abrir el día' });
      T.grillaDelDia(r.fecha).forEach(it => {
        const top = (aMin(it.inicio) - abre) / span * 100;
        const alto = (it.tipo === 'turno' ? it.dur : it.largo) / span * 100;
        const pos = { top: top + '%', height: 'calc(' + alto + '% - 3px)' };
        if (it.tipo === 'turno')
          col.append(h('div.sg-ev' + (r.offset < 0 ? '.pasado' : ''), { style: pos },
            `${it.inicio} ${it.nombre.split(' ')[0]}`));
        else if (r.offset >= 0)
          col.append(h('div.sg-hu', { style: pos }, it.largo + '′'));
      });
      grid.append(col);
    });
    return grid;
  }

  /* mes compacto para saltar de fecha (se abre desde la etiqueta de fecha) */
  function sheetMes() {
    let base = new Date(T.masDias(T.HOY, estado.offset));
    base.setDate(1);
    const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const cont = h('div');
    const pintar = () => {
      const y = base.getFullYear(), m = base.getMonth();
      const primero = new Date(y, m, 1);
      const nDias = new Date(y, m + 1, 0).getDate();
      const offInicio = Math.round((primero - T.HOY) / 86400000);
      const res = T.resumenRango(offInicio, nDias);
      const grid = h('div.mes-grid');
      ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach(d => grid.append(h('div.mes-cab', d)));
      for (let k = 0; k < (primero.getDay() + 6) % 7; k++) grid.append(h('div'));
      res.forEach(r => {
        const pts = h('div.pts');
        const nivel = r.cerrado || !r.total ? 0 : Math.min(3, Math.ceil(r.turnos / r.total * 3));
        for (let q = 0; q < nivel; q++) pts.append(h('i'));
        grid.append(h('button.mes-dia'
          + (r.offset === 0 ? '.hoy' : '')
          + (r.offset === estado.offset ? '.sel' : '')
          + (r.cerrado ? '.cerrado' : ''),
          { onclick: () => { estado.offset = r.offset; cerrarSheet(); go(); } },
          h('div.d', String(+r.fecha.slice(8))), pts));
      });
      cont.replaceChildren(
        h('div.mes-nav',
          h('button.icon-btn', { 'aria-label': 'Mes anterior', onclick: () => { base = new Date(y, m - 1, 1); pintar(); } }, ico('prev')),
          h('div.mes-tit', `${MESES[m]} ${y}`),
          h('button.icon-btn', { 'aria-label': 'Mes siguiente', onclick: () => { base = new Date(y, m + 1, 1); pintar(); } }, ico('next'))),
        grid,
        h('p.mes-leyenda', 'Los puntos muestran qué tan cargado está cada día.'));
    };
    pintar();
    abrirSheet({ titulo: 'Ir a una fecha', cuerpo: cont });
  }

  function railHora(hhmm) {
    const [hh, mm] = hhmm.split(':');
    return h('div.tl-rail', h('div.h', hh + ':' + mm.slice(0, 2)));
  }

  function filaTurno(t) {
    const clsEstado = t.estado === 'asistio' ? ' asistio' : t.estado === 'novino' ? ' novino' : '';
    const card = h('div.turno' + clsEstado, { onclick: () => sheetTurno(t) },
      avatar(t.nombre),
      h('div.info',
        h('div.nom', t.nombre),
        h('div.det',
          h('span', t.servicio ? `${t.servicio.emoji} ${t.servicio.nombre}` : 'Servicio'),
          h('span.pto'),
          h('span', `${t.dur} min`),
          t.canal === 'manual' ? h('span', { title: 'Cargado a mano' }, ' · a mano') : null
        )
      ),
      h('div.lado',
        t.estado === 'asistio' ? h('span.estado-pill.ok', 'vino')
          : t.estado === 'novino' ? h('span.estado-pill.no', 'no vino')
            : h('div.dur', T.fmtPrecio(t.precio)))
    );
    return h('div.tl-item', railHora(t.inicio), h('div.tl-body', card));
  }

  // Un solo hueco por día lleva el CTA fuerte (el próximo); el resto es
  // compacto: toda la tarjeta abre "llenar hueco". Los ya pasados quedan
  // como constancia, sin acción.
  function filaHueco(hu, destacado, perdido) {
    const rango = h('div.h-rango', h('span.z', '🧲'), `${hu.inicio} – ${hu.fin}`);
    const sub = h('div.h-sub', perdido
      ? 'quedó vacío'
      : `hueco libre${hu.prime ? ' · prime' : ''} · ${hu.largo} min`);
    let card;
    if (perdido) {
      card = h('div.hueco.perdido', h('div.h-fila', h('div.h-info', rango, sub)));
    } else if (destacado) {
      card = h('div.hueco.destacado' + (hu.prime ? '.prime' : ''),
        { onclick: () => sheetLlenarHueco(hu) },
        h('div.prox', ico('bolt'), hu.prime ? 'Próximo hueco · el más caro de perder' : 'Próximo hueco'),
        h('div.h-fila', h('div.h-info', rango, sub)),
        h('div.h-acciones',
          h('button.btn.btn-acento.sm.btn-llenar',
            { onclick: (e) => { e.stopPropagation(); sheetLlenarHueco(hu); } },
            ico('bolt'), 'Llenar este hueco'),
          h('button.h-mas',
            { 'aria-label': 'Cargar turno a mano', onclick: (e) => { e.stopPropagation(); sheetAgendar(hu.fecha, hu.inicio); } },
            ico('plus'))));
    } else {
      card = h('div.hueco' + (hu.prime ? '.prime' : ''),
        { onclick: () => sheetLlenarHueco(hu), role: 'button', tabindex: '0' },
        h('div.h-fila',
          h('div.h-info', rango, sub),
          h('span.h-ir', { 'aria-hidden': 'true' }, ico('bolt'))));
    }
    return h('div.tl-item', railHora(hu.inicio), h('div.tl-body', card));
  }

  function estadoVacioDia() {
    return h('div.vacio',
      h('span.emo', '💈'),
      h('h3', 'Día libre, día de oportunidad'),
      h('p', 'No tenés turnos cargados. Compartí tu link o llená la agenda a mano.'),
      h('button.btn.btn-acento', { onclick: compartirLink }, ico('share'), 'Compartir mi link'));
  }

  /* ---------- sheet: detalle de turno ------------------------------------ */
  function sheetTurno(t) {
    const acc = (estadoNuevo) => () => {
      T.marcarAsistencia(t.id, estadoNuevo);
      cerrarSheet();
      toast(estadoNuevo === 'asistio' ? '✓ Marcado: asistió' : estadoNuevo === 'novino' ? 'Marcado: no vino' : 'Turno reabierto', 'ok');
      go();
    };
    const cuerpo = h('div',
      h('div.turno', { style: { cursor: 'default', marginBottom: '14px' } },
        avatar(t.nombre),
        h('div.info', h('div.nom', t.nombre),
          h('div.det', h('span', t.servicio ? t.servicio.nombre : ''), h('span.pto'), h('span', `${t.inicio}–${t.fin}`))),
        h('div.lado', h('div.dur', T.fmtPrecio(t.precio)))),
      h('div', { style: { display: 'flex', gap: '9px', marginBottom: '10px' } },
        h('button.btn.btn-acento.block', { onclick: acc('asistio') }, ico('check'), 'Asistió'),
        h('button.btn.block', { onclick: acc('novino') }, ico('x'), 'No vino')),
      t.tel ? h('a.btn.btn-wa.block.mb', { href: T.waConfirmacion(t), target: '_blank', rel: 'noopener' }, ico('wa'), 'Escribirle por WhatsApp') : null,
      h('button.btn.btn-danger.block', { onclick: () => { T.cancelarTurno(t.id); cerrarSheet(); toast('Turno cancelado'); go(); } }, ico('trash'), 'Cancelar turno')
    );
    abrirSheet({ titulo: t.nombre, sub: `${T.fmtFechaLarga(t.fecha)} · ${t.inicio} hs`, cuerpo });
  }

  /* ---------- sheet: llenar hueco (clientes que tocan) ------------------- */
  function sheetLlenarHueco(hu) {
    const candidatos = T.clientesQueTocan();
    const lista = h('div');
    candidatos.forEach(c => {
      const nombre = c.nombre;
      const fila = h('div.cli-fila',
        avatar(nombre),
        h('div.info',
          h('div.nom', nombre),
          h('div.por',
            c.servicio ? `${c.servicio.nombre.toLowerCase()} cada ${c.ciclo} días · ` : '',
            c.recu === 'vencida' ? h('b', `van ${c.ultimaHace} 🔴`) : `van ${c.ultimaHace} días`)),
        h('div', { style: { display: 'flex', gap: '7px', flex: 'none' } },
          h('button.btn.sm', { title: 'Agendar en este hueco', onclick: () => agendarDesdeHueco(hu, c) }, ico('plus')),
          h('a.btn.btn-wa.sm', { href: c.wa, target: '_blank', rel: 'noopener', 'aria-label': 'WhatsApp' }, ico('wa')))
      );
      lista.append(fila);
    });
    const cuerpo = h('div',
      h('p', { style: { fontWeight: '700', fontSize: '.9rem', color: 'var(--tinta-suave)', margin: '0 0 14px' } },
        'Clientes a los que ya les toca volver. Un toque y ', h('b', { style: { color: 'var(--acento-osc)' } }, 'les mandás el WhatsApp'), ' o los agendás en el hueco.'),
      candidatos.length ? lista : h('div.vacio', h('span.emo', '🎉'), h('h3', 'Todos al día'), h('p', 'No hay clientes vencidos ahora mismo.')));
    const pie = h('button.btn.block', { onclick: () => sheetAgendar(hu.fecha, hu.inicio) },
      ico('plus'), 'Cargar un turno a mano');
    abrirSheet({ titulo: `Llenar ${hu.inicio}–${hu.fin}`, sub: hu.prime ? 'Hueco prime · máxima prioridad' : `${hu.largo} minutos libres`, cuerpo, pie });
  }

  function agendarDesdeHueco(hu, c) {
    T.agendarManual({ fecha: hu.fecha, inicio: hu.inicio, servicioId: c.servicioHab, clienteId: c.id });
    cerrarSheet();
    toast(`✓ ${c.nombre.split(' ')[0]} agendado a las ${hu.inicio}`, 'ok');
    go();
  }

  /* ---------- sheet: agendar manual -------------------------------------- */
  function sheetAgendar(iso, horaPre) {
    const servicios = T.serviciosActivos();
    let servicioId = servicios[0].id;
    let clienteId = '';
    const inputHora = h('input', { type: 'time', value: horaPre || '10:00' });
    const inputNombre = h('input', { type: 'text', placeholder: 'Nombre del cliente' });
    const inputTel = h('input', { type: 'tel', placeholder: 'WhatsApp (opcional)' });

    const chipsServicio = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } });
    servicios.forEach(s => {
      const chip = h('button.chip' + (s.id === servicioId ? '.on' : ''), { onclick: () => { servicioId = s.id; [...chipsServicio.children].forEach((c, i) => c.classList.toggle('on', servicios[i].id === servicioId)); } },
        `${s.emoji} ${s.nombre}`);
      chipsServicio.append(chip);
    });

    // sugerencias de clientes existentes
    const datalist = h('datalist', { id: 'dl-cli' });
    T.clientes().forEach(c => datalist.append(h('option', { value: c.nombre })));
    inputNombre.setAttribute('list', 'dl-cli');

    const cuerpo = h('div',
      h('div.campo', h('label', 'Servicio'), chipsServicio),
      h('div.fila-2',
        h('div.campo', h('label', 'Hora'), inputHora),
        h('div.campo', h('label', 'Cliente'), inputNombre, datalist)),
      h('div.campo', h('label', 'WhatsApp ', h('span.opt', '· opcional')), inputTel)
    );
    const pie = h('button.btn.btn-acento.block', {
      onclick: () => {
        const nombre = inputNombre.value.trim() || 'Turno manual';
        const existente = T.clientes().find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
        T.agendarManual({ fecha: iso, inicio: inputHora.value, servicioId, nombre, tel: inputTel.value.trim(), clienteId: existente ? existente.id : null });
        cerrarSheet();
        toast(`✓ Turno agendado ${inputHora.value}`, 'ok');
        go();
      }
    }, ico('check'), 'Agendar turno');
    abrirSheet({ titulo: 'Nuevo turno', sub: T.fmtFechaLarga(iso), cuerpo, pie });
  }

  /* =======================================================================
     PANTALLA 2 — CLIENTES
     ===================================================================== */
  function renderClientes(filtro) {
    const pantalla = h('div.pantalla');
    pantalla.append(h('div.seccion-tit', { style: { marginTop: '14px' } }, h('h2', 'Clientes')));

    const input = h('input', { type: 'search', placeholder: 'Buscar por nombre…', value: filtro || '' });
    const lista = h('div');
    const pintar = (q) => {
      const cs = T.clientes().filter(c => c.nombre.toLowerCase().includes((q || '').toLowerCase()))
        .sort((a, b) => ({ vencida: 0, letoca: 1, aldia: 2 }[a.recu] - { vencida: 0, letoca: 1, aldia: 2 }[b.recu]));
      lista.replaceChildren(...cs.map(filaCliente));
      if (!cs.length) lista.append(h('div.vacio', h('span.emo', '🔍'), h('h3', 'Sin resultados'), h('p', 'Probá con otro nombre.')));
    };
    input.addEventListener('input', () => pintar(input.value));

    pantalla.append(h('div.buscador', ico('search'), input));
    pantalla.append(lista);
    pintar(filtro);
    root.replaceChildren(topBar(), pantalla, tabbar('clientes'));
  }

  const semTxt = { aldia: 'al día', letoca: 'le toca', vencida: 'vencida' };
  function filaCliente(c) {
    return h('div.cli-card', { onclick: () => location.hash = '#/cliente/' + c.id },
      avatar(c.nombre),
      h('div.info',
        h('div.nom', c.nombre),
        h('div.sub', c.servicio ? c.servicio.nombre : '', ` · ${c.visitas} visitas`)),
      h(`span.sem.${c.recu}`, h('span.pto'), semTxt[c.recu]));
  }

  function renderClienteDetalle(id) {
    const c = T.cliente(id);
    if (!c) { location.hash = '#/clientes'; return; }
    const hist = T.historialCliente(id);
    const pantalla = h('div.pantalla');
    pantalla.append(h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 18px' } },
      h('button.icon-btn', { 'aria-label': 'Volver', onclick: () => location.hash = '#/clientes' }, ico('back'))
    ));

    pantalla.append(h('div.tarjeta', { style: { display: 'flex', gap: '14px', alignItems: 'center' } },
      avatar(c.nombre),
      h('div', { style: { flex: '1' } },
        h('h2', { style: { fontSize: '1.3rem' } }, c.nombre),
        h('div', { style: { marginTop: '5px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
          h(`span.sem.${c.recu}`, h('span.pto'), semTxt[c.recu]),
          h('span.txt-suave', { style: { fontWeight: '700', fontSize: '.82rem' } }, `${c.visitas} visitas`)))
    ));

    pantalla.append(h('div', { style: { display: 'flex', gap: '9px', margin: '4px 0 18px' } },
      h('a.btn.btn-wa.block', { href: T.waLlenarHueco(c), target: '_blank', rel: 'noopener' }, ico('wa'), 'WhatsApp'),
      h('button.btn.btn-acento.block', { onclick: () => sheetAgendar(fechaISO()) }, ico('plus'), 'Agendar')
    ));

    pantalla.append(h('div.seccion-tit', h('h2', { style: { fontSize: '1.1rem' } }, 'Historial')));
    if (!hist.length) pantalla.append(h('div.vacio', h('span.emo', '📖'), h('h3', 'Sin turnos aún')));
    else {
      const wrap = h('div');
      hist.forEach(t => wrap.append(h('div.cli-card', { style: { cursor: 'default' } },
        h('div.ava', { style: { background: 'var(--acento-suave)', color: 'var(--acento-osc)' } }, t.servicio ? t.servicio.emoji : '✂️'),
        h('div.info', h('div.nom', { style: { fontSize: '.98rem' } }, t.servicio ? t.servicio.nombre : 'Turno'),
          h('div.sub', T.fmtFechaCorta(t.fecha) + ' · ' + t.inicio + ' hs')),
        h('div.lado',
          t.estado === 'asistio' ? h('span.estado-pill.ok', 'vino')
            : t.estado === 'novino' ? h('span.estado-pill.no', 'no vino')
              : h('span.txt-suave', { style: { fontWeight: '800', fontSize: '.8rem' } }, T.fmtPrecio(t.precio))))));
      pantalla.append(wrap);
    }
    root.replaceChildren(topBar(), pantalla, tabbar('clientes'));
  }

  /* =======================================================================
     PANTALLA 3 — PROMOS (creación en 3 toques)
     ===================================================================== */
  function renderPromos() {
    const pantalla = h('div.pantalla');
    pantalla.append(h('div.seccion-tit', { style: { marginTop: '14px' } }, h('h2', 'Promos')));
    pantalla.append(h('button.btn.btn-acento.block.mb', { onclick: sheetPromo }, ico('plus'), 'Crear promo en 3 toques'));

    // promos de ejemplo
    const ejemplos = [
      { t: '🎁 Lavado gratis', d: 'Con corte + barba · huecos de tarde', link: 'iman.ar/elroble/p/lavado', activa: true },
      { t: '2×1 en corte de niños', d: 'Sábados de mañana', link: 'iman.ar/elroble/p/ninos', activa: false }
    ];
    ejemplos.forEach(p => pantalla.append(h('div.tarjeta', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
      h('div.ava', { style: { width: '44px', height: '44px', borderRadius: '13px', border: '2.5px solid var(--tinta)', display: 'grid', placeItems: 'center', background: 'var(--amarillo)', fontSize: '1.3rem', flex: 'none' } }, '🎉'),
      h('div', { style: { flex: '1', minWidth: '0' } },
        h('div', { style: { fontFamily: 'var(--display)', fontWeight: '600', fontSize: '1.04rem' } }, p.t),
        h('div.txt-suave', { style: { fontWeight: '700', fontSize: '.8rem' } }, p.d),
        h('div', { style: { fontWeight: '800', fontSize: '.76rem', color: 'var(--acento-osc)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' } }, ico('link'), p.link)),
      h('span.chip' + (p.activa ? '.on' : ''), p.activa ? 'activa' : 'pausada')
    )));

    root.replaceChildren(topBar(), pantalla, tabbar('promos'));
  }

  function sheetPromo() {
    let paso = 1, oferta = null, cuando = null;
    const cont = h('div');
    const render = () => {
      if (paso === 1) {
        cont.replaceChildren(
          h('p.txt-suave', { style: { fontWeight: '700', margin: '0 0 14px' } }, 'Paso 1 de 3 · ¿Qué ofrecés?'),
          opcionesGrid([
            { k: 'lavado', t: '🎁 Un extra gratis', s: 'Lavado, perfilado…' },
            { k: 'off', t: '💸 % de descuento', s: '10 / 15 / 20% off' },
            { k: 'combo', t: '✂️ Combo con precio', s: 'Corte + barba fijo' }
          ], k => { oferta = k; paso = 2; render(); }));
      } else if (paso === 2) {
        cont.replaceChildren(
          h('p.txt-suave', { style: { fontWeight: '700', margin: '0 0 14px' } }, 'Paso 2 de 3 · ¿Cuándo vale?'),
          opcionesGrid([
            { k: 'hueco', t: '🕳️ Solo en huecos', s: 'Los espacios vacíos de hoy' },
            { k: 'franja', t: '🌅 Una franja', s: 'Ej: martes de mañana' },
            { k: 'vencidos', t: '🔴 Clientes vencidos', s: 'A los que ya les toca' }
          ], k => { cuando = k; paso = 3; render(); }));
      } else {
        cont.replaceChildren(
          h('div.vacio', { style: { border: '2.5px dashed var(--acento)', background: 'var(--acento-suave)' } },
            h('span.emo', '🔗'),
            h('h3', '¡Promo lista!'),
            h('p', 'Tu link para compartir por WhatsApp e Instagram:'),
            h('div', { style: { fontFamily: 'var(--display)', fontWeight: '600', fontSize: '1.05rem', color: 'var(--acento-osc)', marginBottom: '14px' } }, 'iman.ar/elroble/p/nueva'),
            h('button.btn.btn-acento', { onclick: () => { compartirPromo(); } }, ico('share'), 'Copiar y compartir')));
      }
    };
    render();
    abrirSheet({ titulo: 'Nueva promo', sub: 'Rápido, sin vueltas', cuerpo: cont });
  }
  function opcionesGrid(ops, onPick) {
    const g = h('div', { style: { display: 'grid', gap: '10px' } });
    ops.forEach(o => g.append(h('button.tarjeta', { style: { textAlign: 'left', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', marginBottom: '0', width: '100%' }, onclick: () => onPick(o.k) },
      h('div', { style: { flex: '1' } },
        h('div', { style: { fontFamily: 'var(--display)', fontWeight: '600', fontSize: '1.06rem' } }, o.t),
        h('div.txt-suave', { style: { fontWeight: '700', fontSize: '.82rem' } }, o.s)),
      ico('next'))));
    return g;
  }
  function compartirPromo() {
    if (navigator.clipboard) navigator.clipboard.writeText('https://iman.ar/elroble/p/nueva').catch(() => { });
    cerrarSheet(); toast('Link de promo copiado 🎉', 'ok');
  }

  /* =======================================================================
     PANTALLA 4 — AJUSTES (servicios + horarios)
     ===================================================================== */
  function renderAjustes() {
    const n = T.negocio();
    const pantalla = h('div.pantalla');
    pantalla.append(h('div.seccion-tit', { style: { marginTop: '14px' } }, h('h2', 'Ajustes')));

    // link público
    pantalla.append(h('div.tarjeta', { style: { background: 'var(--acento-suave)', borderColor: 'var(--tinta)' } },
      h('div', { style: { fontWeight: '800', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--acento-osc)', marginBottom: '4px' } }, 'Tu link de reservas'),
      h('div', { style: { fontFamily: 'var(--display)', fontWeight: '600', fontSize: '1.16rem', marginBottom: '12px' } }, 'iman.ar/' + n.handle),
      h('div', { style: { display: 'flex', gap: '9px' } },
        h('a.btn.btn-acento.block.sm', { href: 'reservar.html', target: '_blank', rel: 'noopener' }, ico('link'), 'Ver página'),
        h('button.btn.block.sm', { onclick: compartirLink }, ico('share'), 'Compartir'))));

    // color de marca (tema del comercio)
    pantalla.append(h('div.seccion-tit', h('h2', { style: { fontSize: '1.14rem' } }, 'Tu color')));
    const nombreColor = (Tema.PALETA.find(p => p.c.toUpperCase() === T.tema().acento.toUpperCase()) || { n: 'Personalizado' }).n;
    pantalla.append(h('div.tarjeta', { style: { display: 'flex', alignItems: 'center', gap: '13px' } },
      h('div.tema-actual', { style: { background: 'var(--acento)' } }),
      h('div', { style: { flex: '1', minWidth: '0' } },
        h('div', { style: { fontWeight: '800' } }, nombreColor),
        h('div.txt-suave', { style: { fontSize: '.8rem', fontWeight: '700' } }, 'Pinta tu app y tu página de reservas.')),
      h('button.btn.sm', { onclick: sheetTema }, 'Cambiar')));

    // servicios
    pantalla.append(h('div.seccion-tit', h('h2', { style: { fontSize: '1.14rem' } }, 'Servicios'),
      h('button.btn.btn-fantasma.sm', { style: { boxShadow: 'none' }, onclick: () => sheetServicio() }, ico('plus'), 'Agregar')));
    const lista = h('div');
    const pintarServicios = () => {
      lista.replaceChildren(...T.servicios().map(s => h('div.cli-card', { style: { cursor: 'default', opacity: s.activo ? '1' : '.5' } },
        h('div.ava', { style: { background: 'var(--acento-suave)', color: 'var(--acento-osc)' } }, s.emoji),
        h('div.info', h('div.nom', { style: { fontSize: '1rem' } }, s.nombre),
          h('div.sub', `${s.dur} min · ${T.fmtPrecio(s.precio)}`)),
        h('button.icon-btn', { style: { width: '38px', height: '38px' }, 'aria-label': 'Editar', onclick: () => sheetServicio(s, pintarServicios) }, ico('edit')))));
    };
    pintarServicios();
    pantalla.append(lista);

    // horarios
    pantalla.append(h('div.seccion-tit', h('h2', { style: { fontSize: '1.14rem' } }, 'Horarios')));
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    pantalla.append(h('div.tarjeta',
      h('div', { style: { display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' } },
        ...dias.map((d, i) => h('span.chip' + (n.dias.includes(i) ? '.on' : ''), { style: { minWidth: '44px', justifyContent: 'center' } }, d))),
      h('div.fila-2',
        h('div.campo', { style: { marginBottom: '0' } }, h('label', 'Abre'), h('input', { type: 'time', value: n.abre })),
        h('div.campo', { style: { marginBottom: '0' } }, h('label', 'Cierra'), h('input', { type: 'time', value: n.cierra }))),
      h('div.campo', { style: { marginTop: '12px', marginBottom: '0' } }, h('label', 'Buffer entre turnos'),
        h('div', { style: { display: 'flex', gap: '6px' } }, ...[0, 5, 10, 15].map(b => h('span.chip' + (n.buffer === b ? '.on' : ''), b + '′'))))
    ));

    // reservado para multi-staff
    pantalla.append(h('div.tarjeta', { style: { borderStyle: 'dashed', background: 'transparent', textAlign: 'center', color: 'var(--tinta-suave)' } },
      h('div', { style: { fontWeight: '800' } }, '👥 Más de un profesional'),
      h('div', { style: { fontSize: '.82rem', fontWeight: '700', marginTop: '3px' } }, 'Próximamente: sumá tu equipo y cada uno con su agenda.')));

    pantalla.append(h('button.btn.btn-fantasma.block.mt', { style: { color: 'var(--acento-osc)', boxShadow: 'none' }, onclick: () => location.hash = '#/onboarding' }, 'Ver el onboarding otra vez'));

    root.replaceChildren(topBar(), pantalla, tabbar('ajustes'));
  }

  function sheetServicio(s, onSave) {
    const nom = h('input', { type: 'text', value: s ? s.nombre : '', placeholder: 'Ej: Corte' });
    const dur = h('input', { type: 'number', value: s ? s.dur : 40, min: '5', step: '5' });
    const pre = h('input', { type: 'number', value: s ? s.precio : 8000, min: '0', step: '500' });
    const cuerpo = h('div',
      h('div.campo', h('label', 'Nombre'), nom),
      h('div.fila-2',
        h('div.campo', h('label', 'Duración (min)'), dur),
        h('div.campo', h('label', 'Precio $'), pre)));
    const pie = h('div', { style: { display: 'flex', gap: '9px', width: '100%' } },
      s ? h('button.btn.btn-danger.sm', { onclick: () => { T.borrarServicio(s.id); cerrarSheet(); toast('Servicio eliminado'); (onSave || go)(); } }, ico('trash')) : null,
      h('button.btn.btn-acento.block', {
        onclick: () => {
          const data = { nombre: nom.value.trim() || 'Servicio', dur: +dur.value || 30, precio: +pre.value || 0 };
          if (s) T.actualizarServicio(s.id, data); else T.crearServicio(data);
          cerrarSheet(); toast('✓ Guardado', 'ok'); (onSave || go)();
        }
      }, ico('check'), 'Guardar'));
    abrirSheet({ titulo: s ? 'Editar servicio' : 'Nuevo servicio', cuerpo, pie });
  }

  /* ---------- sheet: color de marca (live preview + validación AA) ------- */
  function sheetTema() {
    const guardado = T.tema();
    let elegido = guardado.acento;
    const grid = h('div.tema-grid');
    const checkLn = h('div.tema-check');
    const hexIn = h('input', { type: 'text', value: elegido, maxlength: '7', spellcheck: 'false', autocomplete: 'off' });

    const marcar = () => [...grid.children].forEach(sw =>
      sw.classList.toggle('sel', sw.dataset.c === elegido.toUpperCase()));
    const pintarCheck = (v) => {
      checkLn.replaceChildren(v.ok
        ? h('span.ok-line', '✓ Se lee bien sobre crema y blanco')
        : h('span.mal-line', '✗ Muy claro, no se va a leer. ',
          h('button.link-fix', {
            onclick: () => { const fix = Tema.corregir(elegido); hexIn.value = fix; setear(fix); }
          }, 'Oscurecer automáticamente')));
    };
    // vista previa EN VIVO: aplica los tokens a toda la app al instante
    const setear = (hex) => {
      elegido = hex;
      Tema.aplicar(Tema.derivar(hex));
      marcar();
      pintarCheck(Tema.validar(hex));
    };

    Tema.PALETA.forEach(p => grid.append(
      h('button.tema-sw', {
        'data-c': p.c, title: p.n, 'aria-label': p.n, style: { background: p.c },
        onclick: () => { hexIn.value = p.c; setear(p.c); }
      })));

    hexIn.addEventListener('input', () => {
      let v = hexIn.value.trim();
      if (v && v[0] !== '#') v = '#' + v;
      if (/^#[0-9a-fA-F]{6}$/.test(v)) setear(v);
    });

    // mini vista de la página pública (usa las mismas variables → vive)
    const prev = h('div.tema-prev',
      h('div.tp-hero',
        h('span.tp-foto', T.negocio().logoEmoji),
        h('div', h('b', T.negocio().nombre), h('small', 'Así la ve tu cliente'))),
      h('div.tp-btn', 'Confirmar turno'));

    const cuerpo = h('div',
      h('p.txt-suave', { style: { fontWeight: '700', fontSize: '.88rem', margin: '0 0 14px' } },
        'Tu color pinta botones y detalles de la app y de tu página de reservas. La base crema y tinta no cambia: es la firma de Imán.'),
      grid,
      h('div.campo', { style: { marginTop: '16px', marginBottom: '0' } },
        h('label', 'O pegá tu color exacto ', h('span.opt', '· hex')),
        hexIn, checkLn),
      prev);

    const pie = h('div', { style: { display: 'flex', gap: '9px', width: '100%' } },
      h('button.btn.block', { onclick: () => cerrarSheet() }, 'Cancelar'),
      h('button.btn.btn-acento.block', {
        onclick: () => {
          const v = Tema.validar(elegido);
          if (!v.ok) { toast('Ese color no se lee bien: oscurecelo primero'); return; }
          T.actualizarTema({ acento: v.tokens.acento, tokens: v.tokens });
          cerrarSheet();
          toast('✓ Color guardado', 'ok');
          go();
        }
      }, ico('check'), 'Guardar'));

    marcar();
    pintarCheck(Tema.validar(elegido));
    abrirSheet({
      titulo: 'El color de tu marca',
      sub: 'Se aplica acá y en tu página de reservas',
      cuerpo, pie,
      // cerrar sin guardar (o después de guardar) → queda el tema persistido
      onClose: () => { const t = T.tema(); Tema.aplicar(t.tokens || Tema.derivar(t.acento)); }
    });
  }

  /* =======================================================================
     ONBOARDING (bienvenida cartoon, saltable)
     ===================================================================== */
  function renderOnboarding() {
    const pasos = [
      { emo: 'wave', tit: '¡Bienvenido a Imán Turnos!', txt: 'En menos de 3 minutos tu barbería queda lista para recibir turnos online. Sin instalar nada.' },
      { emo: 'scissors', tit: 'Tus servicios', txt: 'Ya te dejamos los clásicos de barbería cargados. Editá precios y tiempos cuando quieras.' },
      { emo: 'clock', tit: 'Tus horarios', txt: 'De lunes a sábado, de 10 a 20. Cambialo en dos toques desde Ajustes.' },
      { emo: 'link', tit: 'Tu link para compartir', txt: 'Pegalo en tu bio de Instagram y que tus clientes reserven solos, incluso mientras dormís.' }
    ];
    let i = 0;
    const cont = h('div.pantalla', { style: { display: 'flex', flexDirection: 'column', minHeight: '100svh', padding: '0 20px 30px' } });
    const render = () => {
      const p = pasos[i];
      const emoMap = { wave: '👋', scissors: '✂️', clock: '🕙', link: '🔗' };
      cont.replaceChildren(
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' } },
          h('div', { style: { display: 'flex', gap: '5px' } }, ...pasos.map((_, k) => h('span', { style: { width: k === i ? '22px' : '7px', height: '7px', borderRadius: '99px', background: k <= i ? 'var(--acento)' : 'var(--linea)', transition: 'all .3s' } }))),
          h('button.btn.btn-fantasma.sm', { style: { boxShadow: 'none', color: 'var(--tinta-suave)' }, onclick: () => location.hash = '#/hoy' }, 'Saltar')),
        h('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: '10px' } },
          i === 0 ? h('div', { style: { margin: '0 auto 6px' } }, imanLogo(true)) : null,
          h('div', { style: { fontSize: '4rem', animation: 'flotaEmo 4s ease-in-out infinite' } }, emoMap[p.emo]),
          h('h1', { style: { fontSize: '1.8rem' } }, p.tit),
          h('p.txt-suave', { style: { fontWeight: '700', maxWidth: '30ch', margin: '0 auto', fontSize: '1.02rem' } }, p.txt)),
        i === pasos.length - 1
          ? h('button.btn.btn-acento.block', { onclick: () => location.hash = '#/hoy' }, ico('check'), 'Empezar a recibir turnos')
          : h('button.btn.btn-acento.block', { onclick: () => { i++; render(); } }, 'Siguiente', ico('next'))
      );
    };
    render();
    root.replaceChildren(cont);
  }

  /* ---------- router ----------------------------------------------------- */
  function go() {
    cerrarSheet(true);
    root.classList.remove('con-panel');
    const hash = location.hash || '#/hoy';
    const [, ruta, arg] = hash.split('/');
    if (ruta === 'clientes') renderClientes();
    else if (ruta === 'cliente') renderClienteDetalle(arg);
    else if (ruta === 'promos') renderPromos();
    else if (ruta === 'ajustes') renderAjustes();
    else if (ruta === 'onboarding') renderOnboarding();
    else renderHoy();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('hashchange', go);
  go();
})();

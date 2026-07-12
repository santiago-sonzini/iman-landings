/* ==========================================================================
   Imán Turnos — CAPA DE DATOS (mock)
   --------------------------------------------------------------------------
   Este es el ÚNICO módulo que habla con "el backend". Hoy devuelve datos
   sembrados en memoria; mañana se reemplaza por fetch() al servidor real
   sin tocar ni un componente. Toda la UI consume `Turnos.*` y nada más.

   Exporta un objeto global `Turnos` con:
     - lectura:  negocio(), servicios(), clientes(), turnosDelDia(fecha),
                 huecosDelDia(fecha), clientesQueTocan(), disponibilidad(...)
     - escritura: marcarAsistencia(), reservar(), agendarManual(),
                  crearServicio(), etc. (mutan el seed en memoria)
     - utils:    fmtPrecio(), waLink(), etc.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- utilidades de fecha (todo relativo a HOY para que el demo
     siempre se vea "hoy", cualquier día que se abra) ---------------------- */
  const MIN = 60 * 1000, DIA = 24 * 60 * MIN;
  function hoy() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function masDias(base, n) { return new Date(base.getTime() + n * DIA); }
  function iso(d) { return d.toISOString().slice(0, 10); }              // yyyy-mm-dd
  function diaSemana(d) { return d.getDay(); }                          // 0 dom … 6 sáb
  function diasEntre(a, b) { return Math.round((b - a) / DIA); }
  const HOY = hoy();

  /* ---------- negocio (barbería sembrada) ------------------------------- */
  const negocio = {
    id: 'brb-roble',
    nombre: 'Barbería El Roble',
    handle: 'elroble',                 // → iman.ar/elroble
    barbero: 'Nico',
    telefono: '5491134567890',         // formato wa.me
    zona: 'Villa Crespo, CABA',
    logoEmoji: '💈',
    vertical: 'barberia',
    // config de agenda
    dias: [1, 2, 3, 4, 5, 6],          // lun a sáb
    abre: '10:00',
    cierra: '20:00',
    buffer: 10,                        // minutos entre turnos
    // Mercado Pago (mock)
    senaActiva: true,
    senaMonto: 2000,
    // tema v1: solo acento. Niveles futuros (logoUrl, fotoPortada) entran acá
    // y la página pública ya los leería de este mismo objeto.
    tema: { acento: '#1B7B94' }
  };

  /* ---------- servicios (defaults barbería, editables) ------------------ */
  let servicios = [
    { id: 's1', nombre: 'Corte',              dur: 40, precio: 8000,  emoji: '✂️', activo: true },
    { id: 's2', nombre: 'Corte + Barba',      dur: 55, precio: 12000, emoji: '💈', activo: true },
    { id: 's3', nombre: 'Barba',              dur: 25, precio: 5000,  emoji: '🧔', activo: true },
    { id: 's4', nombre: 'Corte niño',         dur: 30, precio: 6500,  emoji: '🧒', activo: true },
    { id: 's5', nombre: 'Perfilado + diseño', dur: 20, precio: 4500,  emoji: '🪒', activo: true },
    { id: 's6', nombre: 'Camuflaje de canas', dur: 45, precio: 9500,  emoji: '🎨', activo: false }
  ];

  /* ---------- clientes (historial creíble) ------------------------------
     ultimaHace = días desde la última visita; ciclo = cada cuántos días
     suele volver. Con eso se calcula el semáforo de recurrencia.          */
  let clientes = [
    { id: 'c1',  nombre: 'Marta Giménez',    tel: '5491141112233', email: 'marta.g@gmail.com', servicioHab: 's1', ultimaHace: 31, ciclo: 24, visitas: 14 },
    { id: 'c2',  nombre: 'Lucas Ferreyra',   tel: '5491144445566', email: '',                  servicioHab: 's2', ultimaHace: 19, ciclo: 21, visitas: 9  },
    { id: 'c3',  nombre: 'Diego Sosa',       tel: '5491155667788', email: 'diegososa@hotmail.com', servicioHab: 's1', ultimaHace: 40, ciclo: 28, visitas: 22 },
    { id: 'c4',  nombre: 'Fede Paz',         tel: '5491133221100', email: '',                  servicioHab: 's5', ultimaHace: 8,  ciclo: 30, visitas: 5  },
    { id: 'c5',  nombre: 'Rodrigo Núñez',    tel: '5491166778899', email: 'rodri.n@gmail.com', servicioHab: 's2', ultimaHace: 26, ciclo: 25, visitas: 17 },
    { id: 'c6',  nombre: 'Tomás Aguilar',    tel: '5491177889900', email: '',                  servicioHab: 's1', ultimaHace: 52, ciclo: 30, visitas: 6  },
    { id: 'c7',  nombre: 'Juan Cruz Molina', tel: '5491122334455', email: 'jc.molina@gmail.com', servicioHab: 's2', ultimaHace: 14, ciclo: 22, visitas: 11 },
    { id: 'c8',  nombre: 'Nacho Vera',       tel: '5491199001122', email: '',                  servicioHab: 's3', ultimaHace: 33, ciclo: 20, visitas: 8  },
    { id: 'c9',  nombre: 'Santi Ríos',       tel: '5491100112233', email: '',                  servicioHab: 's1', ultimaHace: 21, ciclo: 26, visitas: 4  },
    { id: 'c10', nombre: 'Pablo Herrera',    tel: '5491188990011', email: 'pherrera@gmail.com', servicioHab: 's2', ultimaHace: 45, ciclo: 27, visitas: 19 },
    { id: 'c11', nombre: 'Emi Castro',       tel: '5491111223344', email: '',                  servicioHab: 's4', ultimaHace: 12, ciclo: 35, visitas: 3  },
    { id: 'c12', nombre: 'Ale Domínguez',    tel: '5491155443322', email: '',                  servicioHab: 's1', ultimaHace: 29, ciclo: 24, visitas: 13 }
  ];

  /* ---------- turnos de la semana --------------------------------------
     Se generan relativos a HOY. Hoy queda con 7 ocupados y 3 huecos, para
     que la pantalla estrella (timeline) demuestre sola.                    */
  let turnos = [];
  let _seq = 100;
  const uid = (p) => `${p}${++_seq}`;

  function nuevoTurno(fechaOffset, inicio, servicioId, clienteId, estado) {
    return {
      id: uid('t'),
      fecha: iso(masDias(HOY, fechaOffset)),
      inicio,
      servicioId,
      clienteId: clienteId || null,
      nombreManual: null,
      telManual: null,
      estado: estado || 'confirmado',   // confirmado | asistio | novino | cancelado
      sena: false,
      canal: clienteId ? 'link' : 'manual'
    };
  }

  // HOY (offset 0): 7 ocupados + 3 huecos (10:00 → 19:15 aprox)
  turnos.push(nuevoTurno(0, '10:00', 's2', 'c5'));   // Rodrigo — corte+barba
  turnos.push(nuevoTurno(0, '11:05', 's1', 'c7'));   // Juan Cruz — corte
  // hueco 11:55
  turnos.push(nuevoTurno(0, '12:40', 's1', 'c9'));   // Santi — corte
  turnos.push(nuevoTurno(0, '13:30', 's3', 'c8'));   // Nacho — barba
  // hueco 14:05 (post-almuerzo)
  turnos.push(nuevoTurno(0, '15:30', 's2', 'c2'));   // Lucas — corte+barba
  turnos.push(nuevoTurno(0, '16:35', 's4', 'c11'));  // Emi — niño
  turnos.push(nuevoTurno(0, '17:15', 's1', 'c12'));  // Ale — corte
  // hueco 18:05 (prime time, el más valioso)
  turnos.push(nuevoTurno(0, '18:50', 's5', 'c4'));   // Fede — perfilado

  // Ayer (para historial): algunos con asistió / no vino
  turnos.push(nuevoTurno(-1, '11:00', 's1', 'c3', 'asistio'));
  turnos.push(nuevoTurno(-1, '16:00', 's2', 'c10', 'novino'));

  // El resto de la quincena (histórico y futuro) se genera determinístico
  // más abajo (ver sembrarSemanas) para que semana y mes demuestren bien.

  /* ---------- helpers internos ------------------------------------------ */
  const svc = (id) => servicios.find(s => s.id === id);
  const cli = (id) => clientes.find(c => c.id === id);

  function toMin(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
  function toHHMM(min) { const h = Math.floor(min / 60), m = min % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }

  // estado de recurrencia de un cliente: aldia | letoca | vencida
  function estadoRecurrencia(c) {
    const r = c.ultimaHace / c.ciclo;
    if (r < 0.85) return 'aldia';
    if (r <= 1.15) return 'letoca';
    return 'vencida';
  }

  /* ---------- siembra del resto de la quincena --------------------------
     Determinística (nada de Math.random): el demo tiene que verse idéntico
     en cada carga. Hoy y ayer quedan curados a mano arriba; esto puebla
     -21..+13 con densidad creíble por día de semana, sin superponer turnos
     (cursor respeta duración + buffer).                                   */
  (function sembrarSemanas() {
    const HORAS = ['10:00', '10:45', '11:30', '12:15', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15'];
    const DENSIDAD = { 1: .45, 2: .6, 3: .55, 4: .65, 5: .8, 6: .85 };   // lun..sáb
    // los clientes "vencidos" estrella no aparecen en el futuro: sostienen
    // la historia de clientesQueTocan (Marta, Diego, Tomás, Nacho, Pablo)
    const VENCIDOS = ['c1', 'c3', 'c6', 'c8', 'c10'];
    for (let off = -21; off <= 13; off++) {
      if (off === 0 || off === -1) continue;                    // curados a mano
      const f = masDias(HOY, off);
      const dow = diaSemana(f);
      if (!negocio.dias.includes(dow)) continue;                // cerrado
      const pool = off > 0 ? clientes.filter(c => !VENCIDOS.includes(c.id)) : clientes;
      let cursor = 0;
      HORAS.forEach((hh, i) => {
        const dado = (Math.abs(off) * 7 + i * 13 + dow * 3) % 10;   // pseudo-azar estable
        if (dado >= DENSIDAD[dow] * 10) return;
        const [H, M] = hh.split(':').map(Number);
        const min = H * 60 + M;
        if (min < cursor) return;                               // no pisar el anterior
        const c = pool[(Math.abs(off) * 5 + i * 3) % pool.length];
        const s = servicios.find(x => x.id === c.servicioHab) || servicios[0];
        const estado = off < 0 ? ((Math.abs(off) + i) % 8 === 0 ? 'novino' : 'asistio') : 'confirmado';
        turnos.push(nuevoTurno(off, hh, c.servicioHab, c.id, estado));
        cursor = min + s.dur + negocio.buffer;
      });
    }
  })();

  /* ---------- API de lectura -------------------------------------------- */
  function turnosDelDia(fechaISO) {
    return turnos
      .filter(t => t.fecha === fechaISO && t.estado !== 'cancelado')
      .map(hidratarTurno)
      .sort((a, b) => toMin(a.inicio) - toMin(b.inicio));
  }

  function hidratarTurno(t) {
    const s = svc(t.servicioId);
    const c = t.clienteId ? cli(t.clienteId) : null;
    const finMin = toMin(t.inicio) + (s ? s.dur : 30);
    return {
      ...t,
      servicio: s,
      cliente: c,
      nombre: c ? c.nombre : (t.nombreManual || 'Turno manual'),
      tel: c ? c.tel : t.telManual,
      fin: toHHMM(finMin),
      dur: s ? s.dur : 30,
      precio: s ? s.precio : 0,
      // datetimes canónicos del evento: cualquier vista (día/semana/mes) y el
      // futuro export a Google Calendar consumen ESTOS campos, no fecha+hora sueltas
      inicioISO: `${t.fecha}T${t.inicio}:00`,
      finISO: `${t.fecha}T${toHHMM(finMin)}:00`
    };
  }

  // Construye la grilla del día: turnos ocupados + HUECOS entre ellos.
  // Devuelve items ordenados: { tipo:'turno'|'hueco', ... }
  function grillaDelDia(fechaISO) {
    const ocupados = turnosDelDia(fechaISO);
    const items = [];
    const aperturaMin = toMin(negocio.abre);
    const cierreMin = toMin(negocio.cierra);
    const buf = negocio.buffer;

    let cursor = aperturaMin;
    for (const t of ocupados) {
      const ini = toMin(t.inicio);
      // ¿hay un hueco antes de este turno? (al menos para un corte corto)
      if (ini - cursor >= 25) {
        items.push(hueco(fechaISO, cursor, ini));
      }
      items.push({ tipo: 'turno', ...t });
      cursor = toMin(t.fin) + buf;
    }
    // hueco de cola hasta el cierre
    if (cierreMin - cursor >= 25) {
      items.push(hueco(fechaISO, cursor, cierreMin));
    }
    return items;
  }

  function hueco(fechaISO, desdeMin, hastaMin) {
    const largo = hastaMin - desdeMin;
    // "prime time" = después de las 17:30, el hueco más caro de perder
    const prime = desdeMin >= toMin('17:30');
    return {
      tipo: 'hueco',
      fecha: fechaISO,
      inicio: toHHMM(desdeMin),
      fin: toHHMM(hastaMin),
      largo,
      prime
    };
  }

  function ocupacionDelDia(fechaISO) {
    const items = grillaDelDia(fechaISO);
    const turnos = items.filter(i => i.tipo === 'turno').length;
    const huecos = items.filter(i => i.tipo === 'hueco').length;
    return { turnos, huecos, total: turnos + huecos };
  }

  function diaCerrado(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    return !negocio.dias.includes(new Date(y, m - 1, d).getDay());
  }

  // Resumen de ocupación para un rango de días (tira semanal, mes).
  // Un solo agregado: cuando exista backend, esto es UN endpoint.
  function resumenRango(desdeOffset, nDias) {
    const out = [];
    for (let k = 0; k < nDias; k++) {
      const off = desdeOffset + k;
      const fecha = iso(masDias(HOY, off));
      if (diaCerrado(fecha)) { out.push({ fecha, offset: off, cerrado: true, turnos: 0, huecos: 0, total: 0 }); continue; }
      out.push({ fecha, offset: off, cerrado: false, ...ocupacionDelDia(fecha) });
    }
    return out;
  }

  function offsetDe(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    return Math.round((new Date(y, m - 1, d) - HOY) / DIA);
  }

  /* Export one-way de eventos (forma que espera un insert de Google
     Calendar). La integración futura se cuelga de este único método:
     titulo → summary, inicioISO/finISO → start/end.dateTime, notas →
     description. Nada más de la app necesita cambiar.                    */
  function eventosParaExport(desdeISO, hastaISO) {
    return turnos
      .filter(t => t.estado !== 'cancelado' && t.fecha >= desdeISO && t.fecha <= hastaISO)
      .map(hidratarTurno)
      .map(t => ({
        id: t.id,
        titulo: `${t.servicio ? t.servicio.nombre : 'Turno'} — ${t.nombre}`,
        inicioISO: t.inicioISO,
        finISO: t.finISO,
        estado: t.estado,
        notas: `Reservado por ${t.canal} · ${negocio.nombre}`
      }));
  }

  // Clientes cuyo ciclo de visita está cumplido o vencido (para llenar huecos)
  // Ordenados por urgencia (los más vencidos primero).
  function clientesQueTocan() {
    return clientes
      .map(c => ({ ...c, recu: estadoRecurrencia(c), atraso: c.ultimaHace - c.ciclo }))
      .filter(c => c.recu !== 'aldia')
      .sort((a, b) => b.atraso - a.atraso)
      .map(c => ({
        ...c,
        servicio: svc(c.servicioHab),
        wa: waLlenarHueco(c)
      }));
  }

  // Disponibilidad pública para la página de reserva: próximos N días con
  // sus horarios libres, dado un servicio (respeta duración + buffer).
  function disponibilidad(servicioId, dias = 14) {
    const s = svc(servicioId) || servicios[0];
    const out = [];
    for (let off = 0; off < dias; off++) {
      const f = masDias(HOY, off);
      if (!negocio.dias.includes(diaSemana(f))) continue;
      const fechaISO = iso(f);
      const libres = slotsLibres(fechaISO, s, off === 0);
      if (libres.length) out.push({ fecha: fechaISO, offset: off, slots: libres });
    }
    return out;
  }

  function slotsLibres(fechaISO, s, esHoy) {
    const ocupados = turnosDelDia(fechaISO).map(t => [toMin(t.inicio), toMin(t.fin) + negocio.buffer]);
    const aperturaMin = toMin(negocio.abre);
    const cierreMin = toMin(negocio.cierra);
    const paso = 15; // grilla comercial de 15'
    const ahora = new Date();
    const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
    const libres = [];
    for (let m = aperturaMin; m + s.dur <= cierreMin; m += paso) {
      if (esHoy && m < ahoraMin + 30) continue; // no ofrecer turnos ya pasados
      const fin = m + s.dur;
      const choca = ocupados.some(([a, b]) => m < b && fin > a);
      if (!choca) libres.push({ inicio: toHHMM(m), fin: toHHMM(fin) });
    }
    return libres;
  }

  /* ---------- API de escritura (mutan seed en memoria) ------------------ */
  function marcarAsistencia(turnoId, estado) {   // asistio | novino | confirmado
    const t = turnos.find(x => x.id === turnoId);
    if (t) t.estado = estado;
    return t;
  }
  function cancelarTurno(turnoId) {
    const t = turnos.find(x => x.id === turnoId);
    if (t) t.estado = 'cancelado';
    return t;
  }
  function agendarManual({ fecha, inicio, servicioId, nombre, tel, clienteId }) {
    const t = nuevoTurno(0, inicio, servicioId, clienteId || null, 'confirmado');
    t.fecha = fecha;
    t.nombreManual = clienteId ? null : (nombre || 'Turno manual');
    t.telManual = tel || null;
    t.canal = 'manual';
    turnos.push(t);
    return hidratarTurno(t);
  }
  // Reserva desde la página pública. Crea cliente si es nuevo.
  function reservar({ fecha, inicio, servicioId, nombre, tel, email, sena }) {
    let c = clientes.find(x => x.tel === tel);
    if (!c) {
      c = { id: uid('c'), nombre, tel, email: email || '', servicioHab: servicioId, ultimaHace: 0, ciclo: 25, visitas: 0 };
      clientes.push(c);
    }
    const t = nuevoTurno(0, inicio, servicioId, c.id, 'confirmado');
    t.fecha = fecha;
    t.canal = 'link';
    t.sena = !!sena;
    turnos.push(t);
    return hidratarTurno(t);
  }
  function crearServicio(data) {
    const s = { id: uid('s'), activo: true, emoji: '✂️', ...data };
    servicios.push(s);
    return s;
  }
  function actualizarServicio(id, data) { Object.assign(svc(id) || {}, data); return svc(id); }
  function borrarServicio(id) { servicios = servicios.filter(s => s.id !== id); }
  function actualizarNegocio(data) { Object.assign(negocio, data); return negocio; }

  /* ---------- tema por comercio (v1: solo acento) ------------------------
     El hex elegido vive en negocio.tema y se persiste POR TENANT. Los
     tokens derivados (osc/suave/on) los calcula la UI (UI.Tema.derivar) y
     se guardan ya resueltos: así el boot inline de cada página los aplica
     antes del primer paint sin recalcular ni cargar JS de más.           */
  const TEMA_KEY = 'imanturnos.tema.' + negocio.id;
  function tema() {
    try {
      const g = JSON.parse(localStorage.getItem(TEMA_KEY));
      if (g && g.acento) return g;
    } catch (e) { /* storage bloqueado: usar default */ }
    return { acento: negocio.tema.acento, tokens: null };
  }
  function actualizarTema(t) {   // { acento, tokens:{acento,osc,suave,on} }
    negocio.tema = { ...negocio.tema, acento: t.acento };
    try { localStorage.setItem(TEMA_KEY, JSON.stringify(t)); } catch (e) { }
    return t;
  }

  /* ---------- formato / links ------------------------------------------- */
  function fmtPrecio(n) {
    return '$ ' + n.toLocaleString('es-AR');
  }
  function fmtFechaLarga(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${dias[dt.getDay()]} ${d} de ${meses[m - 1]}`;
  }
  function fmtFechaCorta(fechaISO) {
    const [, m, d] = fechaISO.split('-');
    return `${d}/${m}`;
  }
  function etiquetaDia(fechaISO) {
    const off = diasEntre(HOY, new Date(fechaISO + 'T00:00'));
    if (off === 0) return 'Hoy';
    if (off === 1) return 'Mañana';
    if (off === -1) return 'Ayer';
    return null;
  }
  function waLink(tel, texto) {
    return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
  }
  function waLlenarHueco(c) {
    const dias = c.ultimaHace;
    const s = svc(c.servicioHab);
    const nombre = c.nombre.split(' ')[0];
    const texto = `¡Hola ${nombre}! Soy ${negocio.barbero} de ${negocio.nombre} ${negocio.logoEmoji} ` +
      `Ya pasaron ${dias} días de tu ${s ? s.nombre.toLowerCase() : 'último turno'}. ` +
      `Tengo un lugar esta semana, ¿te lo agendo?`;
    return waLink(c.tel, texto);
  }
  function waConfirmacion(turno) {
    const nombre = turno.nombre.split(' ')[0];
    const texto = `¡Listo ${nombre}! Te agendé ${turno.servicio.nombre} el ${fmtFechaLarga(turno.fecha)} ` +
      `a las ${turno.inicio} hs en ${negocio.nombre}. ¡Te espero! ${negocio.logoEmoji}`;
    return waLink(turno.tel, texto);
  }

  /* ---------- export ---------------------------------------------------- */
  global.Turnos = {
    HOY, iso, masDias, diaSemana,
    negocio: () => negocio,
    servicios: () => servicios.filter(s => s.activo !== false || true), // todos; UI filtra
    serviciosActivos: () => servicios.filter(s => s.activo),
    servicio: svc,
    clientes: () => clientes.map(c => ({ ...c, recu: estadoRecurrencia(c), servicio: svc(c.servicioHab) })),
    cliente: (id) => { const c = cli(id); return c ? { ...c, recu: estadoRecurrencia(c), servicio: svc(c.servicioHab) } : null; },
    estadoRecurrencia,
    turnosDelDia, grillaDelDia, ocupacionDelDia, clientesQueTocan,
    disponibilidad, diaCerrado, resumenRango, offsetDe, eventosParaExport,
    tema, actualizarTema,
    historialCliente: (id) => turnos.filter(t => t.clienteId === id).map(hidratarTurno)
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    // escritura
    marcarAsistencia, cancelarTurno, agendarManual, reservar,
    crearServicio, actualizarServicio, borrarServicio, actualizarNegocio,
    // formato
    fmtPrecio, fmtFechaLarga, fmtFechaCorta, etiquetaDia,
    waLink, waLlenarHueco, waConfirmacion
  };
})(window);

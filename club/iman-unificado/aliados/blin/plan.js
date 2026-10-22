// Blin × IMÁN: el test que sugiere un plan, el resultado y el envío del lead.
(() => {
  // Adónde va lo que deja cada persona. Sin formEndpoint, el plan se manda por WhatsApp (el visitante toca enviar).
  const CONFIG = {
    formEndpoint: '/api/blin',   // iman.ar: guarda el lead en el panel del asistente (server/blin.mjs → bot /api/lead).
    whatsapp: '5493534276267',   // Blin
    storageKey: 'blin.plan.3',   // subir el número si cambian las preguntas
  };

  const { money, esc, LIMITS, blin, imanItems, offers, byId, planCard } = window.BLIN;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- El test ---------------- */
  const METAS = {
    conocer: { t: 'Que más gente conozca mi marca', side: 'b' },
    contenido: { t: 'Contenido y redes con estrategia', side: 'b' },
    identidad: { t: 'Una identidad de marca que se note', side: 'b' },
    ads: { t: 'Publicidad en Meta Ads', side: 'b' },
    evento: { t: 'Cubrir u organizar un evento', side: 'b' },
    whatsapp: { t: 'Responder WhatsApp al instante, todo el día', side: 'i' },
    catalogo: { t: 'Una carta o catálogo online', side: 'i' },
    gestion: { t: 'Ordenar pedidos, ventas y stock', side: 'i' },
    club: { t: 'Que los clientes vuelvan', side: 'i' },
    turnos: { t: 'Turnos o reservas online', side: 'i' },
    avisos: { t: 'Avisar lanzamientos y eventos', side: 'i' },
  };

  // Una pregunta por pantalla. Las de una opción pasan solas al tocar; las de varias (multi) llevan casillas y "Siguiente".
  const Q = [
    { id: 'rubro', q: '¿Qué tipo de negocio tenés?', opts: [['gastro', 'Gastronomía'], ['moda', 'Moda e indumentaria'], ['calzado', 'Calzado y accesorios'], ['belleza', 'Belleza y estética'], ['salud', 'Salud y bienestar'], ['comercio', 'Comercio o almacén'], ['mayorista', 'Distribuidora o mayorista'], ['eventos', 'Eventos y entretenimiento'], ['servicios', 'Servicios profesionales'], ['otro', 'Otro rubro']] },
    { id: 'canales', multi: true, q: '¿Dónde vendés hoy?', hint: 'Marcá todas las que correspondan.', opts: [['local', 'Local a la calle'], ['whatsapp', 'WhatsApp'], ['redes', 'Instagram o Facebook'], ['web', 'Tienda online'], ['turnos', 'Con turnos o reservas'], ['mayorista', 'Venta mayorista']] },
    { id: 'metas', multi: true, q: '¿Qué querés lograr en los próximos meses?', hint: 'Marcá todas las que quieras.', legend: true, opts: Object.entries(METAS).map(([k, m]) => [k, m.t, m.side]) },
    { id: 'estado', q: '¿Quién maneja tus redes hoy?', opts: [['nadie', 'Nadie, están paradas'], ['yo', 'Yo, cuando puedo'], ['equipo', 'Alguien del equipo'], ['agencia', 'Una agencia']] },
    { id: 'plataformas', q: '¿En cuántas redes querés estar?', opts: [['1', 'En una'], ['2', 'En dos'], ['3', 'En tres o más']] },
    { id: 'consultas', q: '¿Cuántas consultas te llegan por WhatsApp por día?', opts: [['10', 'Menos de 10'], ['30', '10 a 30'], ['80', '30 a 80'], ['mas', 'Más de 80']] },
    { id: 'productos', q: '¿Cuántos productos o servicios vendés?', opts: [['50', 'Hasta 50'], ['200', '50 a 200'], ['500', '200 a 500'], ['mas', 'Más de 500']] },
    { id: 'presupuesto', q: '¿Cuánto querés invertir por mes?', opts: [['500', 'Hasta $500.000'], ['900', '$500.000 a $900.000'], ['1300', '$900.000 a $1.300.000'], ['mas', 'Más de $1.300.000'], ['rec', 'Prefiero que me recomienden']] },
    { id: 'cuando', q: '¿Cuándo querés arrancar?', opts: [['ya', 'Ya mismo'], ['mes', 'Este mes'], ['pronto', 'En 1 a 3 meses'], ['ver', 'Estoy averiguando']] },
    { id: 'datos', form: true, q: 'Último paso: ¿a quién le mandamos el plan?' },
  ];

  const LABEL = {};
  Q.forEach(q => (q.opts || []).forEach(([k, t]) => { LABEL[`${q.id}:${k}`] = t; }));
  const label = (id, k) => LABEL[`${id}:${k}`] || k;

  let S = { step: 0, a: {}, contact: {}, done: false, chosen: null };
  try { const saved = JSON.parse(localStorage.getItem(CONFIG.storageKey) || 'null'); if (saved && saved.a) S = { ...S, ...saved }; } catch (e) {}
  const save = () => { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(S)); } catch (e) {} };

  const quiz = $('[data-quiz]'), stageEl = $('[data-stage]'), result = $('[data-result]');
  if (!quiz) return;
  const L = 'ABCDEFGHIJKL';
  let busy = false;

  const optBtn = (q, [k, t, side], i, on) => `
    <button type="button" class="opt${q.multi ? ' check' : ''}" data-k="${k}" ${q.multi ? 'role="checkbox" aria-checked' : 'aria-pressed'}="${on}">
      ${q.multi ? '<span class="box" aria-hidden="true"></span>' : `<span class="l">${L[i]}</span>`}<span>${esc(t)}</span>${side ? `<i class="side ${side}" aria-hidden="true"></i>` : ''}
    </button>`;

  function render() {
    const q = Q[S.step];
    $('[data-count]').textContent = `Pregunta ${S.step + 1} de ${Q.length}`;
    $('[data-bar]').style.width = `${(S.step / Q.length) * 100}%`;
    $('[data-back]').hidden = S.step === 0;
    let body = '', foot = '';
    if (q.form) {
      const c = S.contact;
      body = `<form class="fields" data-form novalidate>
        <div class="field"><label for="f-nombre">Tu nombre</label><input id="f-nombre" name="nombre" autocomplete="given-name" value="${esc(c.nombre || '')}" required></div>
        <div class="field"><label for="f-negocio">Negocio o marca</label><input id="f-negocio" name="negocio" autocomplete="organization" value="${esc(c.negocio || '')}" required></div>
        <div class="field"><label for="f-wa">WhatsApp</label><input id="f-wa" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="353 4 123456" value="${esc(c.whatsapp || '')}" required></div>
        <div class="field"><label for="f-mail">Email <em>opcional</em></label><input id="f-mail" name="email" type="email" autocomplete="email" value="${esc(c.email || '')}"></div>
        <div class="field full"><label for="f-ig">Instagram de la marca <em>opcional</em></label><input id="f-ig" name="instagram" placeholder="@tumarca" value="${esc(c.instagram || '')}"></div>
        <button type="submit" hidden></button>
      </form>
      <p class="consent">Usamos estos datos solo para mandarte el plan y escribirte por él.</p>`;
      foot = `<div class="q-foot"><small>Al tocar, ves tu plan.</small><button class="btn" type="button" data-next>Ver mi plan <span class="arr">→</span></button></div>`;
    } else if (q.multi) {
      const sel = S.a[q.id] || [];
      body = `<div class="opts">${q.opts.map((o, i) => optBtn(q, o, i, sel.includes(o[0]))).join('')}</div>`;
      if (q.legend) body += `<p class="q-legend"><span><i style="background:var(--red-2)"></i>Lo hace Blin</span><span><i style="background:var(--grad)"></i>Lo hace IMÁN</span></p>`;
      foot = `<div class="q-foot"><small data-n></small><button class="btn" type="button" data-next>Siguiente <span class="arr">→</span></button></div>`;
    } else {
      body = `<div class="opts">${q.opts.map((o, i) => optBtn(q, o, i, S.a[q.id] === o[0])).join('')}</div>`;
    }
    stageEl.innerHTML = `<div class="q"><span class="q-num">${String(S.step + 1).padStart(2, '0')}</span><h3>${esc(q.q)}</h3>${q.hint ? `<p class="q-hint">${esc(q.hint)}</p>` : ''}${body}${foot}</div>`;
    if (q.multi) syncMulti(q);
  }

  // Casillas: se actualizan en el lugar, sin volver a dibujar la pregunta.
  function syncMulti(q) {
    const sel = S.a[q.id] || [];
    const full = q.max && sel.length >= q.max;
    $$('.opt', stageEl).forEach(b => { const on = sel.includes(b.dataset.k); b.setAttribute('aria-checked', on); b.disabled = !!full && !on; });
    const n = $('[data-n]', stageEl);
    if (n) n.textContent = sel.length ? `${sel.length} marcada${sel.length > 1 ? 's' : ''}${q.max ? ` de ${q.max}` : ''}` : 'Marcá al menos una.';
    const next = $('[data-next]', stageEl);
    if (next) next.disabled = !sel.length;
  }

  function go(step) {
    S.step = Math.max(0, Math.min(Q.length - 1, step));
    save(); render();
    const top = quiz.getBoundingClientRect().top;
    if (top < 60 || top > innerHeight * .45) window.scrollTo({ top: scrollY + top - 84, behavior: 'smooth' });
  }

  stageEl.addEventListener('click', e => {
    const b = e.target.closest('.opt');
    const q = Q[S.step];
    if (b && !busy) {
      const k = b.dataset.k;
      if (q.multi) {
        const sel = new Set(S.a[q.id] || []);
        sel.has(k) ? sel.delete(k) : sel.add(k);
        S.a[q.id] = q.opts.map(o => o[0]).filter(x => sel.has(x));
        save(); syncMulti(q);
      } else {
        S.a[q.id] = k; save();
        $$('.opt', stageEl).forEach(o => o.setAttribute('aria-pressed', o === b));
        busy = true;
        setTimeout(() => { busy = false; go(S.step + 1); }, 240);
      }
      return;
    }
    if (e.target.closest('[data-next]')) {
      if (q.form) return submitContact();
      if ((S.a[q.id] || []).length) go(S.step + 1);
    }
  });
  $('[data-back]').addEventListener('click', () => { if (!busy) go(S.step - 1); });
  stageEl.addEventListener('submit', e => { e.preventDefault(); submitContact(); });
  stageEl.addEventListener('input', e => {
    const f = e.target.closest('.field'); if (f) { f.classList.remove('bad'); f.querySelector('.err')?.remove(); }
    if (e.target.name) { S.contact[e.target.name] = e.target.value; save(); }
  });

  function submitContact() {
    const form = $('[data-form]', stageEl);
    const c = Object.fromEntries(new FormData(form).entries());
    Object.keys(c).forEach(k => { c[k] = c[k].trim(); });
    const bad = [];
    if (!c.nombre) bad.push(['nombre', 'Decinos cómo te llamás.']);
    if (!c.negocio) bad.push(['negocio', 'Falta el nombre del negocio o la marca.']);
    if ((c.whatsapp || '').replace(/\D/g, '').length < 8) bad.push(['whatsapp', 'Revisá el número: con código de área.']);
    if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) bad.push(['email', 'Ese email no parece válido.']);
    $$('.field', form).forEach(f => { f.classList.remove('bad'); f.querySelector('.err')?.remove(); });
    if (bad.length) {
      bad.forEach(([n, m]) => { const f = form.elements[n].closest('.field'); f.classList.add('bad'); f.insertAdjacentHTML('beforeend', `<span class="err">${m}</span>`); });
      form.elements[bad[0][0]].focus();
      return;
    }
    S.contact = c; S.done = true; S.chosen = null; save();
    send('plan');
    showResult(true);
  }

  /* ---------------- Recomendación ---------------- */
  // El objetivo es el Mega Plus. Va el Estándar Plus si la inversión no llega, o si deja que le recomendemos y pide poco de redes.
  const CAP = { 500: 500000, 900: 900000, 1300: 1300000, mas: Infinity };
  const HIT_IMAN = { whatsapp: 'whatsapp', catalogo: 'catalogo', gestion: 'gestion', club: 'club', turnos: 'turnos', avisos: 'avisos' };
  const HIT_BLIN = { conocer: /contenido|Meta Ads/, contenido: /Estrategias|Calendario|Producción/, ads: /Meta Ads/, identidad: /diseño gráfico|marca/ };

  function recommend(a) {
    const metas = a.metas || [];
    const B = metas.filter(m => METAS[m].side === 'b');
    const plat = +a.plataformas || 1;
    const megaNeeds = plat >= 2 || B.includes('ads') || B.length >= 3;
    const pick = (!a.presupuesto || a.presupuesto === 'rec') ? (megaNeeds ? 'megaplus' : 'estandarplus') : (CAP[a.presupuesto] >= 1000000 ? 'megaplus' : 'estandarplus');
    const plus = pick === 'megaplus';

    const R = {
      conocer: `Querés que más gente conozca tu marca: contenido constante${plus ? ' y campañas en Meta Ads' : ' en redes, con estrategia'}.`,
      contenido: 'Pediste contenido con estrategia: calendario mensual y producción propia de Blin.',
      identidad: 'Querés una marca que se note: Blin la cuida en todo lo que publica.',
      ads: 'Querés publicidad: el Mega Plus incluye campañas en Meta Ads.',
      evento: 'Tenés un evento en mente: Blin lo cubre con fotos, video y dron.',
      whatsapp: 'Querés responder al instante: el asistente con IA atiende tu WhatsApp todo el día.',
      catalogo: `Querés una carta o catálogo online, con hasta ${LIMITS.productos} productos.`,
      gestion: 'Querés ordenar pedidos, ventas y stock en un solo sistema, con pronóstico de stock.',
      club: 'Querés que vuelvan: club de fidelización con juegos.',
      turnos: 'Querés turnos o reservas online, sin idas y vueltas por chat.',
      avisos: `Querés avisar lanzamientos y eventos: hasta ${LIMITS.avisos} avisos por WhatsApp por mes.`,
    };
    const why = metas.filter(m => plus || m !== 'ads').map(m => R[m]);
    if (plus && plat >= 2) why.push(plat === 2 ? 'Querés estar en dos redes: el Mega Plus gestiona dos.' : 'Querés estar en tres redes o más: el Mega Plus gestiona dos y la tercera se suma a medida.');
    if (['30', '80', 'mas'].includes(a.consultas)) why.push(`Recibís ${label('consultas', a.consultas).toLowerCase()} consultas por día: el asistente las responde todas, también fuera de horario.`);
    if (a.rubro === 'gastro') why.push('En gastronomía, la carta puede ir con platos en 3D.');
    if (['moda', 'calzado'].includes(a.rubro)) why.push('En moda, el club puede tener preventa de cada colección, con aviso por WhatsApp.');
    if (!why.length) why.push(plus ? 'Es el plan completo: más contenido, dos redes y campañas, con todo IMÁN.' : 'Es la forma de arrancar con una red bien llevada y todo IMÁN funcionando.');

    const notes = [];
    if (!plus && megaNeeds) notes.push('Lo que pediste de redes (dos redes o campañas en Meta Ads) está en el Mega Plus: es el paso siguiente cuando quieras crecer.');
    if (a.presupuesto === '500') notes.push('Queda arriba de lo que pensabas invertir: es el plan más chico que incluye todo IMÁN.');
    if (a.productos === 'mas') notes.push(`Tenés más de ${LIMITS.productos} productos: el excedente del catálogo se cotiza aparte.`);
    if (a.consultas === 'mas') notes.push(`Con más de 80 consultas por día vas a pasar las ${LIMITS.conversaciones.toLocaleString('es-AR')} conversaciones del mes: ampliamos el tope del asistente.`);
    if (B.includes('identidad')) notes.push('Si tu marca necesita identidad nueva, el diseño de marca se presupuesta aparte.');
    if (B.includes('evento')) notes.push('La cobertura y la organización de eventos se presupuestan aparte.');

    return { pick, why: why.slice(0, 6), notes, hits: new Set(metas) };
  }

  function includedList(o, hits) {
    const blinLis = blin[o.base].items.map(i => `<li class="${Object.entries(HIT_BLIN).some(([m, re]) => hits.has(m) && re.test(i)) ? 'hit b' : ''}">${esc(i)}</li>`).join('');
    const imanLis = imanItems.map(i => `<li class="${Object.entries(HIT_IMAN).some(([m, k]) => hits.has(m) && k === i.k) ? 'hit' : ''}">${esc(i.t)}</li>`).join('');
    return `<h5>De Blin · ${esc(blin[o.base].name)}</h5><ul>${blinLis}</ul><h5>De IMÁN</h5><ul>${imanLis}</ul>`;
  }

  function showResult(scroll) {
    const r = recommend(S.a);
    const chosen = byId[S.chosen] ? S.chosen : r.pick;
    const o = byId[chosen];
    const isSug = chosen === r.pick;
    const nameHTML = `${esc(o.name.replace(' Plus', ''))} <i>Plus</i>`;

    quiz.hidden = true;
    result.hidden = false;
    result.innerHTML = `
      <div class="res">
        <div class="res-main plus">
          <span class="kicker"><svg class="flag"><use href="#flag"/></svg>${isSug ? 'Tu resultado' : 'Elegiste'}</span>
          <p class="res-for">${isSug ? 'El plan que sugerimos para' : 'Tu plan para'} ${esc(S.contact.negocio || 'tu marca')}</p>
          <h3 class="res-name">${nameHTML}</h3>
          <p class="res-tag">Blin × IMÁN · ${esc(o.tag)}</p>
          <div class="res-price"><b>${money(o.price)}</b><small>por mes</small></div>
          ${!isSug ? `<p class="res-tag">Sugerido por el test: <b>${esc(byId[r.pick].name)}</b>. <button class="res-redo" type="button" data-choose="${r.pick}">Volver al sugerido</button></p>` : ''}
          <div class="res-cta">
            <button class="btn light" type="button" data-want>Quiero este plan <span class="arr">→</span></button>
            <a class="btn line" href="#otros">Comparar los dos</a>
          </div>
          <button class="res-redo" type="button" data-redo>↺ Rehacer el test</button>
        </div>
        <div class="res-side">
          <div class="res-why"><h4>Por qué este plan</h4><ul>${r.why.map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>
          <div class="res-inc"><h4>Qué incluye</h4>${includedList(o, r.hits)}</div>
          ${r.notes.length ? `<div class="res-notes">${r.notes.map(n => `<p>${esc(n)}</p>`).join('')}</div>` : ''}
          <div data-sent></div>
        </div>
      </div>
      <div class="res-others" id="otros">
        <div class="res-others-head"><h3>Los dos planes</h3><p>Los dos traen todo IMÁN; cambia cuánto hace Blin en tus redes.</p></div>
        <div class="plans two">${offers.map(x => planCard(x, {
          badge: x.id === r.pick ? 'Sugerido para vos' : '',
          action: x.id === chosen ? 'Elegido' : 'Elegir este',
        })).join('')}</div>
      </div>`;
    $$('.plan', result).forEach(el => {
      el.classList.toggle('is-sug', el.dataset.plan === r.pick);
      el.classList.toggle('is-chosen', el.dataset.plan === chosen);
    });
    $('[data-bar]').style.width = '100%';
    if (scroll) result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  result.addEventListener('click', e => {
    const c = e.target.closest('[data-choose]');
    if (c) {
      S.chosen = c.dataset.choose === recommend(S.a).pick ? null : c.dataset.choose;
      save(); showResult(false);
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (e.target.closest('[data-redo]')) {
      S = { step: 0, a: {}, contact: S.contact, done: false, chosen: null };
      save();
      result.hidden = true; quiz.hidden = false; render();
      quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (e.target.closest('[data-want]')) want();
  });

  /* ---------------- Envío ---------------- */
  function summary() {
    const a = S.a, c = S.contact, r = recommend(a);
    const chosen = byId[S.chosen] || byId[r.pick];
    return {
      plan: chosen.name, precio: chosen.price, sugerido: byId[r.pick].name,
      rubro: label('rubro', a.rubro), canales: (a.canales || []).map(k => label('canales', k)),
      metas: (a.metas || []).map(k => METAS[k].t),
      redes: label('estado', a.estado), plataformas: label('plataformas', a.plataformas),
      consultas: label('consultas', a.consultas), productos: label('productos', a.productos),
      presupuesto: label('presupuesto', a.presupuesto), cuando: label('cuando', a.cuando),
      ...c,
    };
  }

  function send(stage) {
    if (!CONFIG.formEndpoint) return;
    try {
      fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origen: 'blin-iman', etapa: stage, ...summary(), respuestas: S.a }), keepalive: true }).catch(() => {});
    } catch (e) {}
  }

  function want() {
    send('eleccion');
    const s = summary();
    const lines = [
      `Hola Blin! Soy ${s.nombre}, de ${s.negocio}.`,
      `Hice el test y quiero arrancar con el plan *${s.plan}* (${money(s.precio)} por mes).`,
      '',
      `Rubro: ${s.rubro}`,
      s.metas.length ? `Quiero: ${s.metas.join(', ')}` : '',
      s.canales.length ? `Vendo por: ${s.canales.join(', ')}` : '',
      `Redes hoy: ${s.redes} · Plataformas: ${s.plataformas}`,
      `Consultas por día: ${s.consultas} · Productos: ${s.productos}`,
      `Inversión: ${s.presupuesto} · Arranque: ${s.cuando}`,
      s.instagram ? `Instagram: ${s.instagram}` : '',
      s.email ? `Email: ${s.email}` : '',
    ].filter((l, i) => l || i === 2);
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
    const box = $('[data-sent]', result);
    if (box) box.innerHTML = `<p class="res-sent">Listo, ${esc(s.nombre)}. Te abrimos WhatsApp con tu plan para que se lo mandes a Blin. ¿No se abrió? <a href="${url}" target="_blank" rel="noopener">Tocá acá</a>.</p>`;
  }

  if (S.done) showResult(false); else render();
})();

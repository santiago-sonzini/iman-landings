// Cómo funciona: seis cuadrados que giran en horizontal, como un carrusel 3D. Gira solo, sin saltos (se frena en cada
// tarjeta y sigue), y se arrastra con el dedo: al soltar se acomoda en la más cercana.
// Mega Plus: un gráfico de anillo con las 10 cosas del plan; se dibuja al aparecer y va resaltando cada parte.
// Todo se mueve solo mientras se ve.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = (el, on) => new IntersectionObserver(([e]) => on(e.isIntersecting), { threshold: .25 }).observe(el);
  const WHO = { b: '<span class="chip-blin">Blin</span>', i: '<span class="chip-iman">IMÁN</span>' };

  /* ---------------- Carrusel ---------------- */
  document.querySelectorAll('[data-c3]').forEach(c3 => {
    const section = c3.closest('section');
    const ring = c3.querySelector('.c3-ring');
    const cards = [...c3.querySelectorAll('.c3-card')], n = cards.length, STEP = 360 / n;
    const dots = section.querySelector('[data-c3-dots]');
    dots.innerHTML = cards.map(() => '<i></i>').join('');
    const PERIOD = 4300, DWELL = .38;   // cada tarjeta: quieta el 38 % del tiempo, después gira suave hasta la próxima
    // Avance continuo: velocidad cero al llegar a cada tarjeta, máxima a mitad de camino.
    const glide = x => {
      const k = Math.floor(x), f = Math.max(0, (x - k - DWELL) / (1 - DWELL));
      return k + f - Math.sin(2 * Math.PI * f) / (2 * Math.PI);
    };
    let pos = 0, base = 0, t0 = performance.now(), mode = 'auto', snap = null, drag = null, visible = false, raf = 0, front = -1, dragged = 0;

    const render = () => {
      c3.style.setProperty('--turn', `${-pos * STEP}deg`);
      cards.forEach((card, i) => {
        let d = ((i - pos) % n + n) % n; if (d > n / 2) d -= n;
        card.style.opacity = String(Math.max(.28, 1 - Math.abs(d) * .62));
      });
      const f = ((Math.round(pos) % n) + n) % n;
      if (f !== front) {
        front = f;
        cards.forEach((card, i) => card.setAttribute('aria-hidden', String(i !== f)));
        [...dots.children].forEach((d, i) => d.classList.toggle('on', i === f));
      }
    };
    const frame = now => {
      if (mode === 'auto') pos = reduced ? base : base + glide(Math.max(0, now - t0) / PERIOD);
      else if (mode === 'snap') {
        const p = Math.min(1, (now - snap.t) / snap.d), e = 1 - Math.pow(1 - p, 3);
        pos = snap.from + (snap.to - snap.from) * e;
        if (p === 1) { mode = 'auto'; base = snap.to; t0 = now + 1600; }
      }
      render();
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    const run = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
    const snapTo = to => { snap = { from: pos, to, t: performance.now(), d: Math.min(900, 380 + Math.abs(to - pos) * 260) }; mode = 'snap'; run(); };
    const goTo = j => { let d = ((j - pos) % n + n) % n; if (d > n / 2) d -= n; snapTo(Math.round(pos + d)); };

    // Arrastre: el carrusel sigue al dedo; un ancho de tarjeta = una tarjeta.
    c3.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      // Un toque no frena el giro: solo pasa a arrastre cuando el dedo se mueve.
      drag = { x: e.clientX, pos, last: e.clientX, t: performance.now(), v: 0, moved: false, id: e.pointerId };
    });
    c3.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; drag.pos = pos + dx / (ring.offsetWidth || 300); mode = 'drag'; c3.classList.add('dragging'); try { c3.setPointerCapture(drag.id); } catch {} }
      if (!drag.moved) return;
      const now = performance.now(), w = ring.offsetWidth || 300;
      drag.v = (e.clientX - drag.last) / Math.max(1, now - drag.t) / w;   // tarjetas por ms
      drag.last = e.clientX; drag.t = now;
      pos = drag.pos - dx / w;
      render();
    });
    const release = e => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const moved = drag.moved, v = drag.v, start = Math.round(drag.pos);
      drag = null; c3.classList.remove('dragging');
      if (!moved) return;
      dragged = performance.now();
      let to = Math.round(pos - v * 220);
      to = Math.max(start - 2, Math.min(start + 2, to));
      snapTo(to);
    };
    c3.addEventListener('pointerup', release);
    c3.addEventListener('pointercancel', release);
    // Tocar una tarjeta de costado la trae al frente.
    cards.forEach((card, i) => card.addEventListener('click', () => { if (performance.now() - dragged > 250 && i !== front) goTo(i); }));

    // Al volver a verse arranca quieto en la tarjeta más cercana.
    seen(c3, v => { visible = v; if (v && mode === 'auto') { base = Math.round(pos); pos = base; t0 = performance.now() + 500; } if (v) run(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { t0 = performance.now() + 600; base = Math.round(pos); pos = base; run(); } });
    render();
  });

  /* ---------------- Gráfico de anillo ---------------- */
  document.querySelectorAll('[data-donut]').forEach(wrap => {
    const svg = wrap.querySelector('svg.donut'), NS = 'http://www.w3.org/2000/svg';
    const items = [...wrap.querySelectorAll('.donut-legend button')], n = items.length;
    const BLIN = ['#b3241c', '#c63a2f', '#d75a4c', '#e57c6e'];
    const IMAN = ['#82c7d6', '#98c4dc', '#a9b6ea', '#b9a3ee', '#d3b2dc', '#e6c5a6'];
    const R = 112, C = 2 * Math.PI * R, GAP = 2.4, SEG = 360 / n - GAP;
    const who = wrap.querySelector('[data-dc-who]'), title = wrap.querySelector('[data-dc-t]'), text = wrap.querySelector('[data-dc-p]');
    const center = wrap.querySelector('.donut-center');
    let bi = 0, ii = 0, active = -1, timer = 0, visible = false, drawn = false, holdUntil = 0;

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', 'rotate(-90 150 150)');
    svg.appendChild(g);
    const segs = items.map((item, i) => {
      const color = item.dataset.side === 'b' ? BLIN[bi++] : IMAN[ii++];
      item.querySelector('.sw').style.setProperty('--c', color);
      const seg = document.createElementNS(NS, 'circle');
      Object.entries({ class: 'seg', cx: 150, cy: 150, r: R, stroke: color, 'stroke-dasharray': `0 ${C}`, 'stroke-dashoffset': -((i * 360 / n + GAP / 2) / 360) * C }).forEach(([k, v]) => seg.setAttribute(k, v));
      g.appendChild(seg);
      const hit = seg.cloneNode(); hit.setAttribute('class', 'hit'); hit.setAttribute('stroke-dasharray', `${(SEG / 360) * C} ${C}`);
      hit.addEventListener('click', () => pick(i, true));
      g.appendChild(hit);
      // El ícono va sobre su porción, derecho.
      const mid = (i * 360 / n + 180 / n) * Math.PI / 180;
      const use = document.createElementNS(NS, 'use');
      use.setAttribute('href', `#i-${item.dataset.icon}`);
      Object.entries({ class: 'seg-ic', x: 150 + R * Math.sin(mid) - 10, y: 150 - R * Math.cos(mid) - 10, width: 20, height: 20, stroke: item.dataset.side === 'b' ? '#fff' : '#121212' }).forEach(([k, v]) => use.setAttribute(k, v));
      svg.appendChild(use);
      return seg;
    });

    function pick(i, byHand) {
      active = i;
      segs.forEach((s, j) => s.classList.toggle('on', j === i));
      items.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', String(j === i)); });
      svg.classList.add('has-on');
      const it = items[i];
      who.innerHTML = WHO[it.dataset.side] || '';
      title.textContent = it.dataset.t;
      text.textContent = it.dataset.d;
      center.classList.remove('swap'); void center.offsetWidth; center.classList.add('swap');
      if (byHand) holdUntil = Date.now() + 6000;
      schedule();
    }
    function schedule() {
      clearTimeout(timer);
      if (reduced || !visible) return;
      timer = setTimeout(() => (document.hidden || Date.now() < holdUntil) ? schedule() : pick((active + 1) % n), 2800);
    }
    function draw() {
      if (drawn) return;
      drawn = true;
      segs.forEach((s, i) => setTimeout(() => s.setAttribute('stroke-dasharray', `${(SEG / 360) * C} ${C}`), reduced ? 0 : 90 * i));
      setTimeout(() => { svg.classList.add('drawn'); if (active < 0) schedule(); }, reduced ? 0 : 90 * n + 500);
    }
    items.forEach((b, i) => b.addEventListener('click', () => pick(i, true)));
    seen(wrap, v => { visible = v; if (v) { draw(); if (active >= 0) schedule(); } else clearTimeout(timer); });
  });
})();

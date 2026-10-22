// Cómo funciona: seis cuadrados que giran en horizontal, como un carrusel 3D. Avanza solo; se puede deslizar o tocar.
// Mega Plus: un mosaico que se da vuelta en ola, una ficha por vez; al tocar una, se da vuelta esa.
// Las dos animaciones corren solo mientras se ven.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = (el, on) => new IntersectionObserver(([e]) => on(e.isIntersecting), { threshold: .3 }).observe(el);

  document.querySelectorAll('[data-c3]').forEach(c3 => {
    const section = c3.closest('section');
    const cards = [...c3.querySelectorAll('.c3-card')], n = cards.length, DUR = 3800;
    const dots = section.querySelector('[data-c3-dots]');
    dots.innerHTML = cards.map((_, i) => `<button type="button" aria-label="Paso ${i + 1}"></button>`).join('');
    let k = 0, timer = 0, visible = false;
    const schedule = () => {
      clearTimeout(timer);
      if (reduced || !visible) return;
      timer = setTimeout(() => document.hidden ? schedule() : show(k + 1), DUR);
    };
    // k crece siempre: el carrusel sigue girando para el mismo lado en vez de volver.
    function show(next) {
      k = next;
      const i = ((k % n) + n) % n;
      c3.style.setProperty('--turn', `${-k * 360 / n}deg`);
      cards.forEach((c, j) => { c.classList.toggle('on', j === i); c.setAttribute('aria-hidden', String(j !== i)); });
      [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i));
      schedule();
    }
    const go = j => { const i = ((k % n) + n) % n; let d = (j - i + n) % n; if (d > n / 2) d -= n; if (d) show(k + d); };
    cards.forEach((c, j) => c.addEventListener('click', () => go(j)));
    [...dots.children].forEach((d, j) => d.addEventListener('click', () => go(j)));
    section.querySelector('[data-c3-prev]').addEventListener('click', () => show(k - 1));
    section.querySelector('[data-c3-next]').addEventListener('click', () => show(k + 1));
    let x0 = null;
    c3.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    c3.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 35) show(k + (dx < 0 ? 1 : -1));
    });
    seen(c3, v => { visible = v; v ? schedule() : clearTimeout(timer); });
    show(0);
  });

  document.querySelectorAll('[data-flip]').forEach(grid => {
    const tiles = [...grid.querySelectorAll('.ft')], STEP = 2300;
    let i = -1, timer = 0, visible = false, holdUntil = 0;
    const schedule = (delay = STEP) => {
      clearTimeout(timer);
      if (reduced || !visible) return;
      timer = setTimeout(() => {
        if (document.hidden || Date.now() < holdUntil) return schedule(800);
        tiles.forEach(t => t.classList.remove('flip'));
        i = (i + 1) % tiles.length;
        tiles[i].classList.add('flip');
        schedule();
      }, delay);
    };
    tiles.forEach((t, j) => t.addEventListener('click', () => {
      const open = !t.classList.contains('flip');
      tiles.forEach(x => x.classList.remove('flip'));
      if (open) t.classList.add('flip');
      i = j; holdUntil = Date.now() + 5000;
    }));
    seen(grid, v => { visible = v; v ? schedule(600) : clearTimeout(timer); });
  });
})();

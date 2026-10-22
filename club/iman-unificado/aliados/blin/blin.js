// blin. × IMÁN — cabecera a la medida, barra fija, índice, objetos flotantes, sello y apariciones.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fecha de la edición, como en el diario.
  const today = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  $$('[data-today]').forEach(el => { el.textContent = today; });

  // La palabra de la cabecera ocupa todo el ancho, como el nombre de una revista.
  const fit = () => $$('[data-fit]').forEach(el => {
    const box = el.parentElement.getBoundingClientRect().width;
    el.style.fontSize = '100px';
    const w = (el.querySelector('[data-fit-measure]') || el.firstElementChild || el).getBoundingClientRect().width;
    if (w) el.style.fontSize = (100 * box / w).toFixed(2) + 'px';
  });
  fit();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
  let rz; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(fit); });

  // Barra fija cuando la cabecera sale de pantalla.
  const bar = $('.bar'), mast = $('.mast');
  if (bar && mast) new IntersectionObserver(([e]) => bar.classList.toggle('on', !e.isIntersecting), { rootMargin: '-40px 0px 0px 0px' }).observe(mast);

  // Índice a pantalla completa.
  const index = $('.index');
  const setIndex = open => {
    if (!index) return;
    index.classList.toggle('open', open);
    index.setAttribute('aria-hidden', String(!open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  $$('[data-index-open]').forEach(b => b.addEventListener('click', () => setIndex(true)));
  $$('[data-index-close], .index a').forEach(b => b.addEventListener('click', () => setIndex(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setIndex(false); });

  // Apariciones al hacer scroll.
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  // Objetos flotantes: siguen un poco al mouse.
  const floats = $$('.float[data-depth]');
  if (floats.length && !reduced && matchMedia('(pointer:fine)').matches) {
    let tx = 0, ty = 0, x = 0, y = 0;
    addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
    const tick = () => {
      x += (tx - x) * .06; y += (ty - y) * .06;
      floats.forEach(f => { const d = +f.dataset.depth; f.style.transform = `translate(${(x * d).toFixed(1)}px,${(y * d).toFixed(1)}px)`; });
      requestAnimationFrame(tick);
    };
    tick();
  }

  // El sello giratorio se esconde donde ya hay un llamado grande, y se puede cerrar.
  const seal = $('.seal');
  if (seal) {
    const vis = new Set();
    const sealObs = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting ? vis.add(e.target) : vis.delete(e.target));
      seal.classList.toggle('hide', vis.size > 0 || seal.dataset.closed === '1');
    }, { rootMargin: '-35% 0px -35% 0px' });
    $$('[data-hide-seal]').forEach(el => sealObs.observe(el));
    $('.seal-x', seal)?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); seal.dataset.closed = '1'; seal.classList.add('hide'); });
  }
})();

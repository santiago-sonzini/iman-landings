(() => {
  'use strict';
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  if (!reduceMotion.matches) root.classList.add('motion-enabled');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));

  // ── Services → demo stage. Without JS every "Más info" is a link to its service page.
  const stage = document.getElementById('demos');
  const tabs = [...document.querySelectorAll('[role="tab"][data-tab]')];
  const cards = [...document.querySelectorAll('.service-card')];
  let current = tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.dataset.tab || 'fidelizacion';

  function select(id, {focus = false, scroll = false} = {}) {
    const changed = id !== current;
    current = id;
    tabs.forEach(tab => {
      const on = tab.dataset.tab === id;
      tab.setAttribute('aria-selected', on);
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on && changed && !reduceMotion.matches) {
        panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering');
      }
    });
    cards.forEach(card => card.classList.toggle('is-current', card.dataset.service === id));
    if (scroll) stage.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start'});
    syncPlayers();
  }
  document.querySelectorAll('[data-open]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    select(link.dataset.open, {scroll: true});
    history.replaceState(null, '', '#demos');
  }));
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      const step = {ArrowRight: 1, ArrowLeft: -1}[event.key];
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        select(tabs[event.key === 'Home' ? 0 : tabs.length - 1].dataset.tab, {focus: true});
      } else if (step) {
        event.preventDefault();
        select(tabs[(i + step + tabs.length) % tabs.length].dataset.tab, {focus: true});
      }
    });
  });

  // ── Captures only animate while on screen.
  const visible = new Set();
  const watched = [...document.querySelectorAll('.hero-devices, .demo-visual')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    syncPlayers();
  }, {threshold: .2});
  watched.forEach(el => io.observe(el));

  // ── WhatsApp player. The markup already holds the whole conversation (readable without JS
  // and with reduced motion); the player collapses it and replays it message by message.
  const wa = document.getElementById('demo-whatsapp');
  const waVisual = wa.querySelector('.demo-visual');
  const messages = [...wa.querySelectorAll('.wa-msg')];
  const logItems = [...wa.querySelectorAll('[data-wa-log] li')];
  const thread = wa.querySelector('[data-wa-thread]');
  const scroller = wa.querySelector('.wa-thread');
  const typed = wa.querySelector('[data-wa-typed]');
  const composer = wa.querySelector('.wa-composer');
  const presence = wa.querySelector('.wa-presence');
  let run = 0, running = false;

  function reset() {
    messages.forEach(msg => {
      msg.classList.add('pending');
      msg.querySelectorAll('.ticks').forEach(t => t.className = 'ticks sent');
      msg.querySelectorAll('.pressed').forEach(b => b.classList.remove('pressed'));
    });
    logItems.forEach(li => li.classList.remove('done', 'flash'));
    thread.querySelectorAll('.typing-bubble').forEach(el => el.remove());
    typed.textContent = ''; composer.classList.remove('has-text');
    presence.textContent = 'en línea'; presence.classList.remove('typing');
  }
  function showAll() {
    wa.classList.remove('wa-live');
    messages.forEach(msg => { msg.classList.remove('pending'); msg.querySelectorAll('.ticks').forEach(t => t.className = 'ticks read'); });
    logItems.forEach(li => li.classList.add('done'));
    scroller.scrollTop = scroller.scrollHeight;
    thread.querySelectorAll('.typing-bubble').forEach(el => el.remove());
    typed.textContent = ''; composer.classList.remove('has-text');
    presence.textContent = 'en línea'; presence.classList.remove('typing');
  }
  // Follow the newest message the way the app does once the thread overflows.
  function follow() {
    scroller.scrollTo({top: scroller.scrollHeight, behavior: 'smooth'});
    setTimeout(() => scroller.scrollTo({top: scroller.scrollHeight, behavior: 'smooth'}), 420);
  }
  function markLog(indexes) {
    indexes.forEach((index, n) => setTimeout(() => {
      const li = logItems[index]; if (!li) return;
      li.classList.add('done', 'flash'); setTimeout(() => li.classList.remove('flash'), 900);
    }, n * 450));
  }
  async function play(token) {
    const alive = () => token === run;
    reset(); wa.classList.add('wa-live'); scroller.scrollTop = 0;
    await sleep(600);
    for (const msg of messages) {
      if (!alive()) return;
      await sleep(+msg.dataset.delay || 1000);
      if (!alive()) return;
      if (msg.classList.contains('out')) {
        const press = msg.dataset.press;
        if (press) {
          const button = [...wa.querySelectorAll('.wa-buttons span')].find(b => b.textContent === press);
          button?.classList.add('pressed'); await sleep(450);
        } else {
          composer.classList.add('has-text');
          for (const char of msg.dataset.type || '') { if (!alive()) return; typed.textContent += char; await sleep(38 + Math.random() * 45); }
          await sleep(350);
          typed.textContent = ''; composer.classList.remove('has-text');
        }
        msg.classList.remove('pending'); follow();
        const ticks = msg.querySelector('.ticks');
        setTimeout(() => alive() && ticks && (ticks.className = 'ticks'), 500);
        setTimeout(() => alive() && ticks && (ticks.className = 'ticks read'), 1100);
        if (msg === messages[0]) markLog([0]);
      } else {
        presence.textContent = 'escribiendo…'; presence.classList.add('typing');
        const bubble = document.createElement('li');
        bubble.className = 'wa-msg in typing-bubble';
        bubble.innerHTML = '<div class="bubble"><i></i><i></i><i></i></div>';
        msg.before(bubble); follow();
        await sleep(Math.max(900, (+msg.dataset.delay || 1000) * .7));
        if (!alive()) return;
        bubble.remove();
        presence.textContent = 'en línea'; presence.classList.remove('typing');
        msg.classList.remove('pending'); follow();
        if (msg.dataset.log) markLog(msg.dataset.log.split(',').map(Number).filter(i => !(i === 0 && logItems[0].classList.contains('done'))));
      }
    }
    await sleep(6000);
    if (alive()) play(token);
  }
  function syncWhatsApp() {
    const shouldRun = current === 'whatsapp' && visible.has(waVisual) && !reduceMotion.matches && !document.hidden;
    if (shouldRun && !running) { running = true; play(++run); }
    if (!shouldRun && running) { running = false; run++; if (current !== 'whatsapp' || reduceMotion.matches) showAll(); }
  }

  function syncPlayers() {
    watched.forEach(el => el.classList.toggle('is-playing', visible.has(el) && !reduceMotion.matches && !document.hidden && !el.closest('[hidden]')));
    syncWhatsApp();
    ambient.toggle(visible.has(watched[0]) && !reduceMotion.matches && !document.hidden);
  }
  document.addEventListener('visibilitychange', syncPlayers);
  reduceMotion.addEventListener('change', () => { root.classList.toggle('motion-enabled', !reduceMotion.matches); if (reduceMotion.matches) showAll(); syncPlayers(); });

  // ── Ambient ASCII field behind the hero (same magnet geometry as the previous home, quieter).
  const ambient = (() => {
    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return {toggle() {}};
    const glyphs = ['.', ':', '+', '*', '.', ':', '.', '+', '-', 'x'];
    const count = innerWidth <= 800 ? 1300 : 2600;
    const random = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    const bezier = (t, a, b, c, d) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
    const particles = Array.from({length: count}, (_, i) => ({seed: random(i + 1), lane: i % 16}));
    const palette = [[148, 164, 188], [191, 207, 232], [187, 91, 102], [244, 196, 48]].map(c => c.join(','));
    const pointer = {x: -1e4, y: -1e4};
    let width = 0, height = 0, clock = 0, last = 0, frame = 0, on = false;
    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      const mobile = width <= 800, scaleX = width * (mobile ? 1.6 : 1.1), scaleY = height * 1.2;
      ctx.font = (mobile ? 9 : 10) + 'px "Courier New",monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < count; i++) {
        const p = particles[i], arm = i % 12, side = arm % 2 ? 1 : -1, vertical = arm < 6 ? -1 : 1, band = Math.floor(arm % 6 / 2);
        const t = (p.seed + time * .00006 * (.65 + p.lane * .035)) % 1;
        let x = width * .5 + (side * bezier(t, .005, [.035, .12, .13][band], [.15, .27, .22][band], [.48, .53, .40][band]) + (p.lane - 7.5) * .0024) * scaleX;
        let y = height * .5 + (vertical * bezier(t, .08, [.39, .33, .235][band], [.52, .37, .29][band], [.37, .22, .15][band]) + (p.lane - 7.5) * .0024) * scaleY;
        const dx = x - pointer.x, dy = y - pointer.y, d = Math.hypot(dx, dy);
        if (d < 150 && d > 0) { const push = (1 - d / 150) ** 2 * 50; x += dx / d * push; y += dy / d * push; }
        const edge = Math.min(1, Math.max(0, (Math.hypot((x - width * .5) / (width * .3), (y - height * .5) / (height * .34)) - .45) / .9));
        const tint = i % 31 === 0 ? 3 : i % 17 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
        ctx.fillStyle = 'rgba(' + palette[tint] + ',' + ((.08 + edge * .42) * (.45 + p.seed * .55)).toFixed(3) + ')';
        ctx.fillText(glyphs[(i + Math.floor(time * .0008 + p.seed * 5)) % glyphs.length], x, y);
      }
    }
    function resize() {
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(clock);
    }
    function tick(time) {
      frame = requestAnimationFrame(tick);
      if (time - last < 40) return;
      clock += Math.min(time - last, 80) * .42; last = time; draw(clock);
    }
    addEventListener('resize', resize);
    document.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, {passive: true});
    resize();
    return {toggle(state) {
      if (state === on) return; on = state;
      if (on) { last = performance.now(); frame = requestAnimationFrame(tick); } else cancelAnimationFrame(frame);
    }};
  })();

  if (location.hash === '#demos') select(current);
  syncPlayers();
})();

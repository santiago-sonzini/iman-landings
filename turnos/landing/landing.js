/* ==========================================================================
   Landing Imán Turnos — demo animado + analytics + CRO mechanics
   Objetivo de conversión ÚNICO: inicio de alta (app.iman.ar/turnos/alta).
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AB = window.IT_AB || 'a';

  /* ---------- analytics -------------------------------------------------
     Todos los eventos van a dataLayer (GTM-ready) con la variante A/B.
     Sin GTM presente quedan en el array + console.debug en localhost.    */
  function ev(nombre, extra) {
    var p = { event: 'it_' + nombre, ab: AB, ts: Date.now() };
    if (extra) for (var k in extra) p[k] = extra[k];
    (window.dataLayer = window.dataLayer || []).push(p);
    if (location.hostname === 'localhost') console.debug('[ev]', p);
  }
  ev('view', { variante_titular: AB });

  // CTAs: click → evento + variante en la URL de alta (para atribución)
  document.querySelectorAll('[data-ev]').forEach(function (el) {
    el.addEventListener('click', function () {
      ev('cta', { cta: el.dataset.ev });
      try {
        if (el.href && el.href.indexOf('app.iman.ar') > -1) {
          var u = new URL(el.href); u.searchParams.set('ab', AB); el.href = u.toString();
        }
      } catch (e) { }
    });
  });

  // vista de secciones (una sola vez, 40% visible)
  if ('IntersectionObserver' in window) {
    var vistos = {};
    var ioSec = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var s = e.target.getAttribute('data-sec');
        if (e.isIntersecting && !vistos[s]) { vistos[s] = 1; ev('sec', { sec: s }); }
      });
    }, { threshold: .4 });
    document.querySelectorAll('[data-sec]').forEach(function (s) { ioSec.observe(s); });
  }

  // FAQ
  document.querySelectorAll('.lp-faq').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) ev('faq', { q: d.querySelector('summary').textContent.trim().slice(0, 40) });
    });
  });

  /* ---------- reveals ---------------------------------------------------- */
  var rvs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var ioRv = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ioRv.unobserve(e.target); } });
    }, { threshold: .18, rootMargin: '0px 0px -40px 0px' });
    rvs.forEach(function (el) { ioRv.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- CTA fija mobile (aparece al pasar el hero) ------------------ */
  var sticky = document.getElementById('lp-sticky');
  var heroCta = document.getElementById('hero-cta');
  if (sticky && heroCta && 'IntersectionObserver' in window) {
    var ioSticky = new IntersectionObserver(function (es) {
      sticky.classList.toggle('on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0);
    }, { threshold: 0 });
    ioSticky.observe(heroCta);
  }

  /* ---------- demo: el hueco que se llena --------------------------------
     Pasos: a reposo → b tap en CTA → c sube sheet → d resalta a Marta →
     e sale el WhatsApp → f el hueco se convierte en turno. Loop.
     Con prefers-reduced-motion: directo el estado final, sin loop.        */
  var demo = document.getElementById('demo');
  if (demo) {
    var tap = document.getElementById('demo-tap');
    // posiciones del dedito (relativas al teléfono)
    var POS = { b: { top: '58%', left: '70%' }, d: { top: '64%', left: '84%' } };
    var PASOS = [
      ['a', 1100], ['b', 800], ['c', 1500], ['d', 900], ['e', 2300], ['f', 2600]
    ];
    var timer = null, visible = false;

    function ponerPaso(p) {
      demo.setAttribute('data-paso', p);
      if (POS[p]) { tap.style.top = POS[p].top; tap.style.left = POS[p].left; }
      if (p === 'f') demo.setAttribute('data-lleno', ''); else demo.removeAttribute('data-lleno');
    }
    function loop(i) {
      if (!visible) return;
      var paso = PASOS[i % PASOS.length];
      ponerPaso(paso[0]);
      timer = setTimeout(function () { loop(i + 1); }, paso[1]);
    }
    if (reduce) {
      ponerPaso('f');   // estado final estático
    } else if ('IntersectionObserver' in window) {
      var ioDemo = new IntersectionObserver(function (es) {
        var ahora = es[0].isIntersecting;
        if (ahora && !visible) { visible = true; loop(0); }
        else if (!ahora && visible) { visible = false; clearTimeout(timer); }
      }, { threshold: .35 });
      ioDemo.observe(demo);
    } else {
      visible = true; loop(0);
    }
  }

  /* ---------- showcase: probar colores (workstream temas, en vivo) ------- */
  var bk = document.getElementById('lp-bk');
  var sws = document.getElementById('lp-swatches');
  if (bk && sws && window.UI && UI.Tema) {
    sws.addEventListener('click', function (e) {
      var b = e.target.closest('.lp-sw');
      if (!b) return;
      UI.Tema.aplicar(UI.Tema.derivar(b.dataset.c), bk);   // scoped al teléfono
      sws.querySelectorAll('.lp-sw').forEach(function (s) { s.classList.toggle('sel', s === b); });
      ev('theme_swatch', { color: b.dataset.c });
    });
  }

  /* ---------- countdown del incentivo ------------------------------------ */
  var cd = document.getElementById('lp-cd');
  if (cd && !reduce) {
    var fin = Date.now() + 30 * 60 * 1000;
    setInterval(function () {
      var r = fin - Date.now();
      if (r <= 0) { fin = Date.now() + 30 * 60 * 1000; r = 30 * 60 * 1000; }
      var m = Math.floor(r / 60000), s = Math.floor((r % 60000) / 1000);
      cd.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
  }
})();

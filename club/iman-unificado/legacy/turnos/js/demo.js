(() => {
  'use strict';
  const banner = document.querySelector('.demo-banner');
  const status = document.querySelector('#demo-mensaje');
  function measure() {
    if (banner) document.documentElement.style.setProperty('--demo-banner-height', `${Math.ceil(banner.getBoundingClientRect().height)}px`);
  }
  function show(message = 'En un sistema implementado, este paso prepara la comunicación con el cliente. En esta demo no abrimos contactos ni enviamos mensajes.') {
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
    measure();
  }
  window.ImanTurnosDemo = {show};
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    const sampleAction = url.origin === location.origin && url.hash === '#demo-mensaje';
    const whatsapp = url.hostname === 'wa.me' || url.hostname.endsWith('.whatsapp.com') || url.protocol === 'whatsapp:';
    const officialContact = url.hostname === 'wa.me' && url.pathname.replace(/\//g, '') === '5493535189997';
    if (sampleAction || (whatsapp && !officialContact)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      show();
    }
  }, true);
  measure();
  if ('ResizeObserver' in window && banner) new ResizeObserver(measure).observe(banner);
  else window.addEventListener('resize', measure);
})();

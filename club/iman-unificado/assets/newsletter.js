(() => {
  'use strict';
  const invite = document.querySelector('#iman-newsletter-invite');
  const dialog = document.querySelector('#iman-newsletter-dialog');
  const form = document.querySelector('#iman-newsletter-form');
  if (!invite || !dialog || !form || typeof dialog.showModal !== 'function') return;

  const storageKey = 'iman_newsletter_v1';
  const sessionKey = 'iman_newsletter_seen_v1';
  const fourteenDays = 14 * 86400000;
  const status = dialog.querySelector('.iman-newsletter-status');
  const error = dialog.querySelector('.iman-newsletter-error');
  const submit = form.querySelector('[type=submit]');
  const originalSubmitHTML = submit.innerHTML;
  let preference = {};
  let sessionSeen = false;
  let activeMilliseconds = 0;
  let lastTick = performance.now();
  let timer;
  let opener;
  let pending = false;
  let retryBlocked = false;
  let requestKey = '';
  let fingerprint = '';
  let started = false;
  let source = 'manual';

  try { preference = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_) { /* Storage is optional. */ }
  try { sessionSeen = sessionStorage.getItem(sessionKey) === '1'; } catch (_) { /* Current page still caps frequency. */ }

  function emit(name, reason) {
    // No entered values, email addresses, URL queries or subscriber identifiers go to analytics.
    window.dispatchEvent(new CustomEvent(`iman:newsletter_${name}`, {detail: {placement: source, reason}}));
  }
  function seen() {
    sessionSeen = true;
    try { sessionStorage.setItem(sessionKey, '1'); } catch (_) { /* Session memory is sufficient. */ }
  }
  function save(updates) {
    preference = {...preference, ...updates};
    try { localStorage.setItem(storageKey, JSON.stringify(preference)); } catch (_) { /* Local state still applies. */ }
  }
  function suppress(reason) {
    seen();
    invite.hidden = true;
    save(reason === 'subscribed' ? {subscribed: true} : {dismissedAt: Date.now()});
    clearInterval(timer);
  }
  function dismiss(reason) {
    const wasDialog = dialog.open;
    if (wasDialog) dialog.close();
    suppress('dismissed');
    emit('dismiss', reason);
    if (wasDialog && opener?.isConnected) opener.focus();
  }
  function open(trigger) {
    if (dialog.open) return;
    source = trigger.closest('#iman-newsletter-invite') ? 'invitation' : 'manual';
    opener = trigger;
    invite.hidden = true;
    seen();
    clearInterval(timer);
    dialog.showModal();
    emit('open', source);
  }
  function isExcluded() {
    return /\/(?:contacto|contact|calendario|calendar|privacidad|informacion|compras-demo|demo)(?:\/|$)/i.test(location.pathname)
      || /contacto|calendario|calendar/i.test(location.hash);
  }
  function isBusy() {
    if (document.querySelector('dialog[open],.iman-consent:not([hidden])')) return true;
    if (document.activeElement?.matches('input,textarea,select,[contenteditable=true]')) return true;
    const contact = document.querySelector('#contacto');
    if (contact) {
      const rect = contact.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) return true;
    }
    return false;
  }
  function scrollProgress() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    return distance > 0 ? scrollY / distance : 0;
  }
  function eligible() {
    return !sessionSeen && !preference.subscribed
      && !(preference.dismissedAt && Date.now() - preference.dismissedAt < fourteenDays)
      && !isExcluded();
  }
  function tick() {
    const now = performance.now();
    const elapsed = Math.min(now - lastTick, 1500);
    lastTick = now;
    if (document.hidden) return;
    activeMilliseconds += elapsed;
    if (activeMilliseconds < 45000 || scrollProgress() < .45 || !eligible() || isBusy()) return;
    source = 'automatic';
    invite.hidden = false;
    seen();
    clearInterval(timer);
    emit('view', 'engaged');
  }

  document.addEventListener('click', event => {
    const openButton = event.target.closest('[data-newsletter-open]');
    if (openButton) { event.preventDefault(); open(openButton); return; }
    if (event.target.closest('[data-newsletter-dismiss]')) dismiss('button');
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss('escape'); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dismiss('outside');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !invite.hidden && !dialog.open) dismiss('escape');
  });
  window.addEventListener('iman:generate_lead', () => suppress('lead'));
  window.addEventListener('storage', event => {
    if (event.key !== storageKey) return;
    try { preference = JSON.parse(event.newValue || '{}') || {}; } catch (_) { return; }
    if (!eligible()) invite.hidden = true;
  });
  document.addEventListener('visibilitychange', () => { lastTick = performance.now(); });
  document.addEventListener('focusin', event => {
    if (event.target.closest('#contacto,.contact-form')) invite.hidden = true;
  });
  window.addEventListener('hashchange', () => { if (isExcluded()) invite.hidden = true; });

  form.addEventListener('input', () => {
    if (retryBlocked) return;
    if (!started) { started = true; emit('form_start', 'input'); }
    error.hidden = true;
  });
  form.addEventListener('invalid', () => emit('error', 'validation'), true);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || retryBlocked || !form.reportValidity()) return;
    const values = new FormData(form);
    const payload = {
      nombre: String(values.get('nombre') || '').trim(),
      email: String(values.get('email') || '').trim(),
      rubro: String(values.get('rubro') || '').trim(),
      consentimiento: values.get('consentimiento') === 'on',
      sitio_web_empresa: String(values.get('sitio_web_empresa') || ''),
      origen: location.pathname
    };
    if (!payload.nombre) {
      error.textContent = 'Completá tu nombre para que sepamos cómo llamarte.';
      error.hidden = false;
      form.querySelector('[name=nombre]').focus();
      return;
    }
    const nextFingerprint = JSON.stringify(payload);
    if (!requestKey || fingerprint !== nextFingerprint) {
      requestKey = crypto.randomUUID ? crypto.randomUUID() : `nl-${Date.now()}-${Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('')}`;
      fingerprint = nextFingerprint;
    }
    pending = true;
    error.hidden = true;
    status.textContent = 'Estamos preparando tu confirmación…';
    const editableControls = [...form.elements].filter(control => !control.disabled);
    editableControls.forEach(control => { control.disabled = true; });
    submit.textContent = 'Enviando…';
    form.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST', headers: {'Content-Type': 'application/json', 'Idempotency-Key': requestKey},
        body: JSON.stringify(payload), signal: controller.signal, credentials: 'same-origin'
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        const failure = new Error('newsletter');
        failure.status = response.status;
        failure.retryable = result?.retryable;
        throw failure;
      }
      form.hidden = true;
      status.textContent = 'Si este email todavía no estaba suscripto, te enviamos un enlace para confirmar. Revisá tu bandeja de entrada.';
      suppress('subscribed');
      // This is a requested confirmation, not a confirmed subscriber or a sales lead.
      emit('confirmation_requested', 'accepted');
    } catch (failure) {
      status.textContent = '';
      retryBlocked = failure.retryable === false;
      const rateLimited = failure.status === 429;
      const validation = failure.status === 400 || failure.status === 422;
      error.textContent = retryBlocked
        ? 'No pudimos confirmar el envío del enlace. Para evitar duplicados, no reenviaremos esta solicitud. Revisá tu bandeja de entrada y la carpeta de spam.'
        : rateLimited
        ? 'Ya recibimos varios intentos. Esperá unos minutos y volvé a probar.'
        : validation ? 'Revisá tu email y la autorización para recibir ideas.'
        : failure.name === 'AbortError' ? 'La confirmación está tardando. Podés volver a intentar con estos mismos datos.'
        : 'No pudimos completar la suscripción. Tus datos siguen acá para que puedas volver a intentar.';
      error.hidden = false;
      emit('error', retryBlocked ? 'delivery_uncertain' : rateLimited ? 'rate_limit' : validation ? 'validation' : failure.name === 'AbortError' ? 'timeout' : 'delivery');
    } finally {
      clearTimeout(timeout);
      pending = false;
      editableControls.forEach(control => { control.disabled = false; });
      submit.disabled = retryBlocked;
      if (retryBlocked) submit.textContent = 'Revisá tu email';
      else submit.innerHTML = originalSubmitHTML;
      form.removeAttribute('aria-busy');
    }
  });
  if (eligible()) timer = setInterval(tick, 1000);
})();

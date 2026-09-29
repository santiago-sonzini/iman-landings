const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('open', expanded);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation?.classList.contains('open')) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  }
});
navigation?.addEventListener('click', event => {
  if (event.target.closest('a')) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

(() => {
  'use strict';
  const consentKey = 'iman_measurement_consent_v1';
  const production = ['iman.ar', 'www.iman.ar'].includes(location.hostname);
  const pixelId = '1347555500811145';
  const adsId = 'AW-18305633425';
  const conversionId = `${adsId}/Y1nDCI2hrcwcEJGZ55hE`;
  const approvedEvents = new Set(['cta_click', 'form_start', 'form_error', 'generate_lead', 'whatsapp_click', 'calendar_open']);
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const permittedQueryKeys = new Set([...campaignKeys, 'gclid', 'dclid', 'gbraid', 'wbraid', 'fbclid']);
  const query = new URLSearchParams(location.search);
  // Pixels receive browser context. Skip loading on URLs containing unrelated or potentially personal data.
  const safeTrackingURL = [...query].every(([key, value]) => permittedQueryKeys.has(key) && /^[\w .~:+-]{0,200}$/.test(value));
  let consent = null;
  let trackersLoaded = false;
  const confirmedLeads = new Set();
  let consentPanel;
  let consentReturnFocus;

  try {
    const saved = JSON.parse(localStorage.getItem(consentKey) || 'null');
    if (saved && ['accepted', 'rejected'].includes(saved.choice) && Date.now() - saved.at < 180 * 86400000) consent = saved.choice;
  } catch (_) { /* Storage is optional; the form still works without it. */ }

  function googleConsent(granted) {
    return {ad_storage: granted ? 'granted' : 'denied', analytics_storage: granted ? 'granted' : 'denied', ad_user_data: 'denied', ad_personalization: 'denied'};
  }

  function loadTrackers() {
    if (trackersLoaded || consent !== 'accepted' || !production || !safeTrackingURL) return;
    trackersLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', googleConsent(false));
    window.gtag('consent', 'update', googleConsent(true));
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('set', {page_location: location.origin + location.pathname, page_referrer: document.referrer ? new URL(document.referrer).origin : '', allow_google_signals: false, allow_ad_personalization_signals: false});
    window.gtag('js', new Date());
    window.gtag('config', adsId, {send_page_view: false, allow_enhanced_conversions: false});
    const googleScript = document.createElement('script');
    googleScript.async = true;
    googleScript.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
    googleScript.dataset.imanTracker = 'google';
    document.head.append(googleScript);

    if (!window.fbq) {
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      window.fbq = fbq;
      window._fbq = window._fbq || fbq;
    }
    window.fbq('consent', 'grant');
    window.fbq('set', 'autoConfig', false, pixelId);
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    const metaScript = document.createElement('script');
    metaScript.async = true;
    metaScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
    metaScript.dataset.imanTracker = 'meta';
    document.head.append(metaScript);
  }

  function track(name, properties = {}) {
    if (!approvedEvents.has(name)) return;
    const detail = {path: location.pathname};
    // Only fixed UI metadata is allowed. Never pass FormData, URLs or entered values here.
    for (const key of ['placement', 'destination', 'reason']) {
      if (typeof properties[key] === 'string' && /^[a-z0-9_-]{1,60}$/.test(properties[key])) detail[key] = properties[key];
    }
    window.dispatchEvent(new CustomEvent(`iman:${name}`, {detail}));
    if (consent !== 'accepted' || !production || !safeTrackingURL || !trackersLoaded) return;
    if (name === 'generate_lead') {
      const requestId = properties.requestId;
      if (!requestId || confirmedLeads.has(requestId)) return;
      confirmedLeads.add(requestId);
      window.gtag?.('event', 'conversion', {send_to: conversionId, transaction_id: requestId});
      window.fbq?.('track', 'Lead', {content_name: 'Consulta IMAN'}, {eventID: requestId});
    } else {
      window.gtag?.('event', name, {...detail, send_to: adsId});
      window.fbq?.('trackCustom', name, detail);
    }
  }

  function clearMeasurementCookies() {
    for (const item of document.cookie.split(';')) {
      const name = item.split('=')[0].trim();
      if (!/^(_fbp|_fbc|_gcl_[a-z0-9_]+)$/.test(name)) continue;
      for (const domain of ['', location.hostname, '.iman.ar']) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
      }
    }
  }

  function chooseConsent(choice) {
    consent = choice;
    try { localStorage.setItem(consentKey, JSON.stringify({choice, at: Date.now()})); } catch (_) { /* Session-only preference. */ }
    consentPanel.hidden = true;
    if (consentReturnFocus?.isConnected) consentReturnFocus.focus();
    if (choice === 'accepted') loadTrackers();
    else if (trackersLoaded) {
      window.gtag?.('consent', 'update', googleConsent(false));
      window.fbq?.('consent', 'revoke');
      clearMeasurementCookies();
      // Reload removes third-party code and its automatic listeners after withdrawal.
      location.reload();
    }
  }

  function showConsent(focus = false) {
    if (!consentPanel) {
      const style = document.createElement('style');
      style.textContent = '.iman-consent{position:fixed;left:16px;bottom:16px;z-index:1000;width:min(440px,calc(100vw - 32px));padding:22px;background:#fff;color:#202024;border:1px solid #dcd8e8;border-radius:18px;box-shadow:0 12px 50px #25104926;font:500 14px/1.5 system-ui,sans-serif}.iman-consent[hidden]{display:none}.iman-consent p{margin:0 0 14px}.iman-consent strong{display:block;font-size:17px;margin-bottom:6px}.iman-consent a{color:#6740ca;text-decoration:underline}.iman-consent-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.iman-consent button{font:600 13px/1.3 system-ui,sans-serif;min-height:44px;padding:11px 12px;border:1px solid #704ed0;background:#fff;color:#5635ac;border-radius:9px;cursor:pointer}.iman-consent button:hover{background:#f3effc}.iman-consent button:focus-visible{outline:3px solid #9c83df;outline-offset:3px}@media(max-width:480px){.iman-consent{bottom:12px;left:12px;width:calc(100vw - 24px);padding:17px}.iman-consent-actions{grid-template-columns:1fr 1fr}}';
      document.head.append(style);
      consentPanel = document.createElement('aside');
      consentPanel.className = 'iman-consent';
      consentPanel.setAttribute('role', 'region');
      consentPanel.setAttribute('aria-label', 'Preferencias de medición');
      consentPanel.innerHTML = '<p><strong>Vos elegís cómo medimos.</strong>Con tu permiso usamos Google y Meta para medir visitas y consultas de nuestras campañas. No les enviamos lo que escribís en el formulario. Podés cambiar tu elección en <a href="/privacidad/">Privacidad</a>.</p><div class="iman-consent-actions"><button type="button" data-consent-choice="accepted">Aceptar medición</button><button type="button" data-consent-choice="rejected">Seguir sin medición</button></div>';
      consentPanel.addEventListener('click', event => {
        const button = event.target.closest('[data-consent-choice]');
        if (button) chooseConsent(button.dataset.consentChoice);
      });
      document.body.append(consentPanel);
    }
    consentPanel.hidden = false;
    if (focus) consentPanel.querySelector('button').focus();
  }
  document.querySelectorAll('[data-privacy-settings]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    consentReturnFocus = button;
    showConsent(true);
  }));
  if (!consent) showConsent();
  else if (consent === 'accepted') loadTrackers();

  const tabs = [...document.querySelectorAll('[data-contact-tab]')];
  const panels = [...document.querySelectorAll('[data-contact-panel]')];
  function selectContactTab(value, focused = false) {
    tabs.forEach(tab => {
      const active = tab.dataset.contactTab === value;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('active', active);
      if (active && focused) tab.focus();
    });
    panels.forEach(panel => {
      const active = panel.dataset.contactPanel === value;
      panel.hidden = !active;
      if (active && value === 'calendar') {
        const iframe = panel.querySelector('iframe[data-calendly-src]');
        if (iframe && !iframe.getAttribute('src')) {
          try {
            const url = new URL(iframe.dataset.calendlySrc);
            if (url.protocol === 'https:' && url.hostname === 'calendly.com') iframe.src = url.href;
          } catch (_) { /* The permanent direct booking link remains available. */ }
        }
      }
    });
  }
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    if (!tab.id) tab.id = `contact-tab-${tab.dataset.contactTab}`;
    const panel = panels.find(item => item.dataset.contactPanel === tab.dataset.contactTab);
    if (panel) {
      if (!panel.id) panel.id = `contact-panel-${tab.dataset.contactTab}`;
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
    }
    tab.addEventListener('click', () => {
      selectContactTab(tab.dataset.contactTab);
      if (tab.dataset.contactTab === 'calendar') track('calendar_open', {destination: 'embed', placement: 'contact'});
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      tabs[next].click();
    });
  });
  if (tabs.length) {
    tabs[0].parentElement.setAttribute('role', 'tablist');
    tabs[0].parentElement.setAttribute('aria-label', 'Cómo querés contactarnos');
    selectContactTab('form');
  }

  function requestId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  document.querySelectorAll('.contact-form').forEach(form => {
    const submit = form.querySelector('.form-submit') || form.querySelector('[type="submit"]');
    const status = form.querySelector('.form-status') || form.closest('#contacto')?.querySelector('.form-status');
    const error = form.querySelector('.form-error') || form.closest('#contacto')?.querySelector('.form-error');
    const originalButton = submit?.textContent || 'Enviar consulta';
    let pending = false;
    let started = false;
    let sent = false;
    let retryBlocked = false;
    let id;
    let fingerprint;
    if (status) { status.setAttribute('role', 'status'); status.setAttribute('tabindex', '-1'); }
    if (error) { error.setAttribute('role', 'alert'); error.setAttribute('tabindex', '-1'); }

    function message(node, value) {
      if (!node) return;
      node.textContent = value;
      node.hidden = !value;
    }
    form.addEventListener('focusin', event => {
      if (!started && event.target.matches('input:not([name="sitio_web_empresa"]),select,textarea')) {
        started = true;
        track('form_start', {placement: 'contact'});
      }
    });
    form.addEventListener('input', () => {
      if (pending || retryBlocked) return;
      message(error, '');
      if (sent) {
        sent = false;
        id = null;
        fingerprint = null;
        if (submit) { submit.disabled = false; submit.textContent = originalButton; }
        message(status, '');
      }
    });
    form.addEventListener('invalid', () => track('form_error', {reason: 'validation', placement: 'contact'}), true);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending || sent || retryBlocked || !form.reportValidity()) return;
      const data = new FormData(form);
      const payload = {};
      for (const name of ['nombre', 'negocio', 'email', 'whatsapp', 'servicio', 'comentario', 'sitio_web_empresa']) payload[name] = String(data.get(name) || '').trim();
      payload.consentimiento = data.has('consentimiento');
      payload.source = location.pathname;
      for (const key of campaignKeys) {
        const value = query.get(key);
        if (value && /^[\w .~-]{1,120}$/.test(value)) payload[key] = value;
      }
      const nextFingerprint = JSON.stringify(payload);
      if (!id || fingerprint !== nextFingerprint) { id = requestId(); fingerprint = nextFingerprint; }
      const currentId = id;
      payload.requestId = currentId;
      pending = true;
      form.setAttribute('aria-busy', 'true');
      message(error, '');
      message(status, 'Enviando tu consulta…');
      const locked = [...form.elements].filter(element => !element.disabled);
      locked.forEach(element => { element.disabled = true; });
      if (submit) submit.textContent = 'Enviando…';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch('/api/contacto', {
          method: 'POST', headers: {'Content-Type': 'application/json', 'Idempotency-Key': currentId},
          body: JSON.stringify(payload), credentials: 'same-origin', signal: controller.signal
        });
        let result;
        try { result = await response.json(); } catch (_) { throw new Error('invalid_response'); }
        if (!response.ok || result?.ok !== true) {
          const failure = new Error(result?.code || 'delivery_failed');
          failure.status = response.status;
          failure.retryable = result?.retryable;
          throw failure;
        }
        sent = true;
        message(status, result.confirmationSent
          ? 'Recibimos tu consulta y te enviamos una confirmación por email. También podés agendar una llamada desde esta sección.'
          : 'Tu consulta ya llegó al equipo. No pudimos enviarte la confirmación automática; no hace falta volver a enviarla. También podés agendar una llamada.');
        track('generate_lead', {placement: 'contact', requestId: currentId});
        status?.focus({preventScroll: true});
      } catch (failure) {
        message(status, '');
        retryBlocked = failure.retryable === false;
        const rateLimited = failure.status === 429;
        const validation = failure.status === 400 || failure.status === 422;
        message(error, retryBlocked
          ? 'No pudimos confirmar el estado del envío. Para evitar duplicados, no reenviaremos esta consulta desde el formulario. Podés agendar una llamada o escribirnos por WhatsApp para verificarla.'
          : rateLimited
          ? 'Recibimos varios intentos seguidos. Esperá un momento y volvé a intentar, o elegí agendar una llamada.'
          : validation ? 'Revisá los datos y la autorización de contacto antes de volver a enviar.'
          : 'No pudimos confirmar el envío. Conservamos lo que escribiste para que puedas reintentar. También podés agendar una llamada o escribirnos por WhatsApp.');
        track('form_error', {reason: retryBlocked ? 'delivery_uncertain' : rateLimited ? 'rate_limit' : validation ? 'validation' : failure.name === 'AbortError' ? 'timeout' : 'delivery', placement: 'contact'});
        error?.focus({preventScroll: true});
      } finally {
        clearTimeout(timeout);
        pending = false;
        form.removeAttribute('aria-busy');
        locked.forEach(element => { element.disabled = false; });
        if (submit) { submit.disabled = sent || retryBlocked; submit.textContent = sent ? 'Consulta enviada' : retryBlocked ? 'Usá otra vía de contacto' : originalButton; }
      }
    });
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    let destination;
    try { destination = new URL(link.href, location.href); } catch (_) { return; }
    const placement = link.closest('#contacto') ? 'contact' : link.closest('.hero,.subhero') ? 'hero' : link.closest('.header') ? 'header' : link.closest('.mobile-cta') ? 'mobile_sticky' : 'body';
    if (destination.hostname === 'wa.me' || destination.hostname.endsWith('.whatsapp.com')) track('whatsapp_click', {placement, destination: 'whatsapp'});
    else if (destination.hostname === 'calendly.com') track('calendar_open', {placement, destination: 'external'});
    else if (link.matches('.button,.text-link,.btn,.btn-primario') || link.closest('.mobile-cta')) track('cta_click', {placement, destination: destination.hash === '#contacto' ? 'contact' : 'page'});
    if (destination.origin === location.origin && destination.pathname === location.pathname && destination.hash === '#contacto' && !link.hasAttribute('data-contact-tab')) selectContactTab('form');
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches && !document.body.classList.contains('cinematic-home')) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (entry.target.animate) entry.target.animate([{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 500, easing: 'cubic-bezier(.2,.65,.3,1)'});
      entry.target.classList.add('is-visible');
    }), {threshold: 0.08});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
  const mobileCTA = document.querySelector('.mobile-cta');
  const hero = document.querySelector('.hero,.subhero');
  const contact = document.querySelector('#contacto');
  if (mobileCTA) {
    const mobile = window.matchMedia('(max-width: 760px)');
    let heroVisible = true;
    let contactVisible = false;
    function updateMobileCTA() {
      const visible = mobile.matches && !heroVisible && !contactVisible;
      mobileCTA.hidden = !visible;
      mobileCTA.classList.toggle('visible', visible);
      mobileCTA.setAttribute('aria-hidden', String(!visible));
    }
    mobileCTA.hidden = true;
    if ('IntersectionObserver' in window && hero && contact) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.target === hero) heroVisible = entry.isIntersecting;
          if (entry.target === contact) contactVisible = entry.isIntersecting;
        });
        updateMobileCTA();
      }, {threshold: 0});
      observer.observe(hero);
      observer.observe(contact);
      mobile.addEventListener?.('change', updateMobileCTA);
    }
  }
})();

const budgetInput = document.querySelector('#presupuesto');
const deliveryInput = document.querySelector('#plazo');
if (budgetInput && deliveryInput) {
  const compare = () => {
    const budget = budgetInput.valueAsNumber;
    const days = Number(deliveryInput.value);
    const offers = [...document.querySelectorAll('.demo-offer')];
    const eligible = offers.filter(offer => Number(offer.dataset.price) <= budget && Number(offer.dataset.days) <= days);
    eligible.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    offers.forEach(offer => {
      const reasons = [];
      if (!Number.isFinite(budget) || Number(offer.dataset.price) > budget) reasons.push('Fuera de presupuesto');
      if (Number(offer.dataset.days) > days) reasons.push('Supera el plazo');
      offer.querySelector('.offer-status').textContent = reasons.length ? reasons.join(' · ') : 'Cumple tus condiciones';
      offer.classList.toggle('recommended', eligible[0] === offer);
    });
    document.querySelector('#resultado').textContent = eligible.length ? `${eligible[0].dataset.name} cumple las condiciones.` : 'Ninguna propuesta cumple las condiciones.';
    document.querySelector('#motivo').textContent = eligible.length ? 'Es la opción de menor total que cumple el presupuesto y el plazo.' : 'El proceso se detiene para revisión. No se excede el presupuesto ni se aprueba una compra automáticamente.';
  };
  budgetInput.addEventListener('input', compare);
  deliveryInput.addEventListener('change', compare);
  compare();
}

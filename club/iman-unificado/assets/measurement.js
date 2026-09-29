(() => {
  'use strict';
  const consentKey = 'iman_measurement_consent_v1';
  const production = ['iman.ar', 'www.iman.ar'].includes(location.hostname);
  const pixelId = '1347555500811145';
  const adsId = 'AW-18305633425';
  const conversionId = `${adsId}/Y1nDCI2hrcwcEJGZ55hE`;
  const approvedEvents = new Set(['cta_click', 'form_start', 'form_error', 'generate_lead', 'whatsapp_click', 'calendar_open']);
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const permittedQueryKeys = new Set([...campaignKeys, 'gclid', 'dclid', 'gbraid', 'wbraid', 'fbclid', 'intereses']);
  const query = new URLSearchParams(location.search);
  // Pixels receive browser context. Skip loading on URLs containing unrelated or potentially personal data.
  const safeTrackingURL = [...query].every(([key, value]) => permittedQueryKeys.has(key) && (key === 'intereses' ? value === '' || value.split(',').every(id => ['fidelizacion','catalogos','automatizaciones','agentes'].includes(id)) : /^[\w .~:+-]{0,200}$/.test(value)));
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
  if (!consent && production) showConsent();
  else if (consent === 'accepted') loadTrackers();

  window.imanTrack = track;
})();

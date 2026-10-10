/* Shared identity enhancement; page interactions keep their existing handlers. */
(() => {
  'use strict';
  if (window.__imanIdentityV1Ready) return;
  window.__imanIdentityV1Ready = true;

  const init = () => {
    const logoPath = '/assets/identity-variants/logo-v1.png';
    const brandText = element => element.textContent.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === 'iman';
    const logo = () => {
      const image = document.createElement('img');
      image.src = logoPath;
      image.alt = 'IMÁN';
      image.width = 1751;
      image.height = 710;
      image.className = 'brand-logo';
      image.decoding = 'async';
      return image;
    };

    // A fallback for older generated shells. Existing images and Gauss stay intact.
    document.querySelectorAll('.site-header .identity, .reading-footer > a:first-child').forEach(link => {
      if (!link.querySelector('img') && brandText(link)) link.replaceChildren(logo());
    });
    document.querySelectorAll('.g-by b').forEach(mark => {
      if (!mark.querySelector('img') && brandText(mark)) mark.replaceChildren(logo());
    });

    document.querySelectorAll('.cta').forEach(control => {
      let label = control.querySelector(':scope > .cta-label');
      let sweep = control.querySelector(':scope > .cta-sweep');
      if (!label) {
        label = document.createElement('span');
        label.className = 'cta-label';
        [...control.childNodes].filter(node => node !== sweep).forEach(node => label.append(node));
        control.prepend(label);
      }
      if (!sweep) {
        sweep = document.createElement('span');
        sweep.className = 'cta-sweep';
        control.append(sweep);
      }
      sweep.setAttribute('aria-hidden', 'true');

      const sync = () => {
        const copy = label.cloneNode(true);
        copy.removeAttribute('id');
        copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        copy.querySelectorAll('a,button,input,select,textarea,[tabindex]').forEach(node => node.setAttribute('tabindex', '-1'));
        sweep.replaceChildren(copy);
      };
      sync();
      // form.js changes this original node to “Enviando…” and back. Only its
      // visual copy is observed/synchronized; no form or demo events are bound.
      new MutationObserver(sync).observe(label, { childList: true, subtree: true, characterData: true });
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

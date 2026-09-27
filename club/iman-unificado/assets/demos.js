(() => {
  'use strict';
  const section = document.querySelector('#demos');
  if (!section) return;
  const tabs = [...section.querySelectorAll('[data-demo]')];
  const panel = section.querySelector('#iman-demo-panel');
  const frame = section.querySelector('#iman-demo-frame');
  const petPreview = section.querySelector('[data-demo-pet-preview]');
  const staticPreview = section.querySelector('[data-demo-static-preview]');
  const displayType = section.querySelector('[data-demo-display-type]');
  const fallbackCopy = section.querySelector('[data-demo-fallback-copy]');
  const status = section.querySelector('.iman-demo-load-status');
  if (!tabs.length || !panel || !frame) return;
  const demos = {
    dietetica: {name: 'Dietética', url: 'https://dietetica.iman.ar/', category: 'CATÁLOGO · CLUB · PEDIDOS', title: ['Una dietética.', 'Muchas formas de volver.'], description: 'Recorré el catálogo, explorá el Club y descubrí el recorrido para armar un pedido. Una experiencia con identidad propia, desde el teléfono.', frameTitle: 'Demo navegable de una dietética: catálogo, Club y pedidos'},
    pet: {name: 'PetOutlet', url: 'https://template-eccomerce.vercel.app/demo/petoutlet-ar', category: 'PET SHOP · TIENDA DIGITAL', title: ['Su próxima compra.', 'Tu pet shop a mano.'], description: 'Explorá una tienda de productos para mascotas. Mirá cómo se presenta un catálogo pensado para encontrar lo que necesita cada cliente.', frameTitle: 'Demo navegable PetOutlet: tienda de productos para mascotas'},
    alimentos: {name: 'Fideera del Salado', url: 'https://template-eccomerce.vercel.app/demo/fds', category: 'ALIMENTOS · CATÁLOGO COMERCIAL', title: ['Tu producto,', 'bien presentado.'], description: 'Recorré Fideera del Salado y explorá una experiencia de catálogo aplicada a la industria alimenticia, con los productos como protagonistas.', frameTitle: 'Demo navegable Fideera del Salado: catálogo de productos alimenticios'},
    insumos: {name: 'Mazzarella', url: 'https://template-eccomerce.vercel.app/demo/mazzarella', category: 'INSUMOS · CATÁLOGO COMERCIAL', title: ['Un catálogo para', 'encontrar y elegir.'], description: 'Explorá Mazzarella: una experiencia de catálogo para insumos industriales. Una referencia para conversar sobre tu producto y tu recorrido comercial.', frameTitle: 'Demo navegable Mazzarella: catálogo de insumos industriales'},
    cafe: {name: 'Café Tilde', url: 'https://template-eccomerce.vercel.app/cafe-tilde', category: 'GASTRONOMÍA · CARTA DIGITAL', title: ['Tu carta.', 'Las ganas de volver.'], description: 'Recorré la carta digital de Café Tilde. Una experiencia pensada para mostrar la propuesta de una cafetería con una identidad propia.', frameTitle: 'Demo navegable Café Tilde: carta digital de una cafetería'}
  };
  let selected = 'dietetica';
  let activated = false;
  let loadTimeout;
  let observer;
  let previewAnimation;

  function replayPreview() {
    if (!staticPreview || selected !== 'dietetica') return;
    staticPreview.classList.remove('is-previewing');
    cancelAnimationFrame(previewAnimation);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Double frame lets the class restart without forcing a synchronous layout.
      previewAnimation = requestAnimationFrame(() => {
        previewAnimation = requestAnimationFrame(() => staticPreview.classList.add('is-previewing'));
      });
    }
  }

  function displayMode() {
    const local = selected === 'dietetica' || selected === 'pet';
    if (staticPreview) staticPreview.hidden = selected !== 'dietetica';
    if (petPreview) petPreview.hidden = selected !== 'pet';
    frame.hidden = local;
    if (displayType) displayType.textContent = local ? `VISTA PREVIA DE ${demos[selected].name.toUpperCase()}` : 'DEMO NAVEGABLE';
    if (fallbackCopy) fallbackCopy.textContent = local ? 'Para recorrer la experiencia completa, ' : 'Podés desplazarte dentro de la pantalla. Si no se visualiza, ';
    if (local) {
      clearTimeout(loadTimeout);
      // Dietética restricts framing; never load a frame that will display an error.
      frame.removeAttribute('src');
      frame.removeAttribute('data-src');
      status.textContent = `Vista previa de ${demos[selected].name}. Abrí la demo completa para recorrerla.`;
    } else if (!activated) status.textContent = 'La demo se carga al acercarte a esta sección.';
  }

  function load() {
    activated = true;
    observer?.disconnect();
    const demo = demos[selected];
    clearTimeout(loadTimeout);
    displayMode();
    if (selected === 'dietetica') {replayPreview(); return;}
    if (selected === 'pet') {petPreview?.querySelector('[data-pet-preview]')?.dispatchEvent(new Event('pet:replay')); return;}
    status.textContent = `Abriendo ${demo.name}…`;
    frame.title = demo.frameTitle;
    // A single cross-origin frame is used. Forms, popups and top navigation remain sandboxed.
    frame.loading = 'eager';
    frame.src = demo.url;
    loadTimeout = setTimeout(() => {
      status.textContent = 'La vista previa está tardando. La demo completa sigue disponible en el enlace.';
    }, 15000);
  }
  function select(key, focus = false, fetchNow = true) {
    if (!demos[key]) return;
    selected = key;
    const demo = demos[key];
    for (const tab of tabs) {
      const active = tab.dataset.demo === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) { panel.setAttribute('aria-labelledby', tab.id); if (focus) tab.focus(); }
    }
    section.querySelector('[data-demo-category]').textContent = demo.category;
    const title = section.querySelector('[data-demo-title]');
    title.replaceChildren(document.createTextNode(demo.title[0]), document.createElement('br'), document.createTextNode(demo.title[1]));
    section.querySelector('[data-demo-description]').textContent = demo.description;
    for (const link of section.querySelectorAll('[data-demo-external],[data-demo-fallback]')) link.href = demo.url;
    if (!['dietetica', 'pet'].includes(key)) frame.dataset.src = demo.url;
    frame.title = demo.frameTitle;
    displayMode();
    if (fetchNow) load();
  }
  for (const tab of tabs) {
    tab.addEventListener('click', () => { if (tab.dataset.demo !== selected || !activated) select(tab.dataset.demo); });
    tab.addEventListener('keydown', event => {
      const current = tabs.indexOf(tab);
      let next;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[next].dataset.demo, true);
    });
  }
  for (const button of section.querySelectorAll('[data-demo-view]')) {
    button.addEventListener('click', () => {
      panel.dataset.view = button.dataset.demoView;
      for (const option of section.querySelectorAll('[data-demo-view]')) option.setAttribute('aria-pressed', String(option === button));
    });
  }
  frame.addEventListener('load', () => {
    if (!activated || ['dietetica', 'pet'].includes(selected) || !frame.getAttribute('src')) return;
    clearTimeout(loadTimeout);
    // A frame load event cannot verify a cross-origin page or its embedding policy.
    status.textContent = `Vista previa de ${demos[selected].name}. También podés abrirla completa.`;
  });
  section.querySelector('[data-demo-replay]')?.addEventListener('click',replayPreview);
  const initial = section.dataset.initialDemo === 'petoutlet' ? 'pet' : section.dataset.initialDemo;
  if (initial && demos[initial] && initial !== selected) select(initial, false, false);
  else displayMode();
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && !activated) load();
    }, {rootMargin: '250px 0px', threshold: 0});
    observer.observe(panel);
  } else {
    load();
  }
})();

(() => {
  'use strict';
  const steps = [
    {speaker:'Tu comercio → IMAN',message:'“Necesito 100 envases. Tengo hasta $130.000 y los necesito en 2 días.”',detail:'Vos definís la compra. El agente trabaja con tus condiciones.',status:'Compra definida',label:'LA DECISIÓN ES TUYA',value:'Primero, tus reglas.',result:'Presupuesto y plazo antes de negociar.'},
    {speaker:'IMAN → 3 proveedores',message:'“Cotizá 100 envases de 1 L, entrega en 2 días. Indicá el total del lote y disponibilidad.”',detail:'Una misma solicitud para comparar propuestas equivalentes.',status:'Buscando propuestas',label:'SOLICITUD PREPARADA',value:'3 proveedores consultados.',result:'Misma cantidad, producto y plazo.'},
    {speaker:'Proveedores → IMAN',message:'Llegaron tres ofertas. Centro cumple precio y plazo; Norte demora más y Sur supera el presupuesto.',detail:'Compara las condiciones completas, además del precio.',status:'Comparando ofertas',label:'DENTRO DE TUS REGLAS',value:'Centro · $126.000',result:'100 unidades · entrega en 2 días.'},
    {speaker:'IMAN → Proveedor Centro',message:'“Si consolidamos las 100 unidades en una entrega, ¿podés cerrar el lote en $122.000 y mantener los 2 días?”',detail:'Contrapropuesta dentro del presupuesto y las reglas definidas.',status:'Negociando condiciones',label:'CONTRAPROPUESTA',value:'$122.000 por el lote',result:'Misma cantidad. Mismo plazo de entrega.'},
    {speaker:'Proveedor Centro → IMAN',message:'“De acuerdo: 100 unidades por $122.000, con entrega en 2 días. Propuesta lista para confirmar.”',detail:'La mejor oferta válida de este ejemplo queda documentada.',status:'Propuesta recibida',label:'PROPUESTA NEGOCIADA',value:'$122.000 · 2 días',result:'$1.220 por unidad · total del lote en ARS.'},
    {speaker:'IMAN → Tu comercio',message:'Tenés la comparación, las condiciones y la propuesta final. La decisión de avanzar queda en tus manos.',detail:'El agente prepara la compra. Una persona autoriza el siguiente paso.',status:'Espera tu aprobación',label:'PENDIENTE DE TU REVISIÓN',value:'Centro · $122.000',result:'100 unidades · 2 días · sin ejecutar la compra.'}
  ];
  const money = value => '$' + new Intl.NumberFormat('es-AR').format(value);
  const offers = [
    {id:'norte',price:118000,days:5,fit:'Fuera de plazo'},
    {id:'centro',price:126000,days:2,fit:'Cumple las reglas'},
    {id:'sur',price:139000,days:1,fit:'Fuera de presupuesto'}
  ];
  document.querySelectorAll('[data-negotiation]').forEach(root => {
    if (root.dataset.negotiationReady) return;
    root.dataset.negotiationReady = 'true';
    const find = name => root.querySelector(`[data-negotiation-${name}]`);
    const play = find('play'), next = find('next'), reset = find('reset'), approve = find('approve');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let step = 0, playing = false, approved = false, timer = null, animationTimer = null;
    function pause() {
      playing = false;
      window.clearTimeout(timer);
      timer = null;
      root.classList.remove('is-playing');
    }
    function controls() {
      const replay = step === steps.length - 1;
      find('play-label').textContent = playing ? 'Pausar' : replay ? 'Volver a probar' : step ? 'Continuar demo' : 'Probar negociación';
      find('play-icon').textContent = playing ? 'Ⅱ' : '▶';
      play.setAttribute('aria-label', playing ? 'Pausar la demostración de negociación' : replay ? 'Volver a reproducir la negociación' : 'Reproducir la demostración de negociación');
      next.disabled = replay;
    }
    function render(announce = true) {
      const state = steps[step];
      root.classList.toggle('has-proposal',step >= 4);
      root.classList.toggle('is-approved',approved);
      root.classList.toggle('is-playing',playing);
      find('speaker').textContent = approved ? 'Tu comercio → IMAN' : state.speaker;
      find('message').textContent = approved ? '“Apruebo esta propuesta.” En una implementación real, el proceso continúa con las autorizaciones e integraciones acordadas.' : state.message;
      find('detail').textContent = approved ? 'Simulación completada. No se contactó a proveedores ni se generó un pedido.' : state.detail;
      find('step-label').textContent = `${String(step+1).padStart(2,'0')} / 06`;
      const badge = find('badge');
      badge.replaceChildren(Object.assign(document.createElement('i'), {ariaHidden:'true'}),document.createTextNode(approved ? 'Demo completada' : playing ? 'Demo en marcha' : 'Demo interactiva'));
      find('result-label').textContent = approved ? 'APROBACIÓN SIMULADA' : state.label;
      find('result-value').textContent = approved ? 'Propuesta aprobada.' : state.value;
      find('result-detail').textContent = approved ? 'El control sigue estando en tu negocio.' : state.result;
      approve.hidden = step !== 5 || approved;
      find('result-icon').hidden = step === 5 && !approved;
      offers.forEach(offer => {
        const card = root.querySelector(`[data-negotiation-offer="${offer.id}"]`);
        const eligible = offer.id === 'centro';
        card.classList.toggle('is-eligible',step >= 2 && eligible);
        card.classList.toggle('is-selected',step >= 3 && eligible);
        card.classList.toggle('is-outside',step >= 2 && !eligible);
        card.classList.toggle('is-countering',step === 3 && eligible && !motion.matches);
        card.querySelector('[data-negotiation-price]').textContent = step >= 2 ? money(step >= 4 && eligible ? 122000 : offer.price) : '—';
        card.querySelector('[data-negotiation-delivery]').textContent = step >= 2 ? `Entrega en ${offer.days} ${offer.days === 1 ? 'día' : 'días'}` : step === 1 ? 'Preparando oferta…' : 'Esperando solicitud';
        card.querySelector('[data-negotiation-fit]').textContent = step >= 4 && eligible ? 'Propuesta negociada' : step >= 2 ? offer.fit : step === 1 ? 'Solicitud recibida' : `Proveedor ${offer.id === 'norte' ? 'A' : eligible ? 'B' : 'C'}`;
      });
      root.querySelectorAll('.negotiation-progress li').forEach((item,index) => {
        item.classList.toggle('is-current',index === step);
        item.classList.toggle('is-complete',index < step || approved);
        if (index === step) item.setAttribute('aria-current','step'); else item.removeAttribute('aria-current');
      });
      if (announce) find('live').textContent = approved ? 'Simulación completada. Propuesta aprobada. No se generan pedidos ni pagos.' : `Paso ${step+1} de 6. ${state.status}. ${state.message}`;
      root.classList.remove('is-changing');
      window.clearTimeout(animationTimer);
      if (!motion.matches && announce) {
        window.requestAnimationFrame(() => { root.classList.add('is-changing'); });
        animationTimer = window.setTimeout(() => root.classList.remove('is-changing'),420);
      }
      controls();
    }
    function schedule() {
      window.clearTimeout(timer);
      if (!playing || step === steps.length - 1) return;
      timer = window.setTimeout(() => {
        step++;
        if (step === steps.length - 1) pause();
        render();
        schedule();
      },motion.matches ? 4200 : 3400);
    }
    play.addEventListener('click',() => {
      if (playing) {pause();render(false);return;}
      if (step === steps.length - 1) {step = 0;approved = false;}
      playing = true;
      render(false);
      // The first click shows a concrete action immediately.
      if (step === 0) {step = 1;render();}
      schedule();
    });
    next.addEventListener('click',() => {
      pause();
      if (step < steps.length - 1) step++;
      render();
    });
    reset.addEventListener('click',() => {pause();step = 0;approved = false;render();});
    approve.addEventListener('click',() => {
      if (step !== 5) return;
      pause();approved = true;render();
      // Focus remains in the demo when the approval button is removed.
      play.focus({preventScroll:true});
    });
    document.addEventListener('visibilitychange',() => {if (document.hidden && playing) {pause();render(false);}});
    motion.addEventListener('change',() => {pause();render(false);});
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting && playing) {pause();render(false);}
      },{threshold:0});
      observer.observe(root);
    }
    render(false);
  });
})();

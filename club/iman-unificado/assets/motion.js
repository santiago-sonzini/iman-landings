(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  const running = new Set();
  const idleMotions = new WeakMap();
  const cleanup = [];
  let active = false;
  const easing = 'cubic-bezier(.2,.7,.2,1)';

  function animate(element,frames,options = {}) {
    if (!active || reduced.matches || document.hidden || !element?.animate) return null;
    const animation = element.animate(frames,{duration:580,easing,...options});
    running.add(animation);
    animation.finished.then(() => running.delete(animation),() => running.delete(animation));
    return animation;
  }
  function enter(element,delay = 0,distance = 18) {
    return animate(element,[{opacity:.12,translate:`0 ${distance}px`},{opacity:1,translate:'0 0'}],{delay,fill:'backwards'});
  }
  function observeOnce(elements,callback,options = {}) {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        callback(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -30px 0px',...options});
    elements.forEach(element => observer.observe(element));
    cleanup.push(() => observer.disconnect());
  }

  function setupEntrances() {
    // site.js owns .reveal. Do not animate it, its children or its ancestors twice.
    const groups = document.querySelectorAll('.product-grid,.feature-grid,.service-packages,.guide-grid,.channel-grid,.workflow,.rail');
    const cards = [];
    groups.forEach(group => {
      if (group.closest('.reveal')) return;
      [...group.children].forEach((card,index) => {
        if (card.matches('.reveal') || card.querySelector('.reveal')) return;
        card.dataset.imanMotionDelay = String(Math.min(index,4)*65);
        card.classList.add('iman-motion-card');
        cards.push(card);
      });
    });
    observeOnce(cards,card => enter(card,Number(card.dataset.imanMotionDelay),16));
    const headings = [...document.querySelectorAll('.section-top,.iman-demos-heading,.contact-copy,.faq>div:first-child')]
      .filter(element => !element.closest('.reveal') && !element.querySelector('.reveal'));
    observeOnce(headings,element => enter(element,0,14));
    cleanup.push(() => cards.forEach(card => {card.classList.remove('iman-motion-card');delete card.dataset.imanMotionDelay;}));
  }

  function setupProductScenes() {
    const scenes = [...document.querySelectorAll('.hero-showcase,.wallet-demo,.live-catalog,.negotiation,.agenda')]
      .filter(scene => !scene.closest('.reveal'));
    observeOnce(scenes,scene => {
      enter(scene,60,20);
      if (scene.matches('.hero-showcase')) {
        const dashboard = scene.querySelector('.showcase-dashboard');
        const device = scene.querySelector('.cafe-device');
        if (dashboard) enter(dashboard,150,14);
        if (device) enter(device,250,18);
        // A short two-cycle breath, then still. No permanent animation loop.
        if (device && finePointer.matches) idleMotions.set(device,animate(device,[{translate:'0 0'},{translate:'0 -5px'},{translate:'0 0'}],{delay:950,duration:4600,iterations:2,easing:'ease-in-out'}));
        const reward = scene.querySelector('.cafe-reward');
        if (reward) enter(reward,430,8);
      }
      if (scene.matches('.wallet-demo')) {
        const notification = scene.querySelector('.notification,.wallet-photo-notification');
        const pass = scene.querySelector('.mini-pass,.wallet-photo-pass');
        if (notification) enter(notification,300,10);
        if (pass) enter(pass,460,10);
      }
    },{threshold:.14});

    const hero = document.querySelector('.hero,.subhero');
    if (!hero) return;
    const layers = [...hero.querySelectorAll('.cafe-device,.showcase-dashboard,.wallet-demo .phone,.wallet-photo-device')];
    if (!layers.length) return;
    let bounds,raf = 0,latestPoint;
    layers.forEach(layer => layer.classList.add('iman-motion-layer'));
    const reset = () => {
      cancelAnimationFrame(raf);raf=0;latestPoint=null;bounds=null;
      layers.forEach(layer => {layer.style.removeProperty('--iman-shift-x');layer.style.removeProperty('--iman-shift-y');});
    };
    const move = event => {
      if (!active || reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      if (event.target.closest('input,textarea,select,button,a,iframe')) return;
      layers.forEach(layer => {idleMotions.get(layer)?.cancel();idleMotions.delete(layer);});
      bounds ||= hero.getBoundingClientRect();
      latestPoint = {x:event.clientX,y:event.clientY};
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf=0;
        if (!latestPoint || !bounds) return;
        const x=Math.max(-1,Math.min(1,(latestPoint.x-bounds.left)/bounds.width*2-1));
        const y=Math.max(-1,Math.min(1,(latestPoint.y-bounds.top)/bounds.height*2-1));
        layers.forEach(layer => {
          const depth=layer.matches('.showcase-dashboard') ? -3 : 6;
          layer.style.setProperty('--iman-shift-x',`${(x*depth).toFixed(2)}px`);
          layer.style.setProperty('--iman-shift-y',`${(y*depth*.6).toFixed(2)}px`);
        });
      });
    };
    const invalidate = () => {bounds=null;};
    hero.addEventListener('pointermove',move,{passive:true});
    hero.addEventListener('pointerleave',reset,{passive:true});
    window.addEventListener('resize',invalidate,{passive:true});
    window.addEventListener('scroll',invalidate,{passive:true});
    finePointer.addEventListener('change',reset);
    cleanup.push(() => {
      reset();layers.forEach(layer => layer.classList.remove('iman-motion-layer'));
      hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',reset);
      window.removeEventListener('resize',invalidate);window.removeEventListener('scroll',invalidate);
      finePointer.removeEventListener('change',reset);
    });
  }

  function setupGallery() {
    const gallery = document.querySelector('#demos');
    if (!gallery) return;
    const tabs = gallery.querySelector('.iman-demo-tabs');
    const panel = gallery.querySelector('.iman-demo-panel');
    const device = gallery.querySelector('.iman-demo-device');
    const copy = gallery.querySelector('.iman-demo-copy');
    if (!tabs || !panel || !device) return;
    let selected = tabs.querySelector('[aria-selected="true"]')?.dataset.demo;
    let view = panel.dataset.view;
    let stageAnimation,copyAnimation;
    function change() {
      const next = tabs.querySelector('[aria-selected="true"]')?.dataset.demo;
      const nextView = panel.dataset.view;
      if (next === selected && nextView === view) return;
      const changedDemo = next !== selected;
      selected = next;view = nextView;
      stageAnimation?.cancel();copyAnimation?.cancel();
      stageAnimation = animate(device,[{opacity:.35,translate:'12px 0'},{opacity:1,translate:'0 0'}],{duration:360});
      if (changedDemo && copy) copyAnimation = animate(copy,[{opacity:.4,translate:'0 7px'},{opacity:1,translate:'0 0'}],{duration:300});
    }
    const observer = new MutationObserver(change);
    observer.observe(tabs,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
    observer.observe(panel,{attributes:true,attributeFilter:['data-view']});
    cleanup.push(() => observer.disconnect());
  }

  function setupFAQ() {
    document.querySelectorAll('.faq details').forEach(details => {
      const onToggle = () => {
        if (details.open) [...details.children].filter(child => child.tagName !== 'SUMMARY').forEach(child => enter(child,0,6));
      };
      details.addEventListener('toggle',onToggle);
      cleanup.push(() => details.removeEventListener('toggle',onToggle));
    });
  }
  function stop() {
    active=false;
    running.forEach(animation => animation.cancel());running.clear();
    cleanup.splice(0).forEach(dispose => dispose());
    document.documentElement.classList.remove('iman-motion-enabled');
  }
  function start() {
    if (active || reduced.matches) return;
    active=true;
    document.documentElement.classList.add('iman-motion-enabled');
    setupEntrances();setupProductScenes();setupGallery();setupFAQ();
  }
  reduced.addEventListener('change',() => {if(reduced.matches)stop();else start();});
  document.addEventListener('visibilitychange',() => {
    // Finish transient motions when hidden; no render loop runs in the background.
    if (document.hidden) running.forEach(animation => animation.cancel());
  });
  start();
})();

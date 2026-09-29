(() => {
  'use strict';
  if (!document.body.classList.contains('cinematic-home')) return;
  const hero = document.querySelector('.hero');
  const stage = hero.querySelector('.hero-showcase');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 761px)');
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  let paused = false;
  const field = {turn:0,spread:1,pointerX:0,pointerY:0};
  const progress = document.createElement('div');
  progress.className = 'scroll-progress'; progress.setAttribute('aria-hidden','true');
  document.body.append(progress);
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-field'; canvas.setAttribute('aria-hidden','true');
  stage.prepend(canvas);
  const caption = document.createElement('div');
  caption.className = 'field-caption'; caption.setAttribute('aria-hidden','true');
  caption.innerHTML = '<span>01 / FIDELIZACIÓN</span><b>TODO CONECTADO ↗</b>';
  stage.append(caption);
  const bottom = document.createElement('div');
  bottom.className = 'hero-bottom';
  bottom.innerHTML = '<span class="scroll-hint" aria-hidden="true"><i></i> SEGUÍ EXPLORANDO ↓</span><button class="motion-toggle" type="button" aria-pressed="false">Ⅱ Pausar animaciones</button>';
  hero.querySelector('.rail').before(bottom);
  const toggle = bottom.querySelector('button');

  // Decorative line engravings use only paths; no business content is replaced.
  const arts = [
    '<path d="M15 40C35 4 65 4 70 30M15 40C35 15 62 17 70 30M15 40C35 65 62 63 70 50M15 40C35 76 65 76 70 50M125 40C105 4 75 4 70 30M125 40C105 15 78 17 70 30M125 40C105 65 78 63 70 50M125 40C105 76 75 76 70 50M70 34V46"/>',
    '<path d="M15 22L70 4L125 22L70 40ZM15 33L70 51L125 33M15 44L70 62L125 44M15 55L70 73L125 55M70 4V40"/>',
    '<path d="M9 40H32C54 40 49 12 72 12H127M32 40H127M32 40C54 40 49 68 72 68H127"/><circle cx="9" cy="40" r="4"/><circle cx="127" cy="12" r="4"/><circle cx="127" cy="40" r="4"/><circle cx="127" cy="68" r="4"/>'
  ];
  document.querySelectorAll('.product-card').forEach((card,i) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 140 80'); svg.setAttribute('aria-hidden','true');
    svg.setAttribute('class','service-art'); svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor'); svg.setAttribute('stroke-width','0.8');
    svg.innerHTML = arts[i]; card.prepend(svg);
  });

  // Perspective projection of a magnetic field. Visibility gates the render loop.
  const ctx = canvas.getContext('2d');
  let width = 1, height = 1, visible = true, frame = 0, time = 0, last = 0;
  const TAU = Math.PI * 2;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width=rect.width; height=rect.height;
    const ratio=Math.min(devicePixelRatio || 1,1.6);
    canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio);
    ctx?.setTransform(ratio,0,0,ratio,0,0);
    render();
  }
  function project(u,v) {
    const a = .38 + field.pointerY*.14;
    const b = -.32 + time*.085 + field.turn + field.pointerX*.18;
    const radius = .77 + .34*Math.cos(v);
    const x=radius*Math.cos(u), y=.46*Math.sin(v)*field.spread, z=radius*Math.sin(u);
    const y1=y*Math.cos(a)-z*Math.sin(a), z1=y*Math.sin(a)+z*Math.cos(a);
    const x2=x*Math.cos(b)-z1*Math.sin(b), z2=x*Math.sin(b)+z1*Math.cos(b);
    const rot = -.62;
    const xx=x2*Math.cos(rot)-y1*Math.sin(rot), yy=x2*Math.sin(rot)+y1*Math.cos(rot);
    const perspective=2.9/(2.9+z2);
    const scale=Math.min(width*.39,height*.44);
    return {x:width*.52+xx*scale*perspective,y:height*.51+yy*scale*perspective,z:z2};
  }
  function render() {
    if (!ctx) return;
    ctx.clearRect(0,0,width,height);
    const haze=ctx.createRadialGradient(width*.52,height*.51,0,width*.52,height*.51,width*.49);
    haze.addColorStop(0,'rgba(117,206,221,0.035)'); haze.addColorStop(.6,'rgba(181,163,238,0.022)');haze.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=haze;ctx.fillRect(0,0,width,height);
    const lines=desktop.matches?42:28, segments=88;
    for(let i=0;i<lines;i++) {
      const u=i/lines*TAU;
      const color=i%3===0?'117,206,221':i%3===1?'181,163,238':'229,189,124';
      ctx.beginPath();
      for(let j=0;j<=segments;j++){
        const p=project(u,j/segments*TAU);
        if(j===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
      }
      ctx.strokeStyle=`rgba(${color},${i%3===0?.37:.24})`;ctx.lineWidth=.65;ctx.stroke();
    }
    for(let i=0;i<12;i++){
      ctx.beginPath();
      for(let j=0;j<=128;j++){
        const p=project(j/128*TAU,i/12*TAU);
        if(j===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
      }
      ctx.strokeStyle='rgba(199,212,226,.13)';ctx.lineWidth=.55;ctx.stroke();
    }
    // A few traveling pulses follow the actual field, rather than random particles.
    for(let i=0;i<6;i++){
      const p=project(i/6*TAU,time*.42+i*1.12);
      ctx.beginPath();ctx.arc(p.x,p.y,1.7,0,TAU);ctx.fillStyle=i%2?'#e5bd7c':'#a3e1e8';ctx.fill();
      const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,11);
      glow.addColorStop(0,'rgba(117,206,221,.25)');glow.addColorStop(1,'rgba(117,206,221,0)');
      ctx.fillStyle=glow;ctx.fillRect(p.x-11,p.y-11,22,22);
    }
    // Technical registration marks frame the scene without becoming a logo.
    ctx.strokeStyle='rgba(196,200,216,.23)';ctx.lineWidth=.65;
    for(const [x,y] of [[width*.15,height*.22],[width*.88,height*.76]]){
      ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();
    }
  }
  function tick(stamp) {
    frame=0;
    if(!visible || paused || reduced.matches || document.hidden)return;
    time+=Math.min((stamp-last)/1000,.05);last=stamp;
    render();frame=requestAnimationFrame(tick);
  }
  function updateLoop() {
    cancelAnimationFrame(frame);frame=0;
    if(visible && !paused && !reduced.matches && !document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}
    else render();
  }
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(stage);
  const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updateLoop();},{rootMargin:'80px'});
  visibilityObserver.observe(stage);
  document.addEventListener('visibilitychange',updateLoop);

  const gsap=window.gsap, ScrollTrigger=window.ScrollTrigger;
  let media, animationContext;
  function startMotion() {
    if(!gsap || !ScrollTrigger || reduced.matches || paused)return;
    gsap.registerPlugin(ScrollTrigger);
    media=gsap.matchMedia();
    animationContext=gsap.context(()=>{
      const intro=gsap.timeline({defaults:{ease:'power3.out',clearProps:'transform,opacity'}});
      intro.from('.title-line>span',{yPercent:115,rotate:4,opacity:0,duration:1.25,stagger:.11,clearProps:'transform,opacity'},.1)
        .from('.hero .eyebrow',{opacity:0,y:12,duration:.8},.1)
        .from('.hero .lead,.hero .actions,.hero-note',{opacity:0,y:18,duration:.8,stagger:.12},.7)
        .from(canvas,{opacity:0,scale:.75,rotation:-15,duration:2.1},.15)
        .from('.cafe-device',{y:100,rotation:-16,opacity:0,duration:1.55},.5)
        .from('.showcase-dashboard',{x:100,y:40,opacity:0,duration:1.5},.65);
      gsap.to(progress,{scaleX:1,ease:'none',scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:.2}});
      gsap.to(field,{turn:1.4,spread:1.6,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.scroll-hint i',{scaleY:.4,opacity:.4,duration:1.1,repeat:-1,yoyo:true,ease:'sine.inOut'});
      document.querySelectorAll('.section-top,.iman-demos-heading,.faq>div:first-child,.contact-copy').forEach(block=>{
        gsap.from(block,{y:65,opacity:0,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:block,start:'top 91%',once:true}});
      });
      document.querySelectorAll('.product-card').forEach((card,i)=>{
        gsap.from(card,{y:75,opacity:0,duration:1.15,delay:desktop.matches?i*.12:0,scrollTrigger:{trigger:card,start:'top 91%',once:true}});
        const paths=card.querySelectorAll('.service-art path');
        paths.forEach(path=>{const length=path.getTotalLength();gsap.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:1.8,delay:i*.12,scrollTrigger:{trigger:card,start:'top 85%',once:true}});});
      });
      document.querySelectorAll('.workflow-item').forEach((item,i)=>{
        gsap.from(item,{y:45,opacity:0,duration:.9,delay:desktop.matches?i*.14:0,scrollTrigger:{trigger:item,start:'top 92%',once:true}});
        gsap.to(item,{'--step-progress':1,ease:'none',scrollTrigger:{trigger:item,start:'top 88%',end:'top 40%',scrub:.6}});
      });
      gsap.from('.contact-box',{y:70,opacity:0,duration:1.2,scrollTrigger:{trigger:'.contact-box',start:'top 91%',once:true}});
    });
    media.add('(min-width: 980px)',()=>{
      gsap.to('.hero .escena',{y:-95,scale:1.12,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.wallet-photo-device',{rotation:5,y:-65,ease:'none',scrollTrigger:{trigger:'.wallet-section',start:'top bottom',end:'bottom top',scrub:1}});
      gsap.fromTo('.wallet-photo-pass',{y:70,rotation:-5},{y:-15,rotation:0,ease:'none',scrollTrigger:{trigger:'.wallet-section',start:'top 75%',end:'bottom 65%',scrub:1}});
      gsap.fromTo('.iman-demo-display',{y:60},{y:-20,ease:'none',scrollTrigger:{trigger:'#demos',start:'top bottom',end:'bottom top',scrub:1}});
      gsap.fromTo('.footer-top',{y:45,opacity:.4},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:'.footer',start:'top 85%',end:'top 30%',scrub:.5}});
    });
    document.fonts.ready.then(()=>ScrollTrigger.refresh());
  }
  function stopMotion(){if(gsap){gsap.killTweensOf('.cafe-device,.showcase-dashboard,.iman-demo-device');gsap.set('.cafe-device,.showcase-dashboard,.iman-demo-device',{clearProps:'transform,opacity'});}media?.revert();media=null;animationContext?.revert();animationContext=null;field.turn=0;field.spread=1;render();}
  function updateMotion(){
    stopMotion();startMotion();updateLoop();
    toggle.disabled=reduced.matches;
    toggle.setAttribute('aria-pressed',String(paused||reduced.matches));
    toggle.textContent=reduced.matches?'Movimiento reducido':paused?'▷ Activar animaciones':'Ⅱ Pausar animaciones';
  }
  toggle.addEventListener('click',()=>{paused=!paused;updateMotion();});
  reduced.addEventListener('change',updateMotion);
  desktop.addEventListener('change',()=>{
    if(gsap){gsap.killTweensOf('.cafe-device,.showcase-dashboard');gsap.set('.cafe-device,.showcase-dashboard',{clearProps:'transform,opacity'});}
    resize();
  });
  stage.addEventListener('pointermove',event=>{
    if(paused||reduced.matches||!finePointer.matches)return;
    const box=stage.getBoundingClientRect();
    const x=(event.clientX-box.left)/box.width*2-1,y=(event.clientY-box.top)/box.height*2-1;
    field.pointerX=x;field.pointerY=y;
    if(gsap){gsap.to('.cafe-device',{x:x*13,y:y*9,duration:1.1,overwrite:'auto'});gsap.to('.showcase-dashboard',{x:-x*8,y:-y*5,duration:1.1,overwrite:'auto'});}
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{
    field.pointerX=0;field.pointerY=0;
    if(gsap&&!paused&&!reduced.matches)gsap.to('.cafe-device,.showcase-dashboard',{x:0,y:0,duration:1.2,overwrite:'auto'});
  });
  // Gallery functionality remains owned by demos.js; animate only its transition.
  const tabs=document.querySelector('.iman-demo-tabs');
  tabs?.addEventListener('click',event=>{
    if(!event.target.closest('button')||paused||reduced.matches||!gsap)return;
    gsap.fromTo('.iman-demo-device',{opacity:.35,y:18},{opacity:1,y:0,duration:.6,overwrite:true});
  });
  resize();updateMotion();
})();

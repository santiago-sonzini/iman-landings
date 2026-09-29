(() => {
  'use strict';
  const book = document.querySelector('.book');
  const panels = [...document.querySelectorAll('.panel')];
  const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLayout = matchMedia('(max-width: 800px)');
  let active=0, scrollEndTimer, wheelTimer, booting=true;
  let requestedPanel=null, wheelStart=null, wheelTotal=0, previousWidth=innerWidth;
  const initialIndex=Math.max(0,panels.findIndex(p=>'#'+p.id===location.hash));

  function panelOffset(index) {
    return mobileLayout.matches?panels[index].offsetTop:panels[index].offsetLeft;
  }
  function setPosition(index,smooth=false) {
    book.scrollTo({
      left:mobileLayout.matches?0:panelOffset(index),
      top:mobileLayout.matches?panelOffset(index):0,
      behavior:smooth&&!reduceMotion.matches?'smooth':'instant'
    });
  }
  function navigate(index,updateHash=true) {
    index=Math.max(0,Math.min(panels.length-1,index));
    requestedPanel=index;
    setPosition(index,true);
    if(updateHash)history.replaceState(null,'','#'+panels[index].id);
  }
  function updateCurrent() {
    let current;
    if(mobileLayout.matches) {
      const center=book.scrollTop+book.clientHeight*.5;
      let nearest=Infinity;
      panels.forEach((panel,i)=>{
        const distance=Math.abs(panel.offsetTop+panel.offsetHeight*.5-center);
        if(distance<nearest){nearest=distance;current=i;}
      });
    } else current=Math.max(0,Math.min(panels.length-1,Math.round(book.scrollLeft/book.clientWidth)));
    if(current!==active) {
      active=current;
      panels.forEach((panel,i)=>panel.classList.toggle('is-active',i===active));
      chapterLinks.forEach((link,i)=>i===active?link.setAttribute('aria-current','true'):link.removeAttribute('aria-current'));
    }
  }
  function syncComposition() {
    panels.forEach(panel=>{
      if(mobileLayout.matches||reduceMotion.matches){panel.querySelector('.composition').style.transform='';return;}
      const distance=Math.max(-1,Math.min(1,(panel.offsetLeft-book.scrollLeft)/book.clientWidth));
      panel.querySelector('.composition').style.transform='scale('+(1-Math.abs(distance)*.09)+') rotate('+distance*2.5+'deg)';
    });
  }
  book.addEventListener('scroll',()=>{
    if(booting)return;
    updateCurrent();syncComposition();
    clearTimeout(scrollEndTimer);
    scrollEndTimer=setTimeout(()=>{
      if(requestedPanel===null||requestedPanel===active)history.replaceState(null,'','#'+panels[active].id);
      requestedPanel=null;
    },160);
  },{passive:true});
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
    const index=panels.findIndex(panel=>'#'+panel.id===link.getAttribute('href'));
    if(index<0)return;
    e.preventDefault();navigate(index);
    if(e.detail===0){panels[index].setAttribute('tabindex','-1');panels[index].focus({preventScroll:true});}
  }));
  document.addEventListener('keydown',e=>{
    if(mobileLayout.matches||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
    if(e.key==='ArrowRight'){e.preventDefault();navigate(active+1);}
    if(e.key==='ArrowLeft'){e.preventDefault();navigate(active-1);}
  });
  // Preserve native vertical touch/wheel scrolling on mobile.
  book.addEventListener('wheel',e=>{
    if(e.ctrlKey||mobileLayout.matches||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;
    const panel=e.target.closest('.panel');
    if(panel&&panel.scrollHeight>panel.clientHeight+2){
      if((e.deltaY>0&&panel.scrollTop<panel.scrollHeight-panel.clientHeight-2)||(e.deltaY<0&&panel.scrollTop>2))return;
    }
    e.preventDefault();
    const multiplier=e.deltaMode===1?24:e.deltaMode===2?book.clientWidth:1;
    if(wheelStart===null){wheelStart=active;wheelTotal=0;}
    wheelTotal+=e.deltaY*multiplier;
    book.style.scrollSnapType='none';book.scrollLeft+=e.deltaY*multiplier;
    clearTimeout(wheelTimer);
    wheelTimer=setTimeout(()=>{
      let target=Math.round(book.scrollLeft/book.clientWidth);
      if(target===wheelStart&&Math.abs(wheelTotal)>35)target=wheelStart+Math.sign(wheelTotal);
      wheelStart=null;book.style.scrollSnapType='';navigate(target);
    },150);
  },{passive:false});
  window.addEventListener('resize',()=>{
    if(booting)return;
    // Address-bar changes on a phone must not pull the reader back to a chapter's top.
    if(innerWidth!==previousWidth){previousWidth=innerWidth;setPosition(active);}
    syncComposition();
  });
  mobileLayout.addEventListener('change',()=>{
    clearTimeout(wheelTimer);wheelStart=null;book.style.scrollSnapType='';
    requestAnimationFrame(()=>{setPosition(active);syncComposition();});
  });
  window.addEventListener('hashchange',()=>{
    const index=panels.findIndex(p=>'#'+p.id===location.hash);
    if(index>=0)navigate(index,false);
  });
  function restoreInitialChapter(){setPosition(initialIndex);updateCurrent();syncComposition();booting=false;}
  if(document.readyState==='complete')restoreInitialChapter();
  else window.addEventListener('load',restoreInitialChapter,{once:true});

  // Full-screen ASCII field. Every particle travels along an original geometric path.
  // The central quiet area keeps the editorial text readable.
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const TAU = Math.PI * 2;
  const glyphs = ['.', ':', '+', '*', '.', ':', '.', '+', '-', 'x'];
  const count = innerWidth <= 800 ? 2300 : 4200;
  const random = n => {const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const bezier = (t,a,b,c,d) => (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;
  const scenes = ['magnet','flow','rosette','lattice'];
  const particles = Array.from({length:count},(_,i)=>({x:0,y:0,seed:random(i+1),lane:i%16}));
  const pointer = {x:-10000,y:-10000};
  let paused=reduceMotion.matches, width=0, height=0, initialized=false;
  let sceneOverride=null, scenePanel=0, clock=0, frame=0, lastTime=0;
  const palette=[[148,164,188],[191,207,232],[187,91,102],[215,58,36],[244,196,48]].map(color=>color.join(','));

  function target(i,time,scene) {
    const p=particles[i], lane=p.lane;
    const phase=p.seed*TAU+time*.00024;
    if(scene==='magnet') {
      const arm=i%12, side=arm%2?1:-1, vertical=arm<6?-1:1, band=Math.floor(arm%6/2);
      const t=(p.seed+time*.00006*(.65+lane*.035))%1;
      const x=bezier(t,.005,[.035,.12,.13][band],[.15,.27,.22][band],[.48,.53,.40][band]);
      const y=bezier(t,.08,[.39,.33,.235][band],[.52,.37,.29][band],[.37,.22,.15][band]);
      return {x:side*x+(lane-7.5)*.0024,y:vertical*y+(lane-7.5)*.0024};
    }
    if(scene==='flow') {
      return {x:Math.sin(phase)*(.35+lane*.01),y:Math.sin(phase*2)*(.22+lane*.008)};
    }
    if(scene==='rosette') {
      const radius=.32+.18*Math.cos(8*phase+lane*.075);
      const a=phase+time*.000025;
      return {x:Math.cos(a)*radius*(.83+lane*.022),y:Math.sin(a)*radius*(.83+lane*.022)};
    }
    const r=.43*Math.cos(4*phase),a=phase+lane*TAU/8+time*.000025;
    return {x:r*Math.cos(a)*(1+lane*.025),y:r*Math.sin(a)*(1+lane*.025)};
  }
  function render(time,instant=false) {
    if(!width||!height)return;
    if(scenePanel!==active){scenePanel=active;sceneOverride=null;}
    const scene=sceneOverride||scenes[active];
    ctx.clearRect(0,0,width,height);
    const mobile=width<=800;
    const scaleX=width*(mobile?1.6:1.14),scaleY=height*1.23;
    const angle=paused?0:Math.sin(time*.00008)*.08;
    const cos=Math.cos(angle),sin=Math.sin(angle);
    ctx.font=(mobile?9:10)+'px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    for(let i=0;i<count;i++){
      const p=particles[i],q=target(i,time,scene);
      const drift=Math.sin(time*.00027+p.seed*7)*.009;
      const tx=q.x*cos-q.y*sin+drift,ty=q.x*sin+q.y*cos;
      const ease=instant||!initialized||paused?1:.035;
      p.x+=(tx-p.x)*ease;p.y+=(ty-p.y)*ease;
      let x=width*.5+p.x*scaleX,y=height*.52+p.y*scaleY;
      if(!paused){
        const dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy);
        if(d<155&&d>0){const push=(1-d/155)**2*60;x+=dx/d*push;y+=dy/d*push;}
      }
      const quiet=Math.hypot((x-width*.5)/(width*(mobile?.37:.28)),(y-height*.5)/(height*.34));
      const edge=Math.min(1,Math.max(0,(quiet-.45)/.9));
      const alpha=(.14+edge*.71)*(.45+p.seed*.55);
      const tint=(i%31===0)?4:(i%17===0)?3:(active===2&&i%4===0)?2:i%3===0?1:0;
      ctx.fillStyle='rgba('+palette[tint]+','+alpha.toFixed(3)+')';
      const glyphIndex=(i+Math.floor(time*.0008+p.seed*5))%glyphs.length;
      ctx.fillText(glyphs[glyphIndex],x,y);
    }
    // A sparse field of moving characters extends the geometry across the entire paper.
    for(let i=0;i<(mobile?85:180);i++){
      const x=(random(i+811)*width+Math.sin(time*.0002+i)*23+width)%width;
      const y=(random(i+712)*height-time*.003*(.4+random(i+914))+height*20)%height;
      const d=Math.abs(x-width/2)/(width/2),alpha=.045+d*.1;
      const tint=(i%31===0)?4:(i%17===0)?3:(active===2&&i%4===0)?2:i%3===0?1:0;
      ctx.fillStyle='rgba('+palette[tint]+','+alpha.toFixed(3)+')';
      ctx.fillText(i%3===0?'+':'.',x,y);
    }
    initialized=true;
  }
  function resize(){
    width=innerWidth;height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    render(clock,true);
  }
  window.addEventListener('resize',resize);
  document.addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;},{passive:true});
  document.addEventListener('pointerleave',()=>{pointer.x=-10000;pointer.y=-10000;});
  function tick(time){
    frame=requestAnimationFrame(tick);
    if(document.hidden||paused||time-lastTime<40)return;
    clock+=Math.min(time-lastTime,80)*.42;lastTime=time;
    render(clock);
  }
  function syncMotion(){
    document.documentElement.classList.toggle('motion-enabled', !paused);
    syncComposition();
    render(clock,true);
  }
  reduceMotion.addEventListener('change',()=>{paused=reduceMotion.matches;syncMotion();});
  book.addEventListener('scroll',()=>{if(paused)render(clock,true);},{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)cancelAnimationFrame(frame);
    else{lastTime=performance.now();frame=requestAnimationFrame(tick);}
  });
  resize();syncMotion();frame=requestAnimationFrame(tick);
})();

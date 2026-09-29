(() => {
  'use strict';
  const track=document.getElementById('experience-track');if(!track)return;
  const panels=[...track.querySelectorAll('.journey-panel')],buttons=[...document.querySelectorAll('[data-journey]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active=0,frame=0,wheelLock=0;
  const measure=()=>{
    frame=0;active=Math.max(0,Math.min(panels.length-1,Math.round(track.scrollLeft/track.clientWidth)));
    buttons.forEach((b,i)=>{if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    document.querySelector('[data-journey-position]').textContent=`0${active+1} / 0${panels.length}`;
    track.dataset.position=String(active);
    panels.forEach((panel,i)=>{panel.dataset.active=String(i===active);panel.inert=i!==active;});
    document.dispatchEvent(new CustomEvent('iman:journey',{detail:{index:active}}));
  };
  const go=(index,focus=false)=>{
    index=Math.max(0,Math.min(panels.length-1,index));
    track.scrollTo({left:index*track.clientWidth,behavior:reduced.matches?'instant':'smooth'});
    history.replaceState(null,'',location.pathname+location.search+(index?'#'+panels[index].id:''));
    if(focus){const heading=panels[index].querySelector('h1,h2');heading.tabIndex=-1;heading.focus({preventScroll:true});}
  };
  buttons.forEach((button,i)=>button.addEventListener('click',()=>go(i)));
  document.querySelectorAll('a[href="#posibilidades"]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();go(1,true);}));
  track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(measure);},{passive:true});
  track.addEventListener('wheel',event=>{
    if(event.ctrlKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    const panel=event.target.closest('.journey-panel');
    // Keep vertical reading available inside short viewports, and never intercept modal scrolling.
    if(panel&&panel.scrollHeight>panel.clientHeight+3){
      if(event.deltaY>0&&panel.scrollTop+panel.clientHeight<panel.scrollHeight-2)return;
      if(event.deltaY<0&&panel.scrollTop>1)return;
    }
    if(Math.abs(event.deltaY)<8)return;
    const next=active+(event.deltaY>0?1:-1);
    if(next<0||next>=panels.length)return;
    event.preventDefault();
    if(performance.now()<wheelLock)return;
    wheelLock=performance.now()+700;go(next);
  },{passive:false});
  track.addEventListener('keydown',event=>{
    if(event.target!==track)return;
    const key=event.key;
    if(['ArrowRight','PageDown','ArrowLeft','PageUp','Home','End'].includes(key)){
      event.preventDefault();go(key==='Home'?0:key==='End'?panels.length-1:active+(['ArrowRight','PageDown'].includes(key)?1:-1));
    }
  });
  addEventListener('resize',()=>{track.scrollTo({left:active*track.clientWidth,behavior:'instant'});measure();});
  addEventListener('hashchange',()=>{const index=panels.findIndex(panel=>'#'+panel.id===location.hash);if(index>=0)go(index);else if(location.hash==='#posibilidades')go(1);});
  const initial=panels.findIndex(panel=>'#'+panel.id===location.hash);
  if(initial>0)track.scrollLeft=track.clientWidth*initial;
  else if(['#posibilidades','#soluciones','#demos'].includes(location.hash))track.scrollLeft=track.clientWidth;
  measure();
})();

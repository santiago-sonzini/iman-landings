/* IMÁN · Identidad V3. Comportamiento compartido: aparición al hacer scroll,
   la retícula de limaduras del hero y la pastilla de WhatsApp. */
(function(){
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll reveal */
  var reveals=[].slice.call(document.querySelectorAll('.rv'));
  if(reduce||!('IntersectionObserver' in window)){reveals.forEach(function(el){el.classList.add('in')})}
  else{
    var ro=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');ro.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    reveals.forEach(function(el){ro.observe(el)});
  }

  /* Filings on paper: short strokes aligned by two poles, drifting slowly. The brand's own dotted grid.
     With data-field-mouse the pointer is a third pole: the filings turn toward it and lean in, and the two poles drift wider. */
  var cv=document.querySelector('[data-field]');
  if(cv&&cv.getContext){
    var ctx=cv.getContext('2d'),W=0,H=0,last=0,fieldOn=true;
    var nums=function(name,fallback){return (cv.getAttribute(name)||fallback).split(',').map(Number)};
    var wideP=nums('data-field','.05,.86,.96,.16'),narrowP=nums('data-field-narrow','.04,.94,.98,.1');
    var ink=cv.getAttribute('data-ink')||'#13211e',gain=Number(cv.getAttribute('data-gain')||.55);
    var live=cv.hasAttribute('data-field-mouse')&&!reduce,px=0,py=0,cx=0,cy=0,want=0,pull=0,busy=false;
    var size=function(){var d=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0)};
    var draw=function(t){
      ctx.clearRect(0,0,W,H);
      var wide=W>900,p=wide?wideP:narrowP,step=wide?24:20;
      var sx=live?.04:.012,sy=live?.05:.016,q=live?t*2.4:t;
      var ax=W*(p[0]+sx*Math.sin(q/5200)),ay=H*(p[1]+sy*Math.cos(q/6100));
      var bx=W*(p[2]+sx*Math.cos(q/4700)),by=H*(p[3]+sy*Math.sin(q/5600));
      if(live){
        var box=cv.getBoundingClientRect(),tx=px-box.left,ty=py-box.top;
        if(pull<.02){cx=tx;cy=ty}   // the pole appears under the pointer instead of sweeping in from where it last was
        cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;pull+=(want-pull)*.09;
        busy=Math.abs(tx-cx)+Math.abs(ty-cy)>.5||Math.abs(want-pull)>.01;
      }
      ctx.lineWidth=1.1;ctx.lineCap='round';ctx.strokeStyle=ink;
      for(var y=step/2;y<H;y+=step){for(var x=step/2;x<W;x+=step){
        var dx1=x-ax,dy1=y-ay,r1=dx1*dx1+dy1*dy1+900,k1=1/(r1*Math.sqrt(r1));
        var dx2=x-bx,dy2=y-by,r2=dx2*dx2+dy2*dy2+900,k2=1/(r2*Math.sqrt(r2));
        var fx=dx1*k1-dx2*k2,fy=dy1*k1-dy2*k2,ox=x,oy=y,near=0;
        if(pull>.01){
          var dx3=x-cx,dy3=y-cy,d3=dx3*dx3+dy3*dy3,r3=d3+900,k3=pull*1.2/(r3*Math.sqrt(r3));
          fx+=dx3*k3;fy+=dy3*k3;
          near=pull*Math.exp(-d3/45000);   // 1 under the pointer, fading over some 300px
          var lean=near*8*Math.min(1,d3/3600)/Math.sqrt(d3+1);   // up to 8px toward the pointer
          ox-=dx3*lean;oy-=dy3*lean;
        }
        var m=Math.sqrt(fx*fx+fy*fy);
        if(!m)continue;
        var s=Math.min(1,Math.log(1+m*4e5)/Math.LN10/2.2);
        var l=(2.5+6.5*s+3*near)/m;
        ctx.globalAlpha=Math.min(1,(.1+.5*s)*gain*(1+1.5*near));ctx.beginPath();ctx.moveTo(ox-fx*l/2,oy-fy*l/2);ctx.lineTo(ox+fx*l/2,oy+fy*l/2);ctx.stroke();
      }}
      ctx.globalAlpha=1;
    };
    // Every frame while the pointer pole is moving; otherwise 30 a second when live, 20 when it only drifts.
    var loop=function(t){if(!fieldOn)return;if(t-last>(live?(busy?0:32):50)){last=t;draw(t)}requestAnimationFrame(loop)};
    size();draw(0);
    window.addEventListener('resize',function(){size();draw(last)});
    if(live){
      var point=function(e){px=e.clientX;py=e.clientY;want=1;busy=true};
      window.addEventListener('pointermove',point,{passive:true});
      window.addEventListener('pointerdown',point,{passive:true});
      // A finger is a pole only while it touches; the mouse, until it leaves the window.
      window.addEventListener('pointerup',function(e){if(e.pointerType!=='mouse')want=0},{passive:true});
      window.addEventListener('pointercancel',function(){want=0},{passive:true});
      document.documentElement.addEventListener('pointerleave',function(){want=0});
    }
    if(!reduce){
      requestAnimationFrame(loop);
      if('IntersectionObserver' in window){new IntersectionObserver(function(e){var on=e[0].isIntersecting;if(on&&!fieldOn){fieldOn=true;requestAnimationFrame(loop)}else if(!on){fieldOn=false}}).observe(cv)}
      document.addEventListener('visibilitychange',function(){if(document.hidden){fieldOn=false}else if(!fieldOn){fieldOn=true;requestAnimationFrame(loop)}});
    }
  }

  /* WhatsApp pill: appears once the hero's own buttons are out of view. */
  var pill=document.querySelector('[data-wa-pill]'),anchor=document.querySelector('[data-pill-after]');
  if(pill&&anchor){
    var seen=false,place=function(){pill.classList.toggle('is-on',window.scrollY>window.innerHeight*.6&&!seen)};
    if('IntersectionObserver' in window){new IntersectionObserver(function(e){seen=e[0].isIntersecting;place()}).observe(anchor)}
    window.addEventListener('scroll',place,{passive:true});place();
  }
})();

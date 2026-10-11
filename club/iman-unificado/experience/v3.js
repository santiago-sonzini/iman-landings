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

  /* Filings on paper: short strokes aligned by two poles, drifting slowly. The brand's own dotted grid. */
  var cv=document.querySelector('[data-field]');
  if(cv&&cv.getContext){
    var ctx=cv.getContext('2d'),W=0,H=0,last=0,fieldOn=true;
    var nums=function(name,fallback){return (cv.getAttribute(name)||fallback).split(',').map(Number)};
    var wideP=nums('data-field','.05,.86,.96,.16'),narrowP=nums('data-field-narrow','.04,.94,.98,.1');
    var ink=cv.getAttribute('data-ink')||'#13211e',gain=Number(cv.getAttribute('data-gain')||.55);
    var size=function(){var d=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0)};
    var draw=function(t){
      ctx.clearRect(0,0,W,H);
      var wide=W>900,p=wide?wideP:narrowP,step=wide?24:20;
      var ax=W*(p[0]+.012*Math.sin(t/5200)),ay=H*(p[1]+.016*Math.cos(t/6100));
      var bx=W*(p[2]+.012*Math.cos(t/4700)),by=H*(p[3]+.016*Math.sin(t/5600));
      ctx.lineWidth=1.1;ctx.lineCap='round';ctx.strokeStyle=ink;
      for(var y=step/2;y<H;y+=step){for(var x=step/2;x<W;x+=step){
        var dx1=x-ax,dy1=y-ay,r1=dx1*dx1+dy1*dy1+900,k1=1/(r1*Math.sqrt(r1));
        var dx2=x-bx,dy2=y-by,r2=dx2*dx2+dy2*dy2+900,k2=1/(r2*Math.sqrt(r2));
        var fx=dx1*k1-dx2*k2,fy=dy1*k1-dy2*k2,m=Math.sqrt(fx*fx+fy*fy);
        if(!m)continue;
        var s=Math.min(1,Math.log(1+m*4e5)/Math.LN10/2.2);
        var l=(2.5+6.5*s)/m;
        ctx.globalAlpha=(.1+.5*s)*gain;ctx.beginPath();ctx.moveTo(x-fx*l/2,y-fy*l/2);ctx.lineTo(x+fx*l/2,y+fy*l/2);ctx.stroke();
      }}
      ctx.globalAlpha=1;
    };
    var loop=function(t){if(!fieldOn)return;if(t-last>50){last=t;draw(t)}requestAnimationFrame(loop)};
    size();draw(0);
    window.addEventListener('resize',function(){size();draw(last)});
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

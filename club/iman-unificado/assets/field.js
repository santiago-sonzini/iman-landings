(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=matchMedia('(pointer: coarse)');
  const modest=coarse.matches || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4) || (navigator.deviceMemory && navigator.deviceMemory<=4);
  const colors=['#f0eee7','#a9d3da','#ddc69e','#c6bce0'];
  const glyphs='·.:;!|/17YPG&B';
  const instances=[];
  let seed=8362;
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  const smooth=t=>t*t*(3-2*t);
  const clamp=t=>Math.max(0,Math.min(1,t));
  const waitFont=document.fonts ? document.fonts.load('300 190px Barlow') : Promise.resolve();
  // Sample the supplied symbol itself: no invented curves, dilation, or thickened strokes.
  async function targets(){
    await waitFont;
    const mask=document.createElement('canvas');mask.width=800;mask.height=800;
    const ctx=mask.getContext('2d',{willReadFrequently:true});
    let image=null;
    try {
      const response=await fetch('/assets/symbol-config.json');
      if(response.ok){const config=await response.json();if(config.src){image=new Image();image.src=config.src;await image.decode();const scale=640/Math.max(image.width,image.height);ctx.drawImage(image,(800-image.width*scale)/2,(800-image.height*scale)/2,image.width*scale,image.height*scale);document.querySelectorAll('.symbol-fallback').forEach(el=>{el.replaceChildren(image.cloneNode());});}}
    }catch { /* The original symbol in HTML remains visible if loading fails. */ }
    if(!image)return {points:[],image:null};
    const pixels=ctx.getImageData(0,0,800,800).data, points=[];
    const step=image?4:7;
    for(let y=0;y<800;y+=step)for(let x=0;x<800;x+=step){const k=(y*800+x)*4;const lum=(pixels[k]+pixels[k+1]+pixels[k+2])/3;if(pixels[k+3]>100&&lum>110)points.push({x:x/800-.5,y:y/800-.5,ink:pixels[k+3]/255});}
    for(let i=points.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[points[i],points[j]]=[points[j],points[i]];}
    return {points,image};
  }
  class Field {
    constructor(el,source){
      this.el=el;this.kind=el.dataset.field;this.canvas=el.querySelector('canvas');this.ctx=this.canvas.getContext('2d');if(!this.ctx)return;
      this.source=source;this.visible=false;this.frame=0;this.last=0;this.elapsed=0;this.pulseAt=-5000;this.pointer={x:-1000,y:-1000};this.active=0;
      const count=this.kind==='hero'?(modest?650:1500):this.kind==='info'?(modest?120:230):(modest?90:170);
      this.points=Array.from({length:Math.min(count,source.points.length)},(_,i)=>{const target=source.points[i];return {tx:target.x,ty:target.y,sx:((i%45)/44-.5)*1.4,sy:(Math.floor(i/45)/Math.max(1,Math.ceil(count/45)-1)-.5)*1.1,phase:random()*Math.PI*2,size:.45+random()*.55,glyph:glyphs[Math.min(glyphs.length-1,Math.floor((target.ink||.6)*9+random()*4))],color:random()>.993?1+Math.floor(random()*3):0,delay:random()*.24};});
      this.resize();
      this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(el);
      this.io=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.update();},{rootMargin:'60px'});this.io.observe(el);
      this.el.addEventListener('pointermove',event=>{if(coarse.matches)return;const r=el.getBoundingClientRect();this.pointer={x:event.clientX-r.left,y:event.clientY-r.top};},{passive:true});
      this.el.addEventListener('pointerleave',()=>this.pointer={x:-1000,y:-1000});
      this.el.dataset.ready='true';
    }
    resize(){const r=this.el.getBoundingClientRect();this.w=r.width;this.h=r.height;this.dpr=Math.min(devicePixelRatio||1,modest?1.5:2);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);}
    update(){cancelAnimationFrame(this.frame);this.last=0;if(this.visible&&!document.hidden&&!reduced.matches){this.el.dataset.ready='true';this.frame=requestAnimationFrame(t=>this.draw(t));}else if(reduced.matches)this.el.removeAttribute('data-ready');}
    pulse(detail){this.active=['fidelizacion','catalogos','automatizaciones','agentes'].indexOf(detail.service);this.pulseAt=this.elapsed;}
    draw(now){
      if(!this.visible||document.hidden||reduced.matches)return;
      this.frame=requestAnimationFrame(t=>this.draw(t));
      if(this.last && now-this.last < (modest?33:25))return;
      this.elapsed+=this.last?Math.min(now-this.last,80):16;this.last=now;
      const ctx=this.ctx,w=this.w,h=this.h,t=this.elapsed/1000;ctx.clearRect(0,0,w,h);
      const scale=Math.min(w,h)*(this.kind==='hero'?1.35:.8),pulse=clamp(1-(this.elapsed-this.pulseAt)/650);
      for(let i=0;i<this.points.length;i++){
        const p=this.points[i];let x,y,alpha=.7;
        if(this.kind==='hero'){
          const progress=smooth(clamp((t-.22-p.delay)/2.05));
          const sx=p.sx+Math.sin(t*.35+p.sy*4)*.035,sy=p.sy+Math.sin(t*.45+p.sx*3)*.018;
          const arc=Math.sin(progress*Math.PI)*.18;
          x=w/2+((sx*(1-progress)+p.tx*progress)+arc*Math.sign(p.sx)) *scale;
          y=h/2+(sy*(1-progress)+p.ty*progress-arc*(p.sx*.8))*scale;
          const residual=progress>.999?Math.sin(t*.45+p.phase)*.22:0;x+=residual;y+=residual*.3;
          const dx=x-this.pointer.x,dy=y-this.pointer.y,dist=Math.hypot(dx,dy);
          if(dist<85){const influence=(1-dist/85)*2.5;x+=dx/Math.max(dist,1)*influence;y+=dy/Math.max(dist,1)*influence;}
          if(pulse>0&&i%4===this.active){x+=(p.tx*.02)*scale*pulse;y-=Math.sin(p.phase)*5*pulse;}
          alpha=.4+.55*progress;
          if(this.source.image&&progress>.97)alpha*=.86;
        } else {
          const band=i%4;
          const phase=p.sx*.25+this.active*.06;
          x=w/2+p.sx*w*.48;
          y=h*.5+(band-1.5)*12+Math.sin(p.sx*3+t*.13+phase)*h*.11;
          if(pulse>0){x+=(w*.5-x)*pulse*.14;y+=(band===this.active?-1:1)*Math.sin(p.phase)*pulse*20;}
          alpha=.28;
        }
        ctx.fillStyle=colors[p.color];ctx.globalAlpha=alpha;
        if(this.kind==='hero'){ctx.font=`${Math.max(2.5,Math.min(5,scale/145))}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.glyph,x,y);}else{ctx.beginPath();ctx.arc(x,y,p.size,0,Math.PI*2);ctx.fill();}
      }
      if(this.kind==='hero'&&this.source.image){const formed=clamp((t-2.3)/.35);if(formed>0){const img=this.source.image,s=scale*.8/Math.max(img.width,img.height);ctx.globalAlpha=formed*.58;ctx.drawImage(img,(w-img.width*s)/2,(h-img.height*s)/2,img.width*s,img.height*s);}}
      ctx.globalAlpha=1;
    }
  }
  targets().then(source=>{if(!source.points.length)return;document.querySelectorAll('[data-field]').forEach(el=>{try{instances.push(new Field(el,source));}catch{el.removeAttribute('data-ready');}});}).catch(()=>{});
  document.addEventListener('visibilitychange',()=>instances.forEach(f=>f.update()));
  reduced.addEventListener('change',()=>instances.forEach(f=>f.update()));
  document.addEventListener('iman:field-pulse',event=>instances.forEach(f=>f.pulse(event.detail)));
})();

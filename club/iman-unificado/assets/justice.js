(() => {
  'use strict';
  const stage=document.querySelector('[data-justice]');if(!stage)return;
  const canvas=stage.querySelector('canvas');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const modest=matchMedia('(pointer: coarse)').matches||(navigator.hardwareConcurrency||8)<=4;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,powerPreference:'low-power'});
  if(!gl)return;
  let raf=0,visible=false,elapsed=0,last=0,ready=false,disposed=false;
  let px=0,py=0,rx=0,ry=0,count=0;
  const vertex=`
    precision highp float;
    attribute vec3 aPosition; attribute vec3 aColor;
    attribute float aSize; attribute float aKind;
    uniform vec2 uResolution; uniform vec2 uPointer;
    uniform float uTime; uniform float uIntro; uniform float uDpr;
    varying vec3 vColor; varying float vAlpha;
    void main(){
      vec3 p=aPosition;
      float life=uIntro*uIntro*(3.0-2.0*uIntro);
      float ay=uPointer.x*.19+sin(uTime*.26)*.025+(1.0-life)*.28;
      float ax=-uPointer.y*.10;
      if(aKind>.5){
        p.x+=(1.0-life)*sin(p.y*11.0+p.x*3.0)*.17;
        p.z+=(1.0-life)*cos(p.x*12.0)*.19;
        p.y+=(1.0-life)*sin(p.x*9.0)*.04;
        p.x+=sin(uTime*.40+p.y*9.0)*.0006;
      }else{
        p.z+=sin(p.x*5.0+p.y*3.0+uTime*.14)*.15;
        p.x+=sin(p.y*4.0+uTime*.13)*.015;
      }
      vec3 q=vec3(cos(ay)*p.x+sin(ay)*p.z,p.y,-sin(ay)*p.x+cos(ay)*p.z);
      q=vec3(q.x,cos(ax)*q.y-sin(ax)*q.z,sin(ax)*q.y+cos(ax)*q.z);
      float perspective=2.5/(2.5-q.z);
      float scale=aKind>.5?1.77:1.70;
      vec2 screen=q.xy*perspective*scale;
      screen.x*=uResolution.y/uResolution.x;
      gl_Position=vec4(screen,0.,1.);
      float pixelScale=clamp(uResolution.y/600.,.50,1.45);
      gl_PointSize=max(1.,aSize*pixelScale*uDpr*perspective);
      float light=1.0+(uPointer.x*.10)+sin(uTime*.24+p.y*2.)*.035;
      vColor=aColor*light;
      vAlpha=aKind>.5?(.48+.52*life):.26;
    }`;
  const fragment=`
    precision mediump float;
    varying vec3 vColor; varying float vAlpha;
    void main(){
      float distanceToCenter=length(gl_PointCoord-.5);
      float edge=1.-smoothstep(.32,.5,distanceToCenter);
      gl_FragColor=vec4(vColor,edge*vAlpha);
    }`;
  function shader(type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Particle shader unavailable');return s;}
  let program,buffer,vs,fs;
  try{
    vs=shader(gl.VERTEX_SHADER,vertex);fs=shader(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  }catch{return;}
  gl.useProgram(program);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  const uniforms={};['uResolution','uPointer','uTime','uIntro','uDpr'].forEach(n=>uniforms[n]=gl.getUniformLocation(program,n));
  const dpr=Math.min(devicePixelRatio||1,modest?1.5:2);
  function resize(){
    const {width,height}=stage.getBoundingClientRect();
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(uniforms.uResolution,width,height);gl.uniform1f(uniforms.uDpr,dpr);
    if(ready&&reduced.matches)render(0);
  }
  function render(now){
    if(!ready||disposed)return;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    rx+=(px-rx)*.055;ry+=(py-ry)*.055;
    gl.uniform2f(uniforms.uPointer,reduced.matches?0:rx,reduced.matches?0:ry);
    gl.uniform1f(uniforms.uTime,reduced.matches?0:elapsed/1000);
    gl.uniform1f(uniforms.uIntro,reduced.matches?1:Math.min(1,elapsed/2100));
    gl.drawArrays(gl.POINTS,0,count);stage.dataset.ready='true';
  }
  function tick(now){
    if(!visible||document.hidden||reduced.matches||disposed)return;
    raf=requestAnimationFrame(tick);
    if(last&&now-last<(modest?33:23))return;
    elapsed+=last?Math.min(now-last,80):16;last=now;render(now);
  }
  function update(){cancelAnimationFrame(raf);last=0;if(!ready)return;if(reduced.matches)render(0);else if(visible&&!document.hidden&&!disposed)raf=requestAnimationFrame(tick);}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.01});observer.observe(stage);
  const resizer=new ResizeObserver(resize);resizer.observe(stage);
  stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=stage.getBoundingClientRect();px=(e.clientX-r.left)/r.width*2-1;py=(e.clientY-r.top)/r.height*2-1;},{passive:true});
  stage.addEventListener('pointerleave',()=>{px=0;py=0;});
  document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disposed=true;cancelAnimationFrame(raf);stage.removeAttribute('data-ready');});
  canvas.addEventListener('webglcontextrestored',()=>{stage.removeAttribute('data-ready');});
  addEventListener('pagehide',e=>{cancelAnimationFrame(raf);if(!e.persisted){disposed=true;observer.disconnect();resizer.disconnect();gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);}});
  addEventListener('pageshow',update);
  fetch('/assets/justice-points.json').then(r=>{if(!r.ok)throw new Error('Source unavailable');return r.json();}).then(model=>{
    const values=[];
    // A folded, regular field echoes the halftone references; it is not random particle rain.
    const columns=modest?44:66,rows=modest?50:74;
    for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
      const x=(col/(columns-1)-.5)*1.6,y=(row/(rows-1)-.5)*1.17;
      const band=(Math.sin(x*7+y*4)+1)/2;
      const ink=.023+Math.pow(band,5)*.078;
      values.push(x,y,-.28,ink*.6,ink*.84,ink,modest?1.6:1.4,0);
    }
    model.points.forEach((p,i)=>{
      if(modest&&i%2)return;
      values.push(...p.slice(0,6),p[6]*(modest?2.5:2.20),1);
      if(!modest&&i%7===0)values.push(p[0]-.002,p[1],p[2]-.045,p[3]*.32,p[4]*.32,p[5]*.32,p[6]*1.5,1);
    });
    count=values.length/8;
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);
    [['aPosition',3,0],['aColor',3,12],['aSize',1,24],['aKind',1,28]].forEach(([name,size,offset])=>{const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,32,offset);});
    ready=true;stage.dataset.particles=String(count);resize();update();
  }).catch(()=>{stage.removeAttribute('data-ready');});
})();

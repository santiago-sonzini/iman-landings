(() => {
  'use strict';
  const stage=document.getElementById('ascii-stage');if(!stage)return;
  const canvas=stage.querySelector('canvas'),fallback=stage.querySelector('.ascii-fallback');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
  const modest=coarse.matches||(navigator.hardwareConcurrency||8)<=4;
  const count=modest?11000:23000, names=['iman','fidelizacion','catalogos','automatizaciones','agentes'];
  const labels=['ATRACCIÓN','VÍNCULO','ENCUENTRO','COORDINACIÓN','CRITERIO'];
  const fallbackURLs=['black-hole-static.svg','magnet-static.svg','adam-source.png','gears-static.svg','justice-static.svg'];
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,powerPreference:'low-power'});
  let desired=0;
  function setFallback(index){stage.dataset.scene=names[index];fallback.src='/assets/'+fallbackURLs[index];document.querySelector('[data-visual-label]').textContent=labels[index];}
  if(!gl){document.addEventListener('iman:journey',e=>setFallback(e.detail.index));return;}
  let seed=15917;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  const warm=[.96,.94,.87],cyan=[.48,.82,.87],lilac=[.72,.66,.93],amber=[.89,.75,.52];
  const particle=(p,color,size=1,group=0)=>[...p,...color,size,group];
  function blackHole(){
    const list=[];
    for(let i=0;i<count;i++){
      const ring=i/count;
      if(ring<.65){
        const angle=random()*Math.PI*2,r=.265+Math.pow(random(),1.65)*.66;
        const thickness=(random()-.5)*(.015+(r-.26)*.09);
        const light=Math.min(1.1,(.30+Math.pow(1-(r-.265)/.66,2)*.65)*(.64+Math.max(0,-Math.cos(angle))*.8));
        const color=mix(warm,cyan,Math.min(.7,(r-.26)*1.1)).map(v=>v*light);
        list.push(particle([Math.cos(angle)*r,thickness-.085,Math.sin(angle)*r],color,.7+random()*.5,0));
      }else{
        const angle=random()*Math.PI, r=.278+Math.pow(random(),2.3)*.205;
        const x=Math.cos(angle)*r,y=Math.sin(angle)*r*.94-.02;
        const edge=1-(r-.278)/.205;
        const light=(.22+edge*.68)*(.6+Math.max(0,-Math.cos(angle))*.7);
        list.push(particle([x,y,-.05+(random()-.5)*.09],mix(warm,lilac,.20).map(v=>v*light),.65+random()*.65,1));
      }
    }return list;
  }
  function magnet(){
    const list=[];
    for(let i=0;i<count;i++){
      const flow=i%6===0;
      if(flow){
        const angle=random()*Math.PI*2,r=.43+random()*.17;
        list.push(particle([Math.cos(angle)*r,Math.sin(angle)*r*.82,.09*Math.sin(angle*2)],mix(cyan,lilac,random()).map(v=>v*(.22+random()*.3)),.7,1));continue;
      }
      const surface=random(),r=.20+random()*.13,z=(random()<.5?-1:1)*.065;
      let x,y;
      if(surface<.58){const a=random()*Math.PI;x=Math.cos(a)*r;y=-Math.sin(a)*r-.02;}
      else{x=(random()<.5?-1:1)*r;y=-.02+random()*.35;}
      const rim=random()<.16;
      const pz=rim?(random()-.5)*.13:z;
      const light=(z>0?.72:.24)+(y>.22?.15:0);
      const color=mix(y>.22?(x<0?cyan:amber):lilac,warm,.30).map(v=>v*light);
      list.push(particle([x,y,pz],color,.88+random()*.22,0));
    }return list;
  }
  function gears(){
    const list=[],centers=[[-.17,-.06,.29,20],[.27,.23,.205,14],[.29,-.34,.205,14]];
    for(let i=0;i<count;i++){
      const group=i%3,[cx,cy,r,teeth]=centers[group],angle=random()*Math.PI*2;
      const slice=random();let radius;
      if(slice<.42)radius=r*(.76+random()*.20)+((Math.floor(angle/Math.PI/2*teeth*2)%2)===0?r*.065:0);
      else if(slice<.62)radius=r*(.22+random()*.12);
      else{const spoke=Math.floor(random()*6)*Math.PI/3;radius=r*(.32+random()*.48);const width=(random()-.5)*r*.09;const x=cx+Math.cos(spoke)*radius-Math.sin(spoke)*width,y=cy+Math.sin(spoke)*radius+Math.cos(spoke)*width;list.push(particle([x,y,(random()<.5?-.035:.035)],mix([cyan,lilac,amber][group],warm,.35).map(v=>v*.7),.9,group));continue;}
      const z=(random()<.68?.035:-.035),light=z>0?.64+.32*Math.abs(Math.sin(angle)):.25;
      list.push(particle([cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius,z],[cyan,lilac,amber][group].map(v=>v*light),.82+random()*.3,group));
    }return list;
  }
  const models=[blackHole(),magnet(),null,gears(),null];
  function resample(points){return Array.from({length:count},(_,i)=>points[Math.floor(i*points.length/count)]);}
  function packed(points){const out=new Float32Array(count*8);resample(points).forEach((p,i)=>{for(let j=0;j<8;j++)out[i*8+j]=p[j]??0;});return out;}
  const vertex=`
  precision highp float;
  attribute vec3 aFromPosition;attribute vec3 aToPosition;
  attribute vec3 aFromColor;attribute vec3 aToColor;
  attribute vec2 aFromExtra;attribute vec2 aToExtra;
  uniform vec2 uResolution;uniform vec2 uPointer;
  uniform float uTime;uniform float uTransition;uniform float uFrom;uniform float uTo;uniform float uDpr;uniform float uIntro;
  varying vec3 vColor;varying float vGlyph;varying float vAlpha;
  vec4 motion(vec3 p,float group,float model){
    float alpha=1.;
    if(model<.5){
      if(group<.5){float a=uTime*.045/(length(p.xz)+.3);vec2 rotated=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;p.x=rotated.x;p.y+=rotated.y*.125;p.z=rotated.y*.48;if(rotated.y<0.&&length(vec2(p.x,p.y-.035))<.245)alpha=0.;}
      else{p.x+=sin(uTime*.2+p.y*4.)*.002;}
    }else if(model<1.5){
      if(group>.5){float a=uTime*.08;p.xy=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xy;p.z+=sin(uTime*.4+p.y*6.)*.025;}
    }else if(model<2.5){p.x+=(group<.5?1.:-1.)*sin(uTime*.45)*.014;p.z+=sin(uTime*.4+p.x*3.)*.008;}
    else if(model<3.5){vec2 center=group<.5?vec2(-.17,-.06):(group<1.5?vec2(.27,.23):vec2(.29,-.34));float a=uTime*(group<.5?.10:-.143);p.xy=center+mat2(cos(a),-sin(a),sin(a),cos(a))*(p.xy-center);}
    else{p.x+=sin(uTime*.32+p.y*4.)*.0006;}
    float scale=model<.5?1.42:(model<1.5?2.20:(model<2.5?1.32:(model<3.5?1.58:1.86)));
    return vec4(p*scale,alpha);
  }
  void main(){
    float progress=smoothstep(0.,1.,uTransition);
    vec4 a=motion(aFromPosition,aFromExtra.y,uFrom),b=motion(aToPosition,aToExtra.y,uTo);
    vec3 p=mix(a.xyz,b.xyz,progress);
    float dissolve=sin(progress*3.1415926);
    p.x+=dissolve*sin(p.y*9.+p.x*3.)*.065;
    p.z+=dissolve*sin(p.x*11.)*.12;
    float intro=1.-smoothstep(0.,1.,uIntro);
    p.x+=intro*sin(p.y*5.+p.x*3.)*.07;p.z+=intro*.08;
    float yaw=uPointer.x*.17+sin(uTime*.16)*.022,pitch=-uPointer.y*.08;
    p=vec3(cos(yaw)*p.x+sin(yaw)*p.z,p.y,-sin(yaw)*p.x+cos(yaw)*p.z);
    p=vec3(p.x,cos(pitch)*p.y-sin(pitch)*p.z,sin(pitch)*p.y+cos(pitch)*p.z);
    float perspective=2.8/(2.8-p.z);
    vec2 position=p.xy*perspective;position.x*=uResolution.y/uResolution.x;
    gl_Position=vec4(position,0.,1.);
    float size=mix(aFromExtra.x,aToExtra.x,progress);
    gl_PointSize=clamp(6.8*(uResolution.y/620.),3.2,8.2)*uDpr*(.82+size*.18)*perspective;
    vColor=mix(aFromColor,aToColor,progress)*(1.+uPointer.x*.055);
    vGlyph=floor(mod(abs(aToPosition.x*731.+aToPosition.y*1117.)+size*13.,16.));
    vAlpha=mix(a.w,b.w,progress)*(.62+.38*uIntro);
  }`;
  const fragment=`precision mediump float;uniform sampler2D uAtlas;varying vec3 vColor;varying float vGlyph;varying float vAlpha;void main(){vec2 uv=vec2((gl_PointCoord.x+vGlyph)/16.,1.-gl_PointCoord.y);float ink=texture2D(uAtlas,uv).a;if(ink<.02)discard;gl_FragColor=vec4(vColor,ink*vAlpha);}`;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('ASCII shader unavailable');return s;};
  let program,vs,fs;
  try{vs=shader(gl.VERTEX_SHADER,vertex);fs=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('ASCII program unavailable');}catch{return;}
  gl.useProgram(program);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  const atlas=document.createElement('canvas');atlas.width=512;atlas.height=32;const ctx=atlas.getContext('2d');ctx.fillStyle='#fff';ctx.font='25px monospace';ctx.textAlign='center';ctx.textBaseline='middle';[...'.,:;-=+*o17YPG#@'].forEach((g,i)=>ctx.fillText(g,i*32+16,17));
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const u={};['uResolution','uPointer','uTime','uTransition','uFrom','uTo','uDpr','uIntro'].forEach(name=>u[name]=gl.getUniformLocation(program,name));
  const fromBuffer=gl.createBuffer(),toBuffer=gl.createBuffer();
  function bind(buffer,prefix,points){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,packed(points),gl.STATIC_DRAW);[['Position',3,0],['Color',3,12],['Extra',2,24]].forEach(([suffix,size,offset])=>{const location=gl.getAttribLocation(program,'a'+prefix+suffix);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,32,offset);});}
  let active=0,from=0,transition=1,time=0,last=0,frame=0,visible=true,lost=false;
  let pointer=[0,0],rotation=[0,0];
  bind(fromBuffer,'From',models[0]);bind(toBuffer,'To',models[0]);
  function change(index){desired=index;setFallback(index);if(index===active||!models[index])return;from=active;active=index;bind(fromBuffer,'From',models[from]);bind(toBuffer,'To',models[active]);transition=reduced.matches?1:0;update();}
  document.addEventListener('iman:journey',event=>change(event.detail.index));
  function resize(){const r=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,modest?1.5:2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(u.uResolution,r.width,r.height);gl.uniform1f(u.uDpr,dpr);if(reduced.matches)draw();}
  function draw(){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(u.uPointer,reduced.matches?0:rotation[0],reduced.matches?0:rotation[1]);gl.uniform1f(u.uTime,reduced.matches?0:time/1000);gl.uniform1f(u.uTransition,reduced.matches?1:transition);gl.uniform1f(u.uFrom,from);gl.uniform1f(u.uTo,active);gl.uniform1f(u.uIntro,reduced.matches?1:Math.min(1,time/1500));gl.drawArrays(gl.POINTS,0,count);stage.dataset.ready='true';stage.dataset.particles=String(count);}
  function tick(now){if(!visible||document.hidden||reduced.matches||lost)return;frame=requestAnimationFrame(tick);if(last&&now-last<(modest?33:23))return;const delta=last?Math.min(now-last,80):16;last=now;time+=delta;transition=Math.min(1,transition+delta/850);rotation=rotation.map((v,i)=>v+(pointer[i]-v)*.065);draw();}
  function update(){cancelAnimationFrame(frame);last=0;if(lost)return;if(reduced.matches)draw();else if(visible&&!document.hidden&&!document.body.classList.contains('solution-open'))frame=requestAnimationFrame(tick);}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();});observer.observe(stage);
  const resizer=new ResizeObserver(resize);resizer.observe(stage);
  document.querySelector('.experience-shell').addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=stage.getBoundingClientRect();pointer=[Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1))];},{passive:true});
  document.querySelector('.experience-shell').addEventListener('pointerleave',()=>pointer=[0,0]);
  document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
  const modalObserver=new MutationObserver(update);modalObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);stage.removeAttribute('data-ready');});
  addEventListener('pagehide',e=>{cancelAnimationFrame(frame);if(!e.persisted){lost=true;observer.disconnect();resizer.disconnect();gl.deleteBuffer(fromBuffer);gl.deleteBuffer(toBuffer);gl.deleteTexture(texture);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);}});addEventListener('pageshow',update);
  resize();update();
  const preload=()=>Promise.allSettled([[2,'adam-points.json'],[4,'justice-points.json']].map(async([index,file])=>{const response=await fetch('/assets/'+file);if(!response.ok)throw Error('Reference unavailable');const model=await response.json();models[index]=model.points;if(desired===index)change(index);}));
  if('requestIdleCallback' in window)requestIdleCallback(preload,{timeout:900});else setTimeout(preload,300);
  const initial=Number(document.getElementById('experience-track').dataset.position||0);if(initial)change(initial);
})();

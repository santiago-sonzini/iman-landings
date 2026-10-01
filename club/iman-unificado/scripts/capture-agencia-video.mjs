// Graba el teléfono de la demo de concesionaria (~/Desktop/Agentes/demo-concesionaria, puerto 5180) mientras corre
// el guion «Llega desde Mercado Libre» y deja el video de /automatizaciones/ en experience/assets/:
// demo-agencia.mp4, demo-agencia.webp (póster) y demo-agencia.json (en qué segundo ocurre cada paso).
// Uso: levantar la demo (npm run dev) y después `node scripts/capture-agencia-video.mjs`. Necesita ffmpeg y cwebp.
import {spawn,execFileSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {writeFileSync,mkdirSync,rmSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'),out=path.join(root,'experience/assets');
const tmp=`/tmp/iman_agencia_${Date.now()}`;mkdirSync(tmp,{recursive:true});
const SPEED=1.5,WIDTH=560,PAD=0;             // el video final corre 1,5× más rápido que la demo; se recorta al borde del teléfono
// (la página le redondea las esquinas con border-radius, así no queda un rectángulo alrededor)
// Mismo recurso que en los anuncios: el reloj de la demo se corre a las 23:40.
const boot=`(()=>{const t=new Date();t.setHours(23,40,8,0);const off=t.getTime()-Date.now(),D=Date;
class F extends D{constructor(...a){a.length?super(...a):super(D.now()+off)}static now(){return D.now()+off}}
window.Date=F;
localStorage.setItem('demo-concesionaria:pantalla',JSON.stringify({theme:'oscuro',whatsapp:'claro',controls:false,speed:1,dock:false}));})()`;
const css=`html{zoom:2}html,body,#root,#root *:not(.phone):not(.phone *){background:#11141b!important;border-color:transparent!important;box-shadow:none!important}
.phone-page-controls,.phone-caption,.demo-controls,.demo-run{display:none!important}.phone{box-shadow:0 0 0 1.5px #2b2b2e!important}`;
const steps=[['responde','sigue disponible'],['califica','usado para entregar?'],['financia','cuotas fijas'],['agenda','Te agendé'],['fin','Traé el DNI']];
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',PORT=9340,UD=`${tmp}/profile`;
const chrome=spawn(CHROME,['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${PORT}`,'--remote-allow-origins=*',`--user-data-dir=${UD}`,'about:blank'],{stdio:'ignore'});
try{
let ver;for(let i=0;i<75&&!ver;i++){try{ver=await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()}catch{await sleep(200)}}
const ws=new WebSocket(ver.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),frames=[];
const send=(method,params={},sessionId)=>new Promise((res,rej)=>{const i=++id;pending.set(i,m=>m.error?rej(new Error(method+JSON.stringify(m.error))):res(m.result));ws.send(JSON.stringify({id:i,method,params,sessionId}))});
ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);
 if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);return}
 if(m.method==='Page.screencastFrame'){const n=frames.length,file=path.join(tmp,`f${String(n).padStart(5,'0')}.jpg`);
  writeFileSync(file,Buffer.from(m.params.data,'base64'));frames.push({file,t:m.params.metadata.timestamp});
  send('Page.screencastFrameAck',{sessionId:m.params.sessionId},m.sessionId).catch(()=>{})}});
const {targetId}=await send('Target.createTarget',{url:'about:blank'});const {sessionId:s}=await send('Target.attachToTarget',{targetId,flatten:true});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true},s)).result.value;
await send('Page.enable',{},s);
// El screencast entrega cuadros a 1× aunque se pida más densidad: se duplica el tamaño con zoom para grabar el teléfono a 800 px.
await send('Emulation.setDeviceMetricsOverride',{width:880,height:1860,deviceScaleFactor:1,mobile:false},s);
await send('Page.addScriptToEvaluateOnNewDocument',{source:boot},s);
await send('Page.navigate',{url:'http://localhost:5180/#/telefono'},s);await sleep(2500);
await ev(`(()=>{const st=document.createElement('style');st.textContent=${JSON.stringify(css)};document.head.append(st)})()`);await sleep(600);
const box=await ev(`(()=>{const b=document.querySelector('.phone').getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}})()`);console.log('teléfono',JSON.stringify(box));
await send('Page.startScreencast',{format:'jpeg',quality:93,everyNthFrame:1},s);
await sleep(1300);                                                   // un momento de la lista de chats antes de que llegue la consulta
await ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'1',bubbles:true}))`);
const marks={};
for(const [name,needle] of steps){
 let ok=false;for(let i=0;i<1200&&!ok;i++){ok=await ev(`(document.querySelector('.wa-messages')?.innerText||'').includes(${JSON.stringify(needle)})`);if(!ok)await sleep(100)}
 if(!ok)throw Error(`No llegó «${needle}»`);
 marks[name]=frames.at(-1).t;console.log('paso',name);
}
await sleep(2600);await send('Page.stopScreencast',{},s);await sleep(300);ws.close();
// Lista para ffmpeg con la duración real de cada cuadro (el screencast solo manda cuadros cuando la pantalla cambia).
const t0=frames[0].t,end=frames.at(-1).t+2.2;
const list=frames.map((f,i)=>`file '${f.file}'\nduration ${((frames[i+1]?.t??end)-f.t).toFixed(4)}`).join('\n')+`\nfile '${frames.at(-1).file}'\n`;
writeFileSync(path.join(tmp,'list.txt'),list);
const k=box.w>600?1:2,crop=`crop=${Math.round((box.w+PAD*2)*k/2)*2}:${Math.round((box.h+PAD*2)*k/2)*2}:${Math.round((box.x-PAD)*k)}:${Math.round((box.y-PAD)*k)}`;
const mp4=path.join(out,'demo-agencia.mp4');
execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',path.join(tmp,'list.txt'),'-vf',`${crop},scale=${WIDTH}:-2:flags=lanczos,setpts=PTS/${SPEED},fps=30`,
 '-an','-c:v','libx264','-preset','slow','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',mp4]);
// Póster: el momento en que la visita ya está agendada.
const at=((marks.agenda-t0)/SPEED+1.2).toFixed(2),png=path.join(tmp,'poster.png');
execFileSync('ffmpeg',['-y','-loglevel','error','-ss',at,'-i',mp4,'-frames:v','1',png]);
execFileSync('cwebp',['-quiet','-q','82',png,'-o',path.join(out,'demo-agencia.webp')]);
const sec=n=>+((marks[n]-t0)/SPEED).toFixed(1);
const [ancho,alto]=execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',mp4]).toString().trim().split(',').map(Number);
writeFileSync(path.join(out,'demo-agencia.json'),JSON.stringify({ancho,alto,duracion:+((end-t0)/SPEED).toFixed(1),responde:sec('responde'),califica:sec('califica'),financia:sec('financia'),agenda:sec('agenda')})+'\n');
console.log(frames.length,'cuadros →',mp4);
}finally{chrome.kill();try{rmSync(tmp,{recursive:true,force:true})}catch{}}

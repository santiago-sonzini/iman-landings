// Anuncios estáticos 01/10/2026 — asistente de WhatsApp con IA para agencias de autos.
// Uso: node build.mjs → a-feed.png (1080×1350), a-story.png (1080×1920), b-feed.png.
// El teléfono es una captura de la demo (capture.mjs → ./phone/). Chrome headless por DevTools, sin dependencias.
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {readFileSync,writeFileSync,rmSync} from 'node:fs';
import path from 'node:path';
const dir=path.dirname(new URL(import.meta.url).pathname),assets=path.resolve(dir,'../../experience/assets');
const b64=f=>readFileSync(f).toString('base64');
const D=b64(path.join(assets,'playfair-display-sc.ttf')),B=b64(path.join(assets,'libre-baskerville-regular.ttf'));
const symbol=readFileSync(path.join(assets,'iman-simbolo.svg'),'utf8').replace(/stroke="#[0-9a-f]+"/,'stroke="currentColor"');
const phone=n=>`data:image/png;base64,${b64(path.join(dir,'phone',n+'.png'))}`;
const bolt='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="#e0a100"/></svg>';
const check='<svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="11" fill="#1daa61"/><path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ads={
 a:{shot:'claro-a2',title:'Te escriben<br>por un auto<br>a las 23:40.<br>¿Quién<br>contesta?',
    lead:'Un asistente con IA atiende<br>el WhatsApp de tu agencia,<br>a cualquier hora.',
    chip:[bolt,'Respondió en 4 s'],chipTop:1004},
 b:{shot:'claro-b',title:'De la consulta<br>a la visita<br>agendada.<br>Sin tocar<br>el teléfono.',
    lead:'Un asistente con IA atiende<br>el WhatsApp de tu agencia<br>y te pasa al comprador listo.',
    chip:[check,'Visita agendada'],chipTop:1034,chipLeft:318},
};
const list=['Responde en segundos','Pregunta cómo paga','Agenda la visita y te avisa'];
function html(a,story){const H=story?1920:1350,top=story?285:0;return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(data:font/ttf;base64,${D})}@font-face{font-family:B;src:url(data:font/ttf;base64,${B})}*{box-sizing:border-box}
body{margin:0;width:1080px;height:${H}px;background:#11141b;color:#eef0f4;font-family:B;overflow:hidden;position:relative}
.field{position:absolute;left:330px;top:${top+140}px;width:1250px;color:#94a4bc;opacity:.13}.field svg{width:100%;height:auto;stroke-width:3}
main{position:absolute;left:0;top:${top}px;width:1080px;height:1350px}
header{position:absolute;left:64px;right:64px;top:56px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #94a4bc55;padding-bottom:22px}
.brand{display:flex;align-items:center;gap:16px;font:32px P;letter-spacing:1px}.brand svg{width:58px;height:52px;stroke-width:22}
.who{color:#aab7cb;font:19px monospace;letter-spacing:2.5px}
.col{position:absolute;left:64px;top:180px;width:410px}
.tag{color:#94a4bc;font:18px monospace;letter-spacing:2.5px;margin-bottom:26px}
h1{font:normal 62px/1.08 P;letter-spacing:-2px;margin:0 0 28px}
.lead{font:24px/1.55 B;color:#c8d0dc;margin:0 0 26px}
ul{list-style:none;margin:0;padding:0;border-bottom:1px solid #536075}
li{display:flex;align-items:baseline;gap:18px;padding:17px 0;border-top:1px solid #536075;font:27px P;letter-spacing:-.4px;white-space:nowrap}
li i{font:normal 17px monospace;color:#f4c430;letter-spacing:1px}
.phone{position:absolute;right:46px;top:166px;width:540px;filter:drop-shadow(0 34px 50px rgb(0 0 0/.6))}
.chip{position:absolute;left:${a.chipLeft||300}px;top:${a.chipTop}px;display:flex;align-items:center;gap:12px;background:#f6f1e7;color:#151a23;font:25px B;padding:17px 24px 17px 20px;border-radius:16px;box-shadow:0 18px 40px rgb(0 0 0/.55);transform:rotate(-3deg);white-space:nowrap}
.cta{position:absolute;left:64px;top:1122px;width:410px;background:#eef0f4;color:#11141b;border-radius:14px;padding:25px 24px;font:23px B;display:flex;justify-content:space-between;align-items:center;white-space:nowrap}
.cta svg{width:26px;height:26px;flex:none}
.foot{position:absolute;left:64px;top:1232px;width:420px;color:#7f8ca3;font:12px/1.8 monospace;letter-spacing:1px;white-space:nowrap}
</style><div class="field">${symbol}</div><main>
<header><span class="brand">${symbol}IMÁN</span><span class="who">PARA AGENCIAS DE AUTOS</span></header>
<div class="col"><div class="tag">WHATSAPP + IA</div><h1>${a.title}</h1><p class="lead">${a.lead}</p>
<ul>${list.map((t,i)=>`<li><i>0${i+1}</i>${t}</li>`).join('')}</ul></div>
<img class="phone" src="${phone(a.shot)}">
<div class="chip">${a.chip[0]}${a.chip[1]}</div>
<div class="cta"><span>Pedí la demo por WhatsApp</span><svg viewBox="0 0 24 24" fill="none" stroke="#11141b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M8 6h10v10"/></svg></div>
<div class="foot">IMAN.AR · DEMO ILUSTRATIVA, DATOS DE EJEMPLO${a.shot.endsWith('a2')?'<br>FOTO: JUST A MAN / WIKIMEDIA COMMONS, CC BY 4.0':''}</div>
</main>`}
const jobs=[['a-feed',ads.a,false],['a-story',ads.a,true],['b-feed',ads.b,false]];
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',PORT=9339,UD=`/tmp/iman_ads_${Date.now()}`;
const chrome=spawn(CHROME,['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${PORT}`,'--remote-allow-origins=*',`--user-data-dir=${UD}`,'about:blank'],{stdio:'ignore'});
try{
let ver;for(let i=0;i<75&&!ver;i++){try{ver=await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()}catch{await sleep(200)}}
const ws=new WebSocket(ver.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}});
const send=(method,params={},sessionId)=>new Promise((res,rej)=>{const i=++id;pending.set(i,m=>m.error?rej(new Error(method+JSON.stringify(m.error))):res(m.result));ws.send(JSON.stringify({id:i,method,params,sessionId}))});
const {targetId}=await send('Target.createTarget',{url:'about:blank'});const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
for(const [name,ad,story] of jobs){const file=path.join(dir,name+'.html');writeFileSync(file,html(ad,story));
 await send('Emulation.setDeviceMetricsOverride',{width:1080,height:story?1920:1350,deviceScaleFactor:1,mobile:false},sessionId);
 await send('Page.navigate',{url:'file://'+file},sessionId);await sleep(1200);
 // El texto de la columna no puede pisar el teléfono ni el botón.
 const {result}=await send('Runtime.evaluate',{expression:`document.fonts.ready.then(()=>{const r=s=>document.querySelector(s).getBoundingClientRect(),c=r('.col'),p=r('.phone'),b=r('.cta');return [...document.querySelectorAll('h1,.lead,li')].every(e=>e.scrollWidth<=e.clientWidth+1)&&c.bottom<b.top-20&&c.right<p.left+8})`,awaitPromise:true,returnByValue:true},sessionId);
 if(!result.value)throw Error(`${name}: el texto desborda`);
 const {data}=await send('Page.captureScreenshot',{format:'png'},sessionId);writeFileSync(path.join(dir,name+'.png'),Buffer.from(data,'base64'));rmSync(file);}
ws.close();console.log(`${jobs.length} piezas renderizadas.`);
}finally{chrome.kill();try{rmSync(UD,{recursive:true,force:true})}catch{}}

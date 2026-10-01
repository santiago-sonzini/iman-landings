// Captura el teléfono de la demo de concesionaria (~/Desktop/Agentes/demo-concesionaria, puerto 5180)
// en tres momentos del guion de Mercado Libre. PNG con fondo transparente en ./phone/.
// Uso: levantar la demo (npm run dev) y después `node capture.mjs [claro|oscuro]`.
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {writeFileSync,mkdirSync,rmSync} from 'node:fs';
import path from 'node:path';
const dir=path.dirname(new URL(import.meta.url).pathname),out=path.join(dir,'phone');mkdirSync(out,{recursive:true});
const tema=process.argv[2]||'claro',URL_DEMO='http://localhost:5180/#/telefono';
// El reloj de la demo usa la hora real: se corre a las 23:40 para que la escena sea «fuera de horario».
const boot=`(()=>{const t=new Date();t.setHours(23,40,8,0);const off=t.getTime()-Date.now(),D=Date;
class F extends D{constructor(...a){a.length?super(...a):super(D.now()+off)}static now(){return D.now()+off}}
window.Date=F;
localStorage.setItem('demo-concesionaria:pantalla',JSON.stringify({theme:'oscuro',whatsapp:'${tema}',controls:false,speed:1,dock:false}));})()`;
const css=`html,body,#root,#root *:not(.phone):not(.phone *){background:transparent!important;border-color:transparent!important;box-shadow:none!important}
.phone-page-controls,.phone-caption,.demo-controls,.demo-run{display:none!important}.phone{box-shadow:0 0 0 1.5px #2b2b2e!important}`;
const shots=[['a2','Está en $ 30.900.000'],['a3','usado para entregar?'],['b','Traé el DNI']];
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',PORT=9338,UD=`/tmp/iman_ads_${Date.now()}`;
const chrome=spawn(CHROME,['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${PORT}`,'--remote-allow-origins=*',`--user-data-dir=${UD}`,'about:blank'],{stdio:'ignore'});
try{
let ver;for(let i=0;i<75&&!ver;i++){try{ver=await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()}catch{await sleep(200)}}
const ws=new WebSocket(ver.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}});
const send=(method,params={},sessionId)=>new Promise((res,rej)=>{const i=++id;pending.set(i,m=>m.error?rej(new Error(method+JSON.stringify(m.error))):res(m.result));ws.send(JSON.stringify({id:i,method,params,sessionId}))});
const {targetId}=await send('Target.createTarget',{url:'about:blank'});const {sessionId:s}=await send('Target.attachToTarget',{targetId,flatten:true});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true},s)).result.value;
await send('Page.enable',{},s);
await send('Emulation.setDeviceMetricsOverride',{width:520,height:1040,deviceScaleFactor:2.5,mobile:false},s);
await send('Emulation.setDefaultBackgroundColorOverride',{color:{r:0,g:0,b:0,a:0}},s);
await send('Page.addScriptToEvaluateOnNewDocument',{source:boot},s);
await send('Page.navigate',{url:URL_DEMO},s);await sleep(2500);
await ev(`(()=>{const st=document.createElement('style');st.textContent=${JSON.stringify(css)};document.head.append(st)})()`);
await ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'1',bubbles:true}))`);
const meta={tema};
for(const [name,needle] of shots){
 let ok=false;for(let i=0;i<900&&!ok;i++){ok=await ev(`(document.querySelector('.wa-messages')?.innerText||'').includes(${JSON.stringify(needle)})`);if(!ok)await sleep(150)}
 if(!ok)throw Error(`No llegó el mensaje «${needle}»`);
 await sleep(450);
 const r=await ev(`(()=>{const b=document.querySelector('.phone').getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}})()`);
 meta[name]={leyenda:await ev(`document.querySelector('.phone-caption')?.innerText||''`),ancho:r.width,alto:r.height};
 const {data}=await send('Page.captureScreenshot',{format:'png',clip:{x:r.x-2,y:r.y-2,width:r.width+4,height:r.height+4,scale:1}},s);
 writeFileSync(path.join(out,`${tema}-${name}.png`),Buffer.from(data,'base64'));console.log('ok',name,meta[name].leyenda);
}
writeFileSync(path.join(out,`${tema}.json`),JSON.stringify(meta,null,1));ws.close();
}finally{chrome.kill();try{rmSync(UD,{recursive:true,force:true})}catch{}}

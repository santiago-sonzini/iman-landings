// Carrusel 30/09/2026 — Tarjeta del club en Wallet: qué va adelante y qué atrás.
// Uso: node build.mjs → 01–06.html/png. Chrome headless por DevTools (sin dependencias).
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {readFileSync,writeFileSync,rmSync} from 'node:fs';
import path from 'node:path';
const dir=path.dirname(new URL(import.meta.url).pathname),assets=path.resolve(dir,'../../experience/assets');
const font=n=>readFileSync(path.join(assets,n)).toString('base64');
const D=font('playfair-display-sc.ttf'),B=font('libre-baskerville-regular.ttf');
const card=(rows,label)=>`<div class="card"><div class="clabel">${label}</div>${rows.map(([k,v])=>`<div class="row"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
const slides=[
 {tag:'CLUB DE CLIENTES · WALLET',title:'Tu tarjeta de club<br>en el celular:<br>qué va adelante<br>y qué va atrás.',body:`<p class="lead">Si todo entra en el frente,<br>no se lee nada en la caja.</p><pre class="ascii">┌──────────────┐   ┌──────────────┐
│  ADELANTE    │   │  ATRÁS       │
│  lo que se   │   │  lo que se   │
│  mira en 2″  │   │  consulta    │
└──────────────┘   └──────────────┘</pre><p class="fine">Un criterio simple, en cuatro pasos →</p>`,cover:true},
 {tag:'01 · ADELANTE',title:'Lo que el cliente<br>necesita en la caja.',body:`<ul class="list"><li><b>Nombre del club</b><span>para reconocerla entre otras tarjetas</span></li><li><b>Su estado</b><span>sellos, puntos o saldo: un solo dato principal</span></li><li><b>El próximo premio</b><span>qué le falta para llegar</span></li><li><b>El código</b><span>para que caja registre sin preguntar</span></li></ul>`},
 {tag:'02 · ATRÁS',title:'Lo que se consulta<br>una vez y listo.',body:`<ul class="list"><li><b>Condiciones</b><span>dónde vale el premio y cuándo vence</span></li><li><b>Cómo canjear</b><span>en una o dos líneas</span></li><li><b>Contacto</b><span>dirección, horario, WhatsApp</span></li><li><b>Cómo dejar de recibir avisos</b><span>claro y fácil de encontrar</span></li></ul><p class="fine">En Apple Wallet se llama dorso; en Google Wallet,<br>vista de detalles. Cada una tiene su formato.</p>`},
 {tag:'03 · UN EJEMPLO',title:'Una cafetería,<br>dos caras.',body:card([['CLUB','Café de la esquina'],['SELLOS','7 de 10'],['PRÓXIMO','Café de filtro']],'ADELANTE')+card([['VALE','En el local, 90 días'],['CANJE','Mostrá el código en caja'],['AVISOS','Podés desactivarlos']],'ATRÁS')},
 {tag:'04 · CUANDO ALGO CAMBIA',title:'Cambiar un dato<br>no es mandar un aviso.',body:`<p class="lead">En Apple Wallet, que un cambio muestre<br>una notificación depende de que el campo<br>tenga definido un mensaje de cambio.</p><pre class="ascii flow">pase guardado  ≠  aviso visto  ≠  visita</pre><p class="fine">Por eso conviene elegir qué cambios<br>merecen aviso: pocos y útiles.</p>`},
 {tag:'LA DECISIÓN DE TU NEGOCIO',title:'Si pudieras mostrar<br>un solo dato,<br>¿cuál sería?',body:`<div class="choices"><span>Sellos</span><span>Saldo</span><span>Próximo premio</span></div><p class="fine">Contá tu rubro y qué mirarían<br>tus clientes en la caja.</p>`}
];
const N=slides.length;
function html(s,i){return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(data:font/ttf;base64,${D})}@font-face{font-family:B;src:url(data:font/ttf;base64,${B})}*{box-sizing:border-box}body{margin:0;width:1080px;height:1350px;background:#11141b;color:#eef0f4;font-family:B}main{position:relative;width:1080px;height:1350px;padding:65px 76px;overflow:hidden}header{display:flex;justify-content:space-between;border-bottom:1px solid #94a4bc66;padding-bottom:31px;color:#aab7cb;font:20px monospace;letter-spacing:2px}.brand{color:#eef0f4;font:30px P}.tag{margin:46px 0 37px;color:#94a4bc;font:22px monospace;letter-spacing:2px}.tag i{color:#f4c430;font-style:normal}h1{font:normal 77px/1.15 P;margin:0 0 40px;letter-spacing:-3px}.cover h1{font-size:84px;margin-top:40px}.lead{font:32px/1.6 B;color:#c8d0dc;margin:36px 0}.fine{font:24px/1.6 B;color:#a3afc2;margin:30px 0}.ascii{font:24px/1.35 monospace;color:#94a4bc;margin:40px 0}.flow{font-size:27px;color:#eef0f4;border-top:1px solid #526075;border-bottom:1px solid #526075;padding:30px 0;text-align:center}.list{list-style:none;padding:0;margin:20px 0}.list li{padding:22px 0;border-bottom:1px solid #536075;display:flex;flex-direction:column;gap:10px}.list b{font:normal 46px P}.list span{font:26px/1.5 B;color:#b9c3d4}.card{border:1px solid #8190a8;background:#19212d;padding:26px 34px;margin:0 0 26px}.card+.card{background:#151b25;border-color:#536075}.clabel{color:#aab7cb;font:20px monospace;letter-spacing:2px;margin-bottom:8px}.row{display:flex;justify-content:space-between;align-items:baseline;padding:13px 0;border-bottom:1px solid #53607555}.row:last-child{border:0}.row span{font:20px monospace;color:#94a4bc;letter-spacing:2px}.row b{font:normal 34px B}.choices{display:flex;flex-wrap:wrap;gap:18px;margin:50px 0}.choices span{border:1px solid #7d8ca4;padding:25px 28px;font:32px B}.footer{position:absolute;bottom:62px;left:76px;right:76px;border-top:1px solid #94a4bc66;padding-top:26px;display:flex;justify-content:space-between;color:#94a4bc;font:18px monospace;letter-spacing:1px}.footer b{color:#f4c430;font-weight:normal}
</style><main class="${s.cover?'cover':''}"><header><span class="brand">IMÁN</span><span>IDEAS PARA TU NEGOCIO</span></header><div class="tag">${s.tag.replace(/^(\d\d)/,'<i>$1</i>')}</div><h1>${s.title}</h1>${s.body}<div class="footer"><span>${i===3?'EJEMPLO HIPOTÉTICO · NO ES UN CASO REAL':'ESTUDIO.IMAN'}</span><span><b>0${i+1}</b> / 0${N}</span></div></main>`}
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',PORT=9337,UD=`/tmp/iman_carrusel_${Date.now()}`;
const chrome=spawn(CHROME,['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${PORT}`,'--remote-allow-origins=*',`--user-data-dir=${UD}`,'about:blank'],{stdio:'ignore'});
try{
let ver;for(let i=0;i<75&&!ver;i++){try{ver=await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()}catch{await sleep(200)}}
const ws=new WebSocket(ver.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}});
const send=(method,params={},sessionId)=>new Promise((res,rej)=>{const i=++id;pending.set(i,m=>m.error?rej(new Error(method+JSON.stringify(m.error))):res(m.result));ws.send(JSON.stringify({id:i,method,params,sessionId}))});
const {targetId}=await send('Target.createTarget',{url:'about:blank'});const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
await send('Emulation.setDeviceMetricsOverride',{width:1080,height:1350,deviceScaleFactor:1,mobile:false},sessionId);
for(let i=0;i<N;i++){const file=path.join(dir,`0${i+1}.html`);writeFileSync(file,html(slides[i],i));
 await send('Page.navigate',{url:'file://'+file},sessionId);await sleep(900);
 const {result}=await send('Runtime.evaluate',{expression:`document.fonts.ready.then(()=>{const f=document.querySelector('.footer'),p=f.previousElementSibling;return p.getBoundingClientRect().bottom<f.getBoundingClientRect().top-12})`,awaitPromise:true,returnByValue:true},sessionId);
 if(!result.value)throw Error(`Lámina ${i+1} pisa el pie`);
 const {data}=await send('Page.captureScreenshot',{format:'png'},sessionId);writeFileSync(path.join(dir,`0${i+1}.png`),Buffer.from(data,'base64'));}
ws.close();console.log(`${N} láminas renderizadas; margen del pie verificado.`);
}finally{chrome.kill();try{rmSync(UD,{recursive:true,force:true})}catch{}}

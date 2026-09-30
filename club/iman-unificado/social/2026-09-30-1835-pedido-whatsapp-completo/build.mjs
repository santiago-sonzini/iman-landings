// Carrusel 30/09/2026 (18 h) — Pedido por WhatsApp completo: cinco datos desde el catálogo.
// Uso: node build.mjs → 01–06.html/png. Chrome headless por DevTools (sin dependencias).
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {readFileSync,writeFileSync,rmSync} from 'node:fs';
import path from 'node:path';
const dir=path.dirname(new URL(import.meta.url).pathname),assets=path.resolve(dir,'../../experience/assets');
const font=n=>readFileSync(path.join(assets,n)).toString('base64');
const D=font('playfair-display-sc.ttf'),B=font('libre-baskerville-regular.ttf');
const slides=[
 {tag:'CATÁLOGO · PEDIDOS POR WHATSAPP',title:'Un pedido<br>por WhatsApp<br>que no necesita<br>ida y vuelta.',body:`<p class="lead">Cinco datos que tiene que traer<br>antes de llegar a tu celular.</p><pre class="ascii">catálogo  ──►  mensaje armado  ──►  vos
          (qué, cuánto, precio,
           entrega, quién)</pre>`,cover:true},
 {tag:'EL PROBLEMA',title:'«Hola, quiero<br>tres de las azules».',body:`<pre class="ascii chat">¿Cuáles azules?
¿Qué talle?
¿Por unidad o por caja?
¿Retirás o te lo mando?
¿A nombre de quién?</pre><p class="fine">Cada pregunta es un mensaje más<br>y un cliente esperando la respuesta.</p>`},
 {tag:'01–02 · QUÉ Y CUÁNTO',title:'El producto exacto<br>y la cantidad.',body:`<ul class="list"><li><b>Código y variante</b><span>el SKU, más talle, color o presentación</span></li><li><b>Cantidad en tu unidad</b><span>unidad, caja o bulto, como lo vendés vos</span></li></ul><p class="fine">Si el catálogo obliga a elegir la variante,<br>el «¿cuál?» desaparece.</p>`},
 {tag:'03–05 · PRECIO, ENTREGA, QUIÉN',title:'Lo que evita<br>la segunda charla.',body:`<ul class="list"><li><b>Qué lista aplica</b><span>minorista o mayorista, y de qué fecha</span></li><li><b>Cómo lo recibe</b><span>retiro o envío, y a qué zona</span></li><li><b>Quién pide</b><span>nombre o cuenta, para cargarlo sin retipear</span></li></ul>`},
 {tag:'UN EJEMPLO',title:'Así llega<br>al chat.',body:`<div class="card"><div class="clabel">MENSAJE ARMADO POR EL CATÁLOGO</div><pre class="msg">PEDIDO · Almacén Ejemplo
2 × Alimento adulto 15 kg
    (ALI-15)
1 × Piedras sanitarias
    caja × 4 (PIE-04)
Lista mayorista · al 30/09
Entrega: envío, zona norte</pre></div><p class="fine">WhatsApp permite abrir un chat con un<br>mensaje predefinido en el campo de texto:<br>el cliente lo revisa y lo envía.</p>`},
 {tag:'LO QUE NO RESUELVE',title:'Armar el pedido<br>no es confirmarlo.',body:`<p class="lead">Si el stock del catálogo no está<br>conectado a tu sistema de gestión,<br>confirmá disponibilidad antes de cobrar.</p><pre class="ascii flow">pedido completo  ≠  pedido confirmado</pre><p class="fine">El catálogo ordena la información;<br>la decisión sigue siendo tuya.</p>`},
 {tag:'LA DECISIÓN DE TU NEGOCIO',title:'¿Qué dato te falta<br>más seguido<br>en un pedido?',body:`<div class="choices"><span>La variante</span><span>La cantidad</span><span>La entrega</span></div><p class="fine">Contá tu rubro y cómo te llegan<br>hoy los pedidos.</p>`}
];
const N=slides.length;
function html(s,i){return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(data:font/ttf;base64,${D})}@font-face{font-family:B;src:url(data:font/ttf;base64,${B})}*{box-sizing:border-box}body{margin:0;width:1080px;height:1350px;background:#11141b;color:#eef0f4;font-family:B}main{position:relative;width:1080px;height:1350px;padding:65px 76px;overflow:hidden}header{display:flex;justify-content:space-between;border-bottom:1px solid #94a4bc66;padding-bottom:31px;color:#aab7cb;font:20px monospace;letter-spacing:2px}.brand{color:#eef0f4;font:30px P}.tag{margin:46px 0 37px;color:#94a4bc;font:22px monospace;letter-spacing:2px}.tag i{color:#f4c430;font-style:normal}h1{font:normal 77px/1.15 P;margin:0 0 40px;letter-spacing:-3px}.cover h1{font-size:84px;margin-top:40px}.lead{font:32px/1.6 B;color:#c8d0dc;margin:36px 0}.fine{font:24px/1.6 B;color:#a3afc2;margin:30px 0}.ascii{font:24px/1.35 monospace;color:#94a4bc;margin:40px 0}.flow{font-size:27px;color:#eef0f4;border-top:1px solid #526075;border-bottom:1px solid #526075;padding:30px 0;text-align:center}.list{list-style:none;padding:0;margin:20px 0}.list li{padding:22px 0;border-bottom:1px solid #536075;display:flex;flex-direction:column;gap:10px}.list b{font:normal 46px P}.list span{font:26px/1.5 B;color:#b9c3d4}.card{border:1px solid #8190a8;background:#19212d;padding:26px 34px;margin:0 0 26px}.card+.card{background:#151b25;border-color:#536075}.clabel{color:#aab7cb;font:20px monospace;letter-spacing:2px;margin-bottom:8px}.row{display:flex;justify-content:space-between;align-items:baseline;padding:13px 0;border-bottom:1px solid #53607555}.row:last-child{border:0}.row span{font:20px monospace;color:#94a4bc;letter-spacing:2px}.row b{font:normal 34px B}.chat{color:#c8d0dc;font-size:30px;line-height:1.75;border-left:1px solid #536075;padding-left:30px}.msg{font:27px/1.5 monospace;color:#eef0f4;margin:10px 0 0}.choices{display:flex;flex-wrap:wrap;gap:18px;margin:50px 0}.choices span{border:1px solid #7d8ca4;padding:25px 28px;font:32px B}.footer{position:absolute;bottom:62px;left:76px;right:76px;border-top:1px solid #94a4bc66;padding-top:26px;display:flex;justify-content:space-between;color:#94a4bc;font:18px monospace;letter-spacing:1px}.footer b{color:#f4c430;font-weight:normal}
</style><main class="${s.cover?'cover':''}"><header><span class="brand">IMÁN</span><span>IDEAS PARA TU NEGOCIO</span></header><div class="tag">${s.tag.replace(/^(\d\d)/,'<i>$1</i>')}</div><h1>${s.title}</h1>${s.body}<div class="footer"><span>${i===4?'EJEMPLO HIPOTÉTICO · NO ES UN CASO REAL':'ESTUDIO.IMAN'}</span><span><b>0${i+1}</b> / 0${N}</span></div></main>`}
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

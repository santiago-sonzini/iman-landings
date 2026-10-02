// Captures the live demos shown on the home (cafe.iman.ar, the Grano Norte catalog) via Chrome DevTools.
// Usage: node scripts/capture-demos.mjs [name]  → club/tmp/demo-captures/*.png; the cropped WebP used by the home live in experience/assets/shots/
// CATALOG_URL points the catalog shots at another host, e.g. a local run of the template before it is deployed.
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {writeFileSync,mkdirSync} from 'node:fs';

const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT=9334, OUT=new URL('../../tmp/demo-captures/',import.meta.url).pathname;
mkdirSync(OUT,{recursive:true});
const ONLY=process.argv[2];
const CATALOG=process.env.CATALOG_URL||'https://template-eccomerce.vercel.app/demo/grano-norte';
const SHOTS=[
  {name:'cafe-mobile',url:'https://cafe.iman.ar/',w:390,h:844,mobile:true},
  {name:'cafe-club-mobile',url:'https://cafe.iman.ar/club',w:390,h:844,mobile:true},
  {name:'cafe-desktop',url:'https://cafe.iman.ar/',w:1440,h:900,mobile:false},
  {name:'cafe-desktop-long',url:'https://cafe.iman.ar/',w:1440,h:2600,mobile:false,dsf:1.25},
  {name:'cafe-mobile-long',url:'https://cafe.iman.ar/',w:390,h:2600,mobile:true},
  {name:'grano-desktop-long',url:CATALOG,w:1440,h:2500,mobile:false,dsf:1.25},
  {name:'grano-mobile-long',url:CATALOG,w:390,h:3400,mobile:true},
  {name:'grano-desktop',url:CATALOG,w:1440,h:900,mobile:false},
  {name:'grano-mobile',url:CATALOG,w:390,h:844,mobile:true},
];
const chrome=spawn(CHROME,['--headless=old','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${PORT}`,'--remote-allow-origins=*',`--user-data-dir=/tmp/iman_demo_cap_${Date.now()}`,'about:blank'],{stdio:'ignore'});
let ver;for(let i=0;i<60&&!ver;i++){try{ver=await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()}catch{await sleep(200)}}
const ws=new WebSocket(ver.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),waiters=[];
ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}else if(m.method)waiters.slice().forEach(w=>w(m))});
const send=(method,params={},sessionId)=>new Promise((res,rej)=>{const i=++id;pending.set(i,m=>m.error?rej(new Error(method+JSON.stringify(m.error))):res(m.result));ws.send(JSON.stringify({id:i,method,params,sessionId}))});
const next=(method,sid)=>new Promise(res=>{const w=m=>{if(m.method===method&&m.sessionId===sid){waiters.splice(waiters.indexOf(w),1);res(m.params)}};waiters.push(w)});
for(const s of SHOTS.filter(x=>!ONLY||x.name.startsWith(ONLY))){
  const {targetId}=await send('Target.createTarget',{url:'about:blank'});
  const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
  await send('Page.enable',{},sessionId);
  await send('Emulation.setDeviceMetricsOverride',{width:s.w,height:s.h,deviceScaleFactor:s.dsf||2,mobile:s.mobile},sessionId);
  if(s.mobile)await send('Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'},sessionId);
  const loaded=next('Page.loadEventFired',sessionId);
  await send('Page.navigate',{url:s.url},sessionId);await loaded;await sleep(4500);
  if(s.anchor){await send('Runtime.evaluate',{expression:`[...document.querySelectorAll('h1,h2,h3')].find(h=>h.textContent.includes(${JSON.stringify(s.anchor)}))?.scrollIntoView({block:'start'});scrollBy(0,-90)`},sessionId);await sleep(2500)}
  if(s.scroll){await send('Runtime.evaluate',{expression:`scrollTo(0,${s.scroll})`},sessionId);await sleep(2500)}
  const {data}=await send('Page.captureScreenshot',{format:'png'},sessionId);
  writeFileSync(OUT+s.name+'.png',Buffer.from(data,'base64'));console.log('saved',s.name);
  await send('Target.closeTarget',{targetId});
}
ws.close();chrome.kill();process.exit(0);

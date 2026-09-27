import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createContactHandler } from '../contact.mjs';
import { confirmationEmail } from '../email.mjs';

const env = {FROM_EMAIL:'hola@iman.ar',CONTACT_HASH_SECRET:'fake-test-secret-at-least-32-characters',EMAIL:{send:async()=>({messageId:'test'})},CONTACT_EMAIL:'sales@example.com'};
const base = {nombre:'Sofía',negocio:'Almacén Central',email:'sofia@example.com',servicio:'IMAN Fidelización',consentimiento:true,whatsapp:'+54 9 353 111-2222',comentario:'Quiero mejorar la recompra',source:'/fidelizacion/?token=private',utm_source:'google'};
function request(changes = {}, headers = {}) {
  return new Request('https://www.iman.ar/api/contacto',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.iman.ar','CF-Connecting-IP':'192.0.2.10','Idempotency-Key':crypto.randomUUID(),...headers},body:JSON.stringify({...base,...changes})});
}
function setup(options = {}) {
  const sent = [];
  const logs = [];
  return {sent,logs,handle:createContactHandler({sendMail:async message=>sent.push(message),report:code=>logs.push(code),allowInMemory:true,...options})};
}
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../schema.sql',import.meta.url),'utf8'));
  function prepare(sql) {
    let values = [];
    const stmt = {bind(...args){values=args;return stmt;},async first(){return sqlite.prepare(sql).get(...values)||null;},async run(){const result=sqlite.prepare(sql).run(...values);return {meta:{changes:Number(result.changes)}};}};
    return stmt;
  }
  return {prepare,batch:items=>Promise.all(items.map(item=>item.run())),sqlite};
}

test('accepted lead is delivered to owner before client; response links Calendly',async()=>{
  const {handle,sent}=setup();
  const response=await handle(request(),env);
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ok:true,confirmationSent:true,calendlyUrl:'https://calendly.com/santiago-iman/30min'});
  assert.equal(sent.length,2);
  assert.equal(sent[0].to,'sales@example.com');
  assert.equal(sent[0].replyTo,'sofia@example.com');
  assert.equal(sent[1].to,'sofia@example.com');
  assert.equal(sent[1].replyTo,'sales@example.com');
  assert.match(sent[0].text,/Página: \/fidelizacion\//);
  assert.doesNotMatch(sent[0].text,/token=private/);
  assert.equal(response.headers.get('cache-control'),'no-store');
});
test('owner failure is not success and sends no client confirmation',async()=>{
  let count=0;
  const {handle,logs}=setup({sendMail:async()=>{count++;throw new Error('private:password');}});
  const response=await handle(request(),env);
  assert.equal(response.status,502);
  assert.equal((await response.json()).ok,false);
  assert.equal(count,1);
  assert.deepEqual(logs,['contact_owner_delivery_failed']);
});
test('confirmation failure preserves accepted lead while reporting confirmationSent false',async()=>{
  let count=0;
  const {handle}=setup({sendMail:async()=>{if(++count===2)throw new Error('recipient unavailable');}});
  const response=await handle(request(),env);
  assert.equal(response.status,200);
  assert.equal((await response.json()).confirmationSent,false);
});
test('missing mail config fails closed without attempting delivery',async()=>{
  const {handle,sent}=setup();
  assert.equal((await handle(request(),{})).status,503);
  assert.equal(sent.length,0);
});
test('production handler requires durable D1 abuse control and dedupe',async()=>{
  const {handle,sent}=setup({allowInMemory:false});
  assert.equal((await handle(request(),env)).status,503);
  assert.equal(sent.length,0);
});
test('untrusted origin, no origin, cross-site fetch, method and media type rejected',async()=>{
  const {handle,sent}=setup();
  assert.equal((await handle(request({}, {Origin:'https://evil.example'}),env)).status,403);
  assert.equal((await handle(request({}, {Origin:''}),env)).status,403);
  assert.equal((await handle(request({}, {'Sec-Fetch-Site':'cross-site'}),env)).status,403);
  assert.equal((await handle(new Request('https://www.iman.ar/api/contacto'),env)).status,405);
  assert.equal((await handle(request({}, {'Content-Type':'text/plain'}),env)).status,415);
  assert.equal(sent.length,0);
});
test('validation blocks bad addresses, unknown service, missing consent and oversized fields',async()=>{
  const {handle,sent}=setup();
  for(const changes of [{email:'user@example.com\r\nBcc: bad@example.com'},{servicio:'Something else'},{consentimiento:'true'},{consentimiento:false},{nombre:''},{comentario:'a'.repeat(2001)},{whatsapp:'javascript:alert(1)'},{utm_source:[]},{utm:{utm_campaign:'x'.repeat(181)}}]) {
    assert.equal((await handle(request(changes),env)).status,400);
  }
  assert.equal(sent.length,0);
});
test('chunked request size is capped even without Content-Length',async()=>{
  const {handle,sent}=setup();
  const oversized=new Request('https://www.iman.ar/api/contacto',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.iman.ar'},body:JSON.stringify({comentario:'x'.repeat(13_000)})});
  assert.equal((await handle(oversized,env)).status,413);
  assert.equal(sent.length,0);
});
test('honeypot silently accepts without sending or requiring mail credentials',async()=>{
  const {handle,sent}=setup();
  assert.equal((await handle(request({sitio_web_empresa:'bot filled this'}),{})).status,200);
  assert.equal(sent.length,0);
});
test('email content escapes user HTML and keeps one fixed booking CTA',async()=>{
  const {handle,sent}=setup();
  await handle(request({nombre:'<img src=x onerror=alert(1)>',negocio:'<script>alert(2)</script>',comentario:'<iframe>evil</iframe>'}),env);
  for(const mail of sent){assert.doesNotMatch(mail.html,/<script|<img|<iframe/);}
  const html=sent[1].html;
  assert.match(html,/&lt;img/);
  assert.equal((html.match(/href="https:\/\/calendly.com\/santiago-iman\/30min"/g)||[]).length,1);
  assert.match(sent[1].text,/https:\/\/calendly.com\/santiago-iman\/30min/);
});
test('same key + payload returns stored result and never resends',async()=>{
  const {handle,sent}=setup();
  const headers={'Idempotency-Key':'request_12345678901234567890'};
  const first=await handle(request({},headers),env);
  const second=await handle(request({},headers),env);
  assert.deepEqual(await second.json(),await first.json());
  assert.equal(sent.length,2);
  assert.equal((await handle(request({negocio:'Changed'},headers),env)).status,409);
});
test('concurrent duplicate waits rather than sending twice',async()=>{
  let release;
  const gate=new Promise(resolve=>release=resolve);
  let sends=0;
  const {handle}=setup({sendMail:async()=>{sends++;await gate;}});
  const headers={'Idempotency-Key':'concurrent_1234567890123456'};
  const first=handle(request({},headers),env);
  await new Promise(resolve=>setTimeout(resolve,20));
  const second=await handle(request({},headers),env);
  assert.equal(second.status,409);
  release();
  assert.equal((await first).status,200);
  assert.equal(sends,2);
});
test('D1 persists dedupe across fresh worker handlers without saving PII',async()=>{
  const db=database();
  const headers={'Idempotency-Key':'persistent_1234567890123456'};
  const first=setup(),second=setup();
  await first.handle(request({},headers),{...env,CONTACT_DB:db});
  assert.equal((await second.handle(request({},headers),{...env,CONTACT_DB:db})).status,200);
  assert.equal(first.sent.length,2);
  assert.equal(second.sent.length,0);
  const stored=JSON.stringify(db.sqlite.prepare('SELECT * FROM contact_requests').all());
  assert.doesNotMatch(stored,/sofia|Almacén|192\.0\.2/);
  db.sqlite.close();
});
test('recipient abuse limit prevents repeated arbitrary confirmation emails',async()=>{
  const {handle,sent}=setup();
  assert.equal((await handle(request(),env)).status,200);
  assert.equal((await handle(request(),env)).status,200);
  const response=await handle(request(),env);
  assert.equal(response.status,429);
  assert.ok(Number(response.headers.get('retry-after'))>0);
  assert.equal(sent.length,4);
});
test('D1 rate limit survives new edge instance and storage error does not send',async()=>{
  const db=database();
  for(let n=0;n<2;n++)assert.equal((await setup().handle(request(),{...env,CONTACT_DB:db})).status,200);
  assert.equal((await setup().handle(request(),{...env,CONTACT_DB:db})).status,429);
  db.sqlite.close();
  const {handle,sent}=setup();
  const broken={prepare(){throw new Error('db unavailable');}};
  assert.equal((await handle(request(),{...env,CONTACT_DB:broken})).status,503);
  assert.equal(sent.length,0);
});
test('confirmation email never promises deployed integrations or unverifiable timeframes',()=>{
  const mail=confirmationEmail(base);
  assert.match(mail.text,/vamos a revisarla/);
  assert.doesNotMatch(mail.text,/24 horas|ya está funcionando|garantizado/i);
});

test('rate-limited request can succeed with same key after quota window expires',async()=>{
  let clock=1_000_000;const {handle,sent}=setup({now:()=>clock});
  await handle(request(),env);await handle(request(),env);
  const headers={'Idempotency-Key':'limited_1234567890123456'};
  assert.equal((await handle(request({},headers),env)).status,429);
  clock+=3_600_001;
  assert.equal((await handle(request({},headers),env)).status,200);
  assert.equal(sent.length,6);
});
test('definite provider rejection can retry; ambiguous timeout remains deduplicated',async()=>{
  let sends=0;const {handle}=setup({sendMail:async()=>{if(++sends===1)throw Object.assign(new Error('test'),{code:'E_SENDER_NOT_VERIFIED'});}});
  const headers={'Idempotency-Key':'smtp_retry_1234567890123456'};
  const failure=await handle(request({},headers),env);assert.equal((await failure.json()).retryable,true);
  assert.equal((await handle(request({},headers),env)).status,200);assert.equal(sends,3);
  let ambiguous=0;const other=setup({sendMail:async()=>{ambiguous++;throw Object.assign(new Error('timeout'),{code:'ETIMEDOUT'});}});
  await other.handle(request({},headers),env);await other.handle(request({},headers),env);assert.equal(ambiguous,1);
});

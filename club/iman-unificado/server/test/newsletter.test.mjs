import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createNewsletterHandler } from '../newsletter.mjs';

const base={nombre:'Sofía',email:'sofia@example.com',rubro:'Almacén',consentimiento:true,sitio_web_empresa:''};
function setup(options={}) {
  const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../schema.sql',import.meta.url),'utf8'));
  const db={prepare(sql){let args=[];const stmt={bind(...values){args=values;return stmt;},async first(){return sqlite.prepare(sql).get(...args)||null;},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}};}};return stmt;},batch(items){return Promise.all(items.map(item=>item.run()));}};
  const sent=[];const logs=[];
  const env={FROM_EMAIL:'hola@iman.ar',CONTACT_HASH_SECRET:'fake-test-secret-at-least-32-characters',EMAIL:{send:async()=>({messageId:'test'})},CONTACT_EMAIL:'owner@example.com',CONTACT_DB:db};
  const handler=createNewsletterHandler({sendMail:async mail=>sent.push(mail),report:code=>logs.push(code),...options});
  return {sqlite,db,sent,logs,env,handler};
}
function subscribe(body={},headers={}) {return new Request('https://www.iman.ar/api/newsletter',{method:'POST',headers:{Origin:'https://www.iman.ar','Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1','Idempotency-Key':crypto.randomUUID(),...headers},body:JSON.stringify({...base,...body})});}
const link=(mail,type)=>mail.text.match(new RegExp(`https://www\\.iman\\.ar/api/newsletter/${type}\\?token=[A-Za-z0-9_-]+`))[0];
function postLink(url,headers={}){const parsed=new URL(url);return new Request(parsed.origin+parsed.pathname,{method:'POST',headers:{Origin:parsed.origin,'Content-Type':'application/x-www-form-urlencoded',...headers},body:new URLSearchParams({token:parsed.searchParams.get('token')})});}

test('newsletter sends branded double opt-in without subscribing on initial POST or link GET',async()=>{
  const {handler,env,sqlite,sent}=setup();
  const response=await handler(subscribe(),env);
  assert.equal(response.status,200);assert.equal((await response.json()).ok,true);assert.equal(sent.length,1);
  assert.equal(sqlite.prepare('SELECT status FROM newsletter_subscribers').get().status,'pending');
  const confirm=link(sent[0],'confirmar');
  const landing=await handler(new Request(confirm),env);
  assert.equal(landing.status,200);assert.match(await landing.text(),/method="post"/);
  assert.equal(landing.headers.get('referrer-policy'),'no-referrer');
  assert.equal(sqlite.prepare('SELECT status FROM newsletter_subscribers').get().status,'pending');
  assert.equal((await handler(postLink(confirm),env)).status,200);
  const row=sqlite.prepare('SELECT * FROM newsletter_subscribers').get();
  assert.equal(row.status,'subscribed');assert.equal(row.confirmation_hash.length,64);assert.ok(row.confirmed_at);
  assert.equal((await handler(postLink(confirm),env)).status,200);
  assert.equal(sent.length,2);
  sqlite.close();
});
test('tokens are cryptographically random and stored hashed, unsubscribe needs explicit POST',async()=>{
  const {handler,env,sqlite,sent}=setup();await handler(subscribe(),env);
  const confirm=link(sent[0],'confirmar'),unsubscribe=link(sent[0],'baja');
  const token=new URL(confirm).searchParams.get('token');assert.equal(token.length,43);
  const row=sqlite.prepare('SELECT * FROM newsletter_subscribers').get();
  assert.equal(row.confirmation_hash.length,64);assert.doesNotMatch(JSON.stringify(row),new RegExp(token));
  await handler(postLink(confirm),env);
  await handler(new Request(unsubscribe),env);
  assert.equal(sqlite.prepare('SELECT status FROM newsletter_subscribers').get().status,'subscribed');
  assert.equal((await handler(postLink(unsubscribe),env)).status,200);
  const unsub=sqlite.prepare('SELECT * FROM newsletter_subscribers').get();
  assert.equal(unsub.status,'unsubscribed');assert.equal(unsub.nombre,'');assert.equal(unsub.rubro,'');assert.equal(unsub.unsubscribe_hash,null);
  sqlite.close();
});
test('newsletter requires durable storage, credentials and explicit consent',async()=>{
  const {handler,env,sent,sqlite}=setup();
  assert.equal((await handler(subscribe(),{})).status,503);
  assert.equal((await handler(subscribe({consentimiento:false}),env)).status,400);
  assert.equal((await handler(subscribe({email:'bad\r\nBcc:bad@example.com'}),env)).status,400);
  assert.equal((await handler(subscribe({}, {Origin:'https://evil.example'}),env)).status,403);
  assert.equal(sent.length,0);sqlite.close();
});
test('same idempotency key does not resend and existing subscription status is not disclosed',async()=>{
  const {handler,env,sent,sqlite}=setup();const headers={'Idempotency-Key':'newsletter_123456789012345'};
  const first=await handler(subscribe({},headers),env);const second=await handler(subscribe({},headers),env);
  assert.deepEqual(await second.json(),await first.json());assert.equal(sent.length,1);
  await handler(postLink(link(sent[0],'confirmar')),env);
  const already=await handler(subscribe(),env);assert.equal(already.status,200);assert.equal((await already.json()).ok,true);assert.equal(sent.length,2);sqlite.close();
});
test('expired tokens and cross-origin confirmation cannot subscribe',async()=>{
  let clock=1_000_000;const {handler,env,sent,sqlite}=setup({now:()=>clock});
  await handler(subscribe(),env);const confirm=link(sent[0],'confirmar');
  assert.equal((await handler(postLink(confirm,{Origin:'https://evil.example'}),env)).status,403);
  clock+=172_800_001;assert.equal((await handler(postLink(confirm),env)).status,400);
  assert.equal(sqlite.prepare('SELECT status FROM newsletter_subscribers').get().status,'pending');sqlite.close();
});
test('delivery failure never claims confirmation and never exposes SMTP errors',async()=>{
  const {handler,env,logs,sqlite}=setup({sendMail:async()=>{throw new Error('fake-private-credentials');}});
  const response=await handler(subscribe(),env);assert.equal(response.status,502);assert.doesNotMatch(await response.text(),/fake-private/);
  assert.deepEqual(logs,['newsletter_confirmation_delivery_failed']);sqlite.close();
});
test('newsletter email escapes user markup and only uses canonical origin for token links',async()=>{
  const {handler,env,sent,sqlite}=setup();
  await handler(subscribe({nombre:'<img src=x>',rubro:'<script>bad</script>'}),{...env,SITE_URL:'https://evil.example/'});
  assert.doesNotMatch(sent[0].html,/<img src=x|<script/);assert.match(sent[0].html,/&lt;img/);
  assert.doesNotMatch(sent[0].text,/evil.example/);assert.match(sent[0].text,/https:\/\/www.iman.ar\/api\/newsletter\/confirmar/);sqlite.close();
});

test('welcome is sent once after explicit confirmation and includes actionable ideas + unsubscribe',async()=>{
  const {handler,env,sent,sqlite}=setup();await handler(subscribe(),env);
  const confirm=link(sent[0],'confirmar');await handler(postLink(confirm),env);await handler(postLink(confirm),env);
  assert.equal(sent.length,2);assert.match(sent[1].subject,/Bienvenido/);
  assert.match(sent[1].text,/Dale un motivo para volver/);assert.match(sent[1].text,/Elegí el momento/);assert.match(sent[1].text,/Medí la segunda compra/);
  assert.match(sent[1].text,/recursos\/recuperar-clientes/);
  const row=sqlite.prepare('SELECT * FROM newsletter_subscribers').get();assert.equal(row.welcome_state,'sent');assert.equal(row.welcome_attempts,1);
  assert.equal((await handler(postLink(link(sent[1],'baja')),env)).status,200);sqlite.close();
});
test('definite welcome rejection can be retried, ambiguous send cannot produce duplicate welcome',async()=>{
  let calls=0;const sent=[];
  const {handler,env,sqlite}=setup({sendMail:async mail=>{calls++;if(calls===2)throw Object.assign(new Error('not sent'),{code:'E_RATE_LIMIT_EXCEEDED'});sent.push(mail);}});
  await handler(subscribe(),env);const confirm=link(sent[0],'confirmar');
  await handler(postLink(confirm),env);assert.equal(sqlite.prepare('SELECT welcome_state FROM newsletter_subscribers').get().welcome_state,'failed');
  await handler(postLink(confirm),env);assert.equal(sqlite.prepare('SELECT welcome_state FROM newsletter_subscribers').get().welcome_state,'sent');assert.equal(calls,3);sqlite.close();
  let attempts=0;const kept=[];const other=setup({sendMail:async mail=>{if(++attempts===2)throw new Error('timeout');kept.push(mail);}});
  await other.handler(subscribe(),other.env);const another=link(kept[0],'confirmar');await other.handler(postLink(another),other.env);await other.handler(postLink(another),other.env);assert.equal(attempts,2);assert.equal(other.sqlite.prepare('SELECT welcome_state FROM newsletter_subscribers').get().welcome_state,'unknown');other.sqlite.close();
});

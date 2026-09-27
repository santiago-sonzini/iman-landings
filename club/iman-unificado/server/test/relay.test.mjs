import test from 'node:test';
import assert from 'node:assert/strict';
import relay from '../mail-relay.mjs';
import worker from '../worker.mjs';

const payload={to:'visitor@example.com',replyTo:'owner@example.com',subject:'Consulta IMAN',html:'<p>Hola</p>',text:'Hola'};
const internal=(mail=payload,url='https://iman-correo.internal/send')=>new Request(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(mail)});
test('relay only accepts internal hostname and exact endpoint',async()=>{
  let sends=0;const env={EMAIL:{send:async()=>{sends++;return {messageId:'fake'};}}};
  assert.equal((await relay.fetch(internal(payload,'https://iman-correo.example.workers.dev/send'),env)).status,403);
  assert.equal((await relay.fetch(internal(payload,'https://iman-correo.internal/anything'),env)).status,403);
  assert.equal((await relay.fetch(new Request('https://iman-correo.internal/send'),env)).status,403);
  assert.equal(sends,0);
});
test('relay forces IMAN sender, removes hidden recipients and returns provider acceptance',async()=>{
  let received;const env={EMAIL:{send:async mail=>{received=mail;return {messageId:'fake-123'};}}};
  const response=await relay.fetch(internal({...payload,from:'evil@example.com',bcc:'secret@example.com',headers:{Bcc:'secret@example.com'}}),env);
  assert.deepEqual(await response.json(),{messageId:'fake-123'});
  assert.deepEqual(received.from,{name:'IMAN',email:'hola@iman.ar'});
  assert.equal(received.bcc,undefined);assert.equal(received.headers.Bcc,undefined);
});
test('relay rejects malformed recipient/header data and never logs private provider messages',async()=>{
  let sends=0;const env={EMAIL:{send:async()=>{sends++;throw Object.assign(new Error('sensitive value'),{code:'E_SENDER_NOT_VERIFIED'});}}};
  assert.equal((await relay.fetch(internal({...payload,to:['a@example.com','b@example.com']}),env)).status,400);
  assert.equal((await relay.fetch(internal({...payload,subject:'Hi\r\nBcc: bad@example.com'}),env)).status,400);
  const response=await relay.fetch(internal(),env);
  assert.deepEqual(await response.json(),{code:'E_SENDER_NOT_VERIFIED'});assert.equal(sends,1);
});
test('worker forwards static assets and redirects; previews alone are noindex',async()=>{
  const env={ASSETS:{fetch:async()=>new Response(null,{status:301,headers:{Location:'/fidelizacion/','Cache-Control':'max-age=300'}})}};
  const production=await worker.fetch(new Request('https://www.iman.ar/club'),env);
  assert.equal(production.status,301);assert.equal(production.headers.get('location'),'/fidelizacion/');assert.equal(production.headers.get('x-robots-tag'),null);
  const preview=await worker.fetch(new Request('https://preview.iman.pages.dev/club'),env);
  assert.equal(preview.status,301);assert.equal(preview.headers.get('x-robots-tag'),'noindex, nofollow');
});

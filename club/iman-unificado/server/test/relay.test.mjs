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
test('worker canonicalizes only the exact apex before asset or API routing, preserving path and query',async()=>{
  const target='/fidelizacion/?utm_source=google&oferta=caf%C3%A9%20club';
  const redirect=await worker.fetch(new Request('https://iman.ar'+target),{});
  assert.equal(redirect.status,308);
  assert.equal(redirect.headers.get('location'),'https://www.iman.ar'+target);
  const api=await worker.fetch(new Request('https://iman.ar/api/contacto?origen=home',{method:'POST',body:'not-a-real-form'}),{});
  assert.equal(api.status,308);
  assert.equal(api.headers.get('location'),'https://www.iman.ar/api/contacto?origen=home');
  const env={ASSETS:{fetch:async()=>new Response('static-page')}};
  for(const hostname of ['iman-4jp.pages.dev','preview.iman-4jp.pages.dev']){
    const preview=await worker.fetch(new Request('https://'+hostname+target),env);
    assert.equal(preview.status,200);assert.equal(preview.headers.get('location'),null);
    assert.equal(preview.headers.get('x-robots-tag'),'noindex, nofollow');
    assert.equal(await preview.text(),'static-page');
  }
  const canonical=await worker.fetch(new Request('https://www.iman.ar'+target),env);
  assert.equal(canonical.status,200);assert.equal(canonical.headers.get('location'),null);
  assert.equal(canonical.headers.get('x-robots-tag'),null);
});

test('noncanonical preview hosts block indexing and expose a restrictive robots file',async()=>{
  const env={ASSETS:{fetch:async()=>new Response('static')}};
  for(const hostname of ['staging.iman.ar','127.0.0.1','test.pages.dev']){
    const response=await worker.fetch(new Request('https://'+hostname+'/robots.txt'),env);
    assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
    assert.match(await response.text(),/Disallow: \//);
  }
  const production=await worker.fetch(new Request('https://www.iman.ar/robots.txt'),env);
  assert.equal(production.headers.get('x-robots-tag'),null);
});

test('the short /wa link opens WhatsApp with the Instagram message, on www and from the apex',async()=>{
  const direct=await worker.fetch(new Request('https://www.iman.ar/wa'),{});
  assert.equal(direct.status,302);
  const target=new URL(direct.headers.get('location'));
  assert.equal(target.origin+target.pathname,'https://wa.me/5493535189997');
  assert.equal(target.searchParams.get('text'),'Hola, vengo de Instagram y quiero info');
  const apex=await worker.fetch(new Request('https://iman.ar/wa'),{});
  assert.equal(apex.status,308);
  assert.equal(apex.headers.get('location'),'https://www.iman.ar/wa');
});

test('the short /agenda link sends people to the booking page',async()=>{
  for(const path of ['/agenda','/agenda/']){
    const response=await worker.fetch(new Request('https://www.iman.ar'+path),{});
    assert.equal(response.status,302);
    assert.equal(response.headers.get('location'),'https://agenda.iman.ar/');
  }
});

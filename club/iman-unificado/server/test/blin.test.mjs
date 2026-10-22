import test from 'node:test';
import assert from 'node:assert/strict';
import { createBlinHandler, describe, parseBlinLead } from '../blin.mjs';

const base = {etapa:'plan',nombre:'Sofía',negocio:'Tienda Sol',whatsapp:'353 4 123456',email:'',instagram:'@tiendasol',plan:'Mega Plus',sugerido:'Mega Plus',precio:1000000,
  rubro:'Moda e indumentaria',metas:['Que más gente conozca mi marca','Que los clientes vuelvan'],canales:['WhatsApp'],redes:'Yo, cuando puedo',plataformas:'En dos',
  consultas:'10 a 30',productos:'50 a 200',presupuesto:'$900.000 a $1.300.000',cuando:'Este mes',respuestas:{rubro:'moda'}};
function request(changes = {}, headers = {}) {
  return new Request('https://www.iman.ar/api/blin',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.iman.ar','CF-Connecting-IP':'192.0.2.10',...headers},body:JSON.stringify({...base,...changes})});
}
function setup(result = 'nuevo') {
  const sent = [], logs = [];
  const handle = createBlinHandler({sendLead:async lead=>{sent.push(lead);if(result instanceof Error)throw result;return result;},report:code=>logs.push(code)});
  return {sent,logs,handle};
}

test('a lead goes to the bot with the plan and the answers, only once per request', async () => {
  const {handle,sent} = setup();
  const response = await handle(request(),{});
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ok:true,resultado:'nuevo'});
  assert.equal(sent.length,1);
  assert.equal(sent[0].origen,'blin');
  assert.equal(sent[0].plan,'Mega Plus');
  assert.equal(sent[0].etapa,'plan');
  assert.match(sent[0].detalle,/^Test de Blin × IMÁN \(iman\.ar\/blin\/\)\nLe sugerimos: Mega Plus \(\$1\.000\.000 por mes\)/);
  assert.match(sent[0].detalle,/Quiere: Que más gente conozca mi marca, Que los clientes vuelvan/);
  assert.match(sent[0].detalle,/Instagram: @tiendasol/);
});

test('choosing another plan says so', () => {
  const lead = parseBlinLead({...base,etapa:'eleccion',plan:'Estándar Plus',precio:800000});
  assert.match(describe(lead),/Eligió: Estándar Plus \(\$800\.000 por mes\) · el test sugería Mega Plus/);
});

test('rejects other origins, bad data and unknown plans', async () => {
  const {handle,sent} = setup();
  assert.equal((await handle(request({},{Origin:'https://evil.example'}),{})).status,403);
  assert.equal((await handle(request({whatsapp:'123'}),{})).status,400);
  assert.equal((await handle(request({nombre:''}),{})).status,400);
  assert.equal((await handle(request({plan:'Plan Gratis'}),{})).status,400);
  assert.equal((await handle(request({email:'no-es-mail'}),{})).status,400);
  assert.equal((await handle(new Request('https://www.iman.ar/api/blin'),{})).status,405);
  assert.equal(sent.length,0);
});

test('limits repeated attempts from one address', async () => {
  const {handle} = setup();
  const statuses = [];
  for (let i = 0; i < 11; i++) statuses.push((await handle(request(),{})).status);
  assert.deepEqual(statuses.slice(0,10),Array(10).fill(200));
  assert.equal(statuses[10],429);
});

test('a bot that is down or missing is reported, not hidden', async () => {
  const down = setup(new Error('bot_502'));
  assert.equal((await down.handle(request(),{})).status,502);
  assert.deepEqual(down.logs,['blin_bot_failed']);
  const missing = setup(null);
  assert.equal((await missing.handle(request(),{})).status,503);
  assert.deepEqual(missing.logs,['blin_bot_missing']);
});

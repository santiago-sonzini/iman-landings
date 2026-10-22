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
  assert.deepEqual(await response.json(),{ok:true,resultado:'nuevo',mail:false});
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
  assert.equal((await missing.handle(request(),{})).status,502);
  assert.deepEqual(missing.logs,['blin_bot_missing']);
});

// The team is CONTACT_EMAIL plus TEAM_EMAILS here: one email each per finished test.
const mailEnv = {FROM_EMAIL:'hola@iman.ar',CONTACT_HASH_SECRET:'fake-test-secret-at-least-32-characters',EMAIL:{send:async()=>({messageId:'test'})},CONTACT_EMAIL:'sales@example.com',TEAM_EMAILS:'sales@example.com,mateo@example.com,joa@example.com'};
function withMail({bot = 'nuevo', mailFails = false} = {}) {
  const mails = [], logs = [];
  const handle = createBlinHandler({
    sendLead: async () => { if (bot instanceof Error) throw bot; return bot; },
    sendMail: async message => { if (mailFails) throw new Error('mail_down'); mails.push(message); },
    report: code => logs.push(code)});
  return {mails, logs, handle};
}

test('each finished test emails each person in the team once, with the plan and the answers', async () => {
  const {handle,mails} = withMail();
  const response = await handle(request({email:'sofi@example.com'}),mailEnv);
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ok:true,resultado:'nuevo',mail:true});
  assert.deepEqual(mails.map(m => m.to).sort(),['joa@example.com','mateo@example.com','sales@example.com']);
  assert.equal(mails[0].subject,'Test Blin × IMÁN · Tienda Sol · Mega Plus');
  assert.equal(mails[0].replyTo,'sofi@example.com');
  assert.match(mails[0].text,/Le sugerimos: Mega Plus \(\$1\.000\.000 por mes\)/);
  assert.match(mails[0].text,/https:\/\/wa\.me\/3534123456/);
  assert.match(mails[0].html,/Escribir por WhatsApp/);
});

test('picking a plan afterwards does not send a second email', async () => {
  const {handle,mails} = withMail({bot:'actualizado'});
  assert.equal((await handle(request({etapa:'eleccion'}),mailEnv)).status,200);
  assert.equal(mails.length,0);
});

test('if the bot is down, the email still carries the lead', async () => {
  const {handle,mails,logs} = withMail({bot:new Error('bot_502')});
  const response = await handle(request(),mailEnv);
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ok:true,resultado:'solo_mail',mail:true});
  assert.equal(mails.length,3);
  assert.deepEqual(logs,['blin_bot_failed']);
});

test('if both the bot and the email fail, it says so', async () => {
  const {handle,logs} = withMail({bot:new Error('bot_502'),mailFails:true});
  assert.equal((await handle(request(),mailEnv)).status,502);
  assert.deepEqual(logs,['blin_bot_failed','blin_mail_failed']);
});

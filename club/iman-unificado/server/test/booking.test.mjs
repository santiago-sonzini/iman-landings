import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createBookingHandler, TEAM } from '../booking.mjs';

const env = {FROM_EMAIL:'hola@iman.ar',CONTACT_HASH_SECRET:'fake-test-secret-at-least-32-characters',EMAIL:{send:async()=>({messageId:'test'})},CONTACT_EMAIL:'sales@example.com'};
const start = Math.floor(Date.now()/1000) + 3*86400;
const base = {inicio:start,nombre:'Ana Gómez',negocio:'Café Norte',email:'ana@example.com',whatsapp:'0353 15 479-7679',consentimiento:true,rubro:'Gastronomía y café',
  servicios:['WhatsApp e IA'],comentario:'Diagnóstico hecho en iman.ar/diagnostico/\nNegocio: Café Norte\nProblema: No llego a responder el WhatsApp\nInversión: Entre $50.000 y $150.000 por mes',source:'/diagnostico/'};
const BOOKED = {ok:true,cuando:'jueves 16 de octubre a las 11:00',inicio:start,fin:start+1800,meet:'https://meet.google.com/abc-defg-hij',whatsapp:'enviado',mail:true};
function request(changes = {}, headers = {}) {
  return new Request('https://www.iman.ar/api/agenda',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.iman.ar','CF-Connecting-IP':'192.0.2.10','Idempotency-Key':crypto.randomUUID(),...headers},body:JSON.stringify({...base,...changes})});
}
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../schema.sql',import.meta.url),'utf8'));
  const prepare = sql => {
    let values = [];
    const stmt = {bind(...args){values=args;return stmt;},async first(){return sqlite.prepare(sql).get(...values)||null;},async run(){const result=sqlite.prepare(sql).run(...values);return {meta:{changes:Number(result.changes)}};}};
    return stmt;
  };
  return {prepare,sqlite};
}
function setup({book = async () => ({status:200,body:BOOKED}), slots = async () => null, sendMail} = {}) {
  const sent = [], logs = [], bookings = [];
  const handle = createBookingHandler({
    sendMail: sendMail || (async message => {sent.push(message);return {messageId:'m'+sent.length};}),
    agenda: {slots, async book(payload){bookings.push(payload);return book(payload);}},
    report: code => logs.push(code), allowInMemory: true
  });
  return {handle,sent,logs,bookings};
}

test('books with the answers and emails each person of the team', async () => {
  const {handle,sent,bookings} = setup();
  const response = await handle(request(),env);
  assert.equal(response.status,200);
  const body = await response.json();
  assert.deepEqual(body,{...BOOKED,equipo:3});
  assert.equal(bookings.length,1);
  assert.equal(bookings[0].inicio,start);
  assert.match(bookings[0].comentario,/Problema: No llego/);
  assert.deepEqual(sent.map(m => m.to).sort(),[...TEAM].sort());
  assert.deepEqual([...TEAM].sort(),['joamonsech9@gmail.com','mateobreppe@gmail.com','santisonzini1234@gmail.com']);
  for (const mail of sent) {
    assert.equal(mail.replyTo,'ana@example.com');
    assert.equal(mail.subject,'Llamada agendada · Café Norte · jueves 16 de octubre a las 11:00');
    assert.match(mail.text,/Problema: No llego a responder el WhatsApp/);
    assert.match(mail.text,/https:\/\/meet\.google\.com\/abc-defg-hij/);
    assert.match(mail.text,/Ya le confirmamos por WhatsApp y por mail/);
    assert.doesNotMatch(mail.text,/Diagnóstico hecho en/);
    assert.match(mail.html,/agendó una llamada/);
  }
});

test('TEAM_EMAILS replaces the team, ignoring what is not an address', async () => {
  const {handle,sent} = setup();
  await handle(request(),{...env,TEAM_EMAILS:'uno@example.com, no-es-mail ,Dos@Example.com'});
  assert.deepEqual(sent.map(m => m.to),['uno@example.com','dos@example.com']);
});

test('a taken time answers 409 and can be retried with another', async () => {
  let calls = 0;
  const {handle,sent} = setup({book: async () => (++calls === 1 ? {status:409,body:{detail:'Ese horario se acaba de ocupar.'}} : {status:200,body:BOOKED})});
  const key = crypto.randomUUID();
  const first = await handle(request({},{'Idempotency-Key':key}),env);
  assert.equal(first.status,409);
  assert.equal((await first.json()).code,'slot_taken');
  assert.equal(sent.length,0);
  const again = await handle(request({inicio:start+1800},{'Idempotency-Key':key}),env);
  assert.equal(again.status,200);
});

test('the bot down is not a booking, and says what to do', async () => {
  const {handle,sent,logs} = setup({book: async () => {throw new Error('timeout');}});
  const response = await handle(request(),env);
  assert.equal(response.status,502);
  assert.match((await response.json()).error,/agenda\.iman\.ar/);
  assert.equal(sent.length,0);
  assert.deepEqual(logs,['booking_bot_unreachable']);
});

test('a failed team email never undoes the booking', async () => {
  let n = 0;
  const {handle,logs} = setup({sendMail: async () => {if (++n === 2) throw Object.assign(new Error('x'),{code:'E_RECIPIENT_SUPPRESSED'});return {messageId:'m'};}});
  const response = await handle(request(),env);
  assert.equal(response.status,200);
  assert.equal((await response.json()).equipo,2);
  assert.deepEqual(logs,['booking_team_delivery_failed']);
});

test('the same request is answered once', async () => {
  const db = database();
  const {handle,bookings,sent} = setup();
  const key = crypto.randomUUID();
  const one = await handle(request({},{'Idempotency-Key':key}),{...env,CONTACT_DB:db});
  const two = await handle(request({},{'Idempotency-Key':key}),{...env,CONTACT_DB:db});
  assert.equal(one.status,200);
  assert.deepEqual(await two.json(),await one.json());
  assert.equal(bookings.length,1);
  assert.equal(sent.length,3);
  const changed = await handle(request({nombre:'Otra'},{'Idempotency-Key':key}),{...env,CONTACT_DB:db});
  assert.equal(changed.status,409);
});

test('validates the booking before asking the agenda', async () => {
  const {handle,bookings} = setup();
  for (const changes of [{whatsapp:''},{inicio:'mañana'},{inicio:Math.floor(Date.now()/1000)-60},{inicio:start+90*86400},{consentimiento:false},{email:'no-es-mail'},{negocio:''}]) {
    const response = await handle(request(changes),env);
    assert.equal(response.status,400,JSON.stringify(changes));
  }
  assert.equal((await handle(request({},{Origin:'https://evil.example'}),env)).status,403);
  assert.equal((await handle(request({},{'Idempotency-Key':'corta'}),env)).status,400);
  assert.equal(bookings.length,0);
});

test('without mail settings or storage it does not book', async () => {
  const {handle,bookings} = setup();
  const strict = createBookingHandler({sendMail:async()=>{},agenda:{slots:async()=>null,book:async()=>({status:200,body:BOOKED})},report:()=>{}});
  assert.equal((await strict(request(),env)).status,503);
  assert.equal((await handle(request(),{...env,CONTACT_HASH_SECRET:''})).status,503);
  assert.equal(bookings.length,0);
});

test('rate limits by address', async () => {
  const {handle} = setup();
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await handle(request({inicio:start+i*1800}),env)).status);
  assert.deepEqual(codes,[200,200,200,429,429,429]);   // three a day per email
});

test('times come through without the bot details, and an unconnected agenda is just unavailable', async () => {
  const day = {fecha:'2026-10-16',dia:'Jue',numero:16,mes:'oct',largo:'Jueves 16 de octubre',horarios:[{inicio:start,hora:'11:00',libre:true,extra:'x'},{inicio:start+1800,hora:'11:30',libre:false}]};
  const {handle} = setup({slots: async () => ({marca:{nombre:'IMÁN'},disponible:true,duracion:30,dias:[day]})});
  const data = await (await handle(new Request('https://www.iman.ar/api/agenda'),env)).json();
  assert.deepEqual(data,{ok:true,disponible:true,duracion:30,dias:[{...day,horarios:[{inicio:start,hora:'11:00',libre:true},{inicio:start+1800,hora:'11:30',libre:false}]}]});
  const none = setup();
  assert.deepEqual(await (await none.handle(new Request('https://www.iman.ar/api/agenda'),env)).json(),{ok:true,disponible:false,dias:[]});
  const broken = setup({slots: async () => {throw new Error('down');}});
  const response = await broken.handle(new Request('https://www.iman.ar/api/agenda'),env);
  assert.equal(response.status,200);
  assert.equal((await response.json()).disponible,false);
  assert.deepEqual(broken.logs,['booking_times_failed']);
});

// The call booked inside the diagnosis (/diagnostico/). The times and the booking live with the WhatsApp assistant
// (agenda.iman.ar), asked server to server; the bot confirms to the client by mail and WhatsApp, and this sends the
// notice with the answers to everyone in the team.
import { countHits, definitelyNotSent, digest, failure, mailConfig, parseLead, readJSON, reply, team } from './contact.mjs';
import { teamBookingEmail } from './email.mjs';

// Who gets the notice of every call booked from the diagnosis: the same team as the inquiries (contact.mjs).
export { TEAM } from './contact.mjs';
const DAY = 86_400_000;
const UNAVAILABLE = 'No pudimos confirmar la reserva. Probá de nuevo o elegí el horario en agenda.iman.ar.';

// agenda: {slots(env) → the bot's /api/horarios or null when it isn't connected, book(payload, env) → {status, body}}.
export function createBookingHandler({sendMail, agenda, now = Date.now, report = code => console.error(code), allowInMemory = false} = {}) {
  const requests = new Map();
  const buckets = new Map();

  async function times(env) {
    try {
      const data = await agenda.slots(env);
      if (!data?.disponible || !Array.isArray(data.dias)) return reply({ok:true,disponible:false,dias:[]});
      // Only what the page draws: days with their times, free or not.
      const dias = data.dias.map(d => ({fecha:d.fecha,dia:d.dia,numero:d.numero,mes:d.mes,largo:d.largo,horarios:d.horarios.map(h => ({inicio:h.inicio,hora:h.hora,libre:Boolean(h.libre)}))}));
      return reply({ok:true,disponible:true,duracion:data.duracion,dias});
    } catch {
      report('booking_times_failed');
      return reply({ok:true,disponible:false,dias:[]});
    }
  }

  async function book(request, env) {
    const origin = new URL(request.url).origin;
    if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') return failure('origin_not_allowed','Origen no permitido.',403);
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return failure('unsupported_format','Formato no permitido.',415);
    let body;
    try { body = await readJSON(request); }
    catch (error) { return failure('invalid_request',error.status === 413 ? 'La reserva es demasiado extensa.' : 'No pudimos leer la reserva.', error.status || 400); }
    if (body && typeof body === 'object' && typeof body.sitio_web_empresa === 'string' && body.sitio_web_empresa.trim()) return reply({ok:true});
    const lead = parseLead(body,origin);
    if (!lead) return failure('validation_failed','Revisá los datos y la autorización de contacto.',400);
    if (!lead.whatsapp) return failure('whatsapp_required','Dejanos tu WhatsApp para mandarte el link de la llamada.',400);
    const inicio = body.inicio;
    // The visitor's time zone (the page shows the times on their clock): the bot says the call on that clock.
    const zona = typeof body.zona === 'string' && /^[A-Za-z][A-Za-z0-9_+\-]*(\/[A-Za-z0-9_+\-]+){0,2}$/.test(body.zona) && body.zona.length <= 64 ? body.zona : '';
    if (typeof inicio !== 'number' || !Number.isFinite(inicio) || inicio*1000 < now() || inicio*1000 > now()+60*DAY) return failure('invalid_time','Elegí un horario de la agenda.',400);
    const config = mailConfig(env);
    if (!config || (!env.CONTACT_DB && !allowInMemory)) { report('booking_config_missing'); return failure('booking_unavailable',UNAVAILABLE,503); }
    const requestId = request.headers.get('idempotency-key') || '';
    if (!/^[a-zA-Z0-9_-]{16,80}$/.test(requestId)) return failure('invalid_request_id','Actualizá la página e intentá de nuevo.',400);
    const key = 'agenda:'+requestId;
    const fingerprint = await digest(JSON.stringify({lead,inicio}),config.pass);
    const db = env.CONTACT_DB;
    const release = async () => { if (db) await db.prepare('DELETE FROM contact_requests WHERE request_id=?').bind(key).run(); else requests.delete(key); };
    try {
      let stored;
      if (db) {
        const result = await db.prepare('INSERT INTO contact_requests (request_id,fingerprint,created_at) VALUES (?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(key,fingerprint,now()).run();
        if (!result.meta.changes) stored = await db.prepare('SELECT fingerprint,state,response_status,response_json FROM contact_requests WHERE request_id=?').bind(key).first();
      } else {
        stored = requests.get(key);
        if (!stored) requests.set(key,{fingerprint,state:'processing'});
      }
      if (stored) {
        if (stored.fingerprint !== fingerprint) return failure('request_conflict','La reserva cambió. Volvé a enviarla.',409);
        if (stored.state === 'complete') return reply(JSON.parse(stored.response_json),stored.response_status);
        return failure('request_processing','Tu reserva ya está en proceso. Esperá un momento.',409,{'Retry-After':'10'});
      }
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const retryAfter = await countHits(db,buckets,[
        {key:`agenda-ip:${await digest(ip,config.pass)}`,limit:5,duration:3_600_000},
        {key:`agenda-email:${await digest(lead.email,config.pass)}`,limit:3,duration:DAY},
        {key:'agenda-global',limit:40,duration:3_600_000}
      ],now);
      if (retryAfter) { await release(); return failure('rate_limited','Ya recibimos varios intentos. Escribinos por WhatsApp y lo coordinamos.',429,{'Retry-After':String(retryAfter)}); }

      let booked;
      try {
        booked = await agenda.book({inicio,nombre:lead.nombre,negocio:lead.negocio,email:lead.email,whatsapp:lead.whatsapp,rubro:lead.rubro,servicios:lead.servicios,comentario:lead.comentario,zona},env);
      } catch {
        booked = {status:0,body:{}};
      }
      if (booked.status !== 200 || booked.body?.ok !== true) {
        // A retry is safe: if the bot did book, that time is no longer free and the agenda answers 409.
        await release();
        if (booked.status === 409) return failure('slot_taken','Ese horario se acaba de ocupar. Elegí otro.',409);
        report(booked.status ? `booking_bot_${booked.status}` : 'booking_bot_unreachable');
        return failure('booking_failed',UNAVAILABLE,502);
      }
      const b = booked.body;
      const result = {ok:true,cuando:b.cuando,inicio:b.inicio,fin:b.fin,meet:b.meet,whatsapp:b.whatsapp,mail:Boolean(b.mail)};

      // One email per person: the relay sends to a single recipient. A failed notice never undoes the booking.
      const common = {from:{name:'IMAN',address:config.user},replyTo:lead.email,headers:{'X-Auto-Response-Suppress':'All','Auto-Submitted':'auto-generated'},...teamBookingEmail(lead,{...result,cuando:b.cuando_equipo||b.cuando})};
      const sent = await Promise.allSettled(team(env).map(to => sendMail({...common,to},config)));
      const failed = sent.filter(s => s.status === 'rejected');
      if (failed.length) report(failed.some(s => !definitelyNotSent(s.reason)) ? 'booking_team_delivery_unknown' : 'booking_team_delivery_failed');
      result.equipo = sent.length - failed.length;

      try {
        if (db) await db.prepare("UPDATE contact_requests SET state='complete',response_status=200,response_json=? WHERE request_id=?").bind(JSON.stringify(result),key).run();
        else requests.set(key,{fingerprint,state:'complete',response_status:200,response_json:JSON.stringify(result)});
      } catch { report('booking_storage_failed'); }   // the call is booked: say so anyway
      return reply(result);
    } catch {
      report('booking_storage_failed');
      return failure('temporarily_unavailable',UNAVAILABLE,503);
    }
  }

  return async function handleBooking(request, env = {}) {
    if (request.method === 'GET') return times(env);
    if (request.method === 'POST') return book(request, env);
    return failure('method_not_allowed','Método no permitido.',405,{'Allow':'GET, POST'});
  };
}

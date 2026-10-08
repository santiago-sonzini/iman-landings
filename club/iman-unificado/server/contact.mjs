import { AGENDA_URL, confirmationEmail, ownerEmail } from './email.mjs';

export const SERVICES = new Set(['WhatsApp e IA', 'Fidelización y email marketing', 'Catálogos y ERP', 'IMAN Fidelización', 'IMAN Comercios · Catálogos', 'IMAN Automatizaciones', 'IMAN Agentes', 'IMAN Turnos', 'Gauss · Compras', 'Quiero que me orienten']);
const MAX_BYTES = 12_000;
const DAY = 86_400_000;
const LIMITS = {nombre:100,negocio:120,rubro:120,ciudad:120,email:254,whatsapp:50,servicio:80,comentario:2000,sitio_web_empresa:200,source:1000,url:1000,origen:1000,requestId:80,utm_source:120,utm_medium:120,utm_campaign:180,utm_content:180,utm_term:180};
const EMAIL = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i;
const single = value => typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\s+/g, ' ').trim() : '';
const multiline = value => typeof value === 'string' ? value.replace(/\r\n?/g,'\n').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,'').trim() : '';

function reply(body, status = 200, headers = {}) {
  return Response.json(body, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow',...headers}});
}
const failure = (code, error, status, headers) => reply({ok:false,code,error},status,headers);

async function readJSON(request) {
  const length = Number(request.headers.get('content-length'));
  if (length > MAX_BYTES) throw Object.assign(new Error('too_large'), {status:413});
  if (!request.body) throw new Error('empty_body');
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw Object.assign(new Error('too_large'), {status:413});
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const data = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {data.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data));
}

function parseLead(body, origin) {
  if (!body || Array.isArray(body) || typeof body !== 'object') return null;
  for (const [key, limit] of Object.entries(LIMITS)) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > limit)) return null;
  }
  if (body.utm !== undefined && (typeof body.utm !== 'object' || !body.utm || Array.isArray(body.utm))) return null;
  // Keep the scalar contract for existing pages; new clients send an explicit array.
  if (body.servicios !== undefined && (!Array.isArray(body.servicios) || body.servicios.length > 4 || body.servicios.some(value => typeof value !== 'string' || !SERVICES.has(value)))) return null;
  const requested = body.servicios === undefined ? [single(body.servicio)] : body.servicios;
  if (requested.some(value => !SERVICES.has(value))) return null;
  const selected = [...SERVICES].filter(value => requested.includes(value));
  if (selected.length > 1 && selected.includes('Quiero que me orienten')) return null;
  const servicios = selected.length ? selected : ['Quiero que me orienten'];
  const lead = {nombre:single(body.nombre),negocio:single(body.negocio),rubro:single(body.rubro),ciudad:single(body.ciudad),email:single(body.email).toLowerCase(),servicio:servicios.join(' · '),servicios,whatsapp:single(body.whatsapp),comentario:multiline(body.comentario),source:'',utm:{}};
  if (!lead.nombre || !lead.negocio || !EMAIL.test(lead.email) || body.consentimiento !== true) return null;
  if (lead.whatsapp && !/^[\d+().\s-]{6,50}$/.test(lead.whatsapp)) return null;
  const inputSource = body.source || body.url || body.origen;
  if (inputSource) {
    try {
      const url = new URL(inputSource, origin);
      // Strip query/hash (possible private data) and reject third-party URLs.
      if (url.origin === origin && url.pathname.length <= 500) lead.source = url.pathname;
    } catch { /* A bad optional source never changes the destination of a link. */ }
  }
  for (const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']) {
    const value = body[key] ?? body.utm?.[key];
    if (value !== undefined && (typeof value !== 'string' || value.length > LIMITS[key])) return null;
    if (value) lead.utm[key] = single(value);
  }
  return lead;
}

async function digest(value, secret) {
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)))].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

export function mailConfig(env) {
  const user = single(env.FROM_EMAIL) || 'hola@iman.ar';
  const pass = typeof env.CONTACT_HASH_SECRET === 'string' ? env.CONTACT_HASH_SECRET : '';
  const contact = single(env.CONTACT_EMAIL);
  const transport = env.EMAIL?.send ? env.EMAIL : env.MAILER?.fetch ? env.MAILER : null;
  return user === 'hola@iman.ar' && EMAIL.test(contact) && pass.length >= 32 && transport ? {user,pass,contact,transport,native:Boolean(env.EMAIL?.send)} : null;
}

export const definitelyNotSent = error => ['E_VALIDATION_ERROR','E_FIELD_MISSING','E_TOO_MANY_RECIPIENTS','E_SENDER_NOT_VERIFIED','E_RECIPIENT_NOT_ALLOWED','E_RECIPIENT_SUPPRESSED','E_SENDER_DOMAIN_NOT_AVAILABLE','E_CONTENT_TOO_LARGE','E_RATE_LIMIT_EXCEEDED','E_DAILY_LIMIT_EXCEEDED','E_HEADER_NOT_ALLOWED','E_HEADER_USE_API_FIELD','E_HEADER_VALUE_INVALID','E_HEADER_VALUE_TOO_LONG','E_HEADER_NAME_INVALID','E_HEADERS_TOO_LARGE','E_HEADERS_TOO_MANY'].includes(error?.code);

export function createContactHandler({sendMail, startChat = null, now = Date.now, report = code => console.error(code), allowInMemory = false} = {}) {
  const requests = new Map();
  const buckets = new Map();
  function prune() {
    const cutoff = now();
    for (const [key, item] of requests) if (item.createdAt < cutoff - DAY) requests.delete(key);
    for (const [key, item] of buckets) if (item.expires <= cutoff) buckets.delete(key);
  }

  async function rateLimit(db, items) {
    for (const {key,limit,duration} of items) {
      const period = Math.floor(now()/duration);
      const bucket = `${key}:${period}`;
      const expires = (period+1)*duration;
      let hits;
      if (db) {
        const result = await db.prepare('INSERT INTO contact_rate_limits (bucket,hits,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=hits+1 RETURNING hits').bind(bucket,expires).first();
        hits = result.hits;
      } else {
        hits = (buckets.get(bucket)?.hits || 0)+1;
        buckets.set(bucket,{hits,expires});
      }
      if (hits > limit) return Math.max(1,Math.ceil((expires-now())/1000));
    }
    return 0;
  }

  return async function handleContact(request, env = {}) {
    if (request.method !== 'POST') return failure('method_not_allowed','Método no permitido.',405,{'Allow':'POST'});
    const origin = new URL(request.url).origin;
    if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') return failure('origin_not_allowed','Origen no permitido.',403);
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return failure('unsupported_format','Formato no permitido.',415);
    let body;
    try { body = await readJSON(request); }
    catch (error) { return failure('invalid_request',error.status === 413 ? 'La consulta es demasiado extensa.' : 'No pudimos leer la consulta.', error.status || 400); }
    if (body && typeof body === 'object' && single(body.sitio_web_empresa)) return reply({ok:true,confirmationSent:true,agendaUrl:AGENDA_URL});
    const lead = parseLead(body,origin);
    if (!lead) return failure('validation_failed','Revisá los datos obligatorios y la autorización de contacto.',400);
    const config = mailConfig(env);
    if (!config || (!env.CONTACT_DB && !allowInMemory)) { report('contact_config_missing'); return failure('mail_unavailable','No pudimos enviar tu consulta. Podés reservar una charla o escribirnos por WhatsApp.',503); }
    const requestId = request.headers.get('idempotency-key') || body.requestId || crypto.randomUUID();
    if (!/^[a-zA-Z0-9_-]{16,80}$/.test(requestId)) return failure('invalid_request_id','Actualizá la página e intentá de nuevo.',400);
    prune();
    // HMAC keeps low-entropy addresses/IPs from being recoverable from stored hashes.
    const fingerprint = await digest(JSON.stringify(lead),config.pass);
    const db = env.CONTACT_DB;
    let stored;
    try {
      if (db) {
        const result = await db.prepare('INSERT INTO contact_requests (request_id,fingerprint,created_at) VALUES (?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(requestId,fingerprint,now()).run();
        if (!result.meta.changes) stored = await db.prepare('SELECT fingerprint,state,response_status,response_json FROM contact_requests WHERE request_id=?').bind(requestId).first();
      } else {
        stored = requests.get(requestId);
        if (!stored) {
          if (requests.size > 5000 || buckets.size > 10000) return failure('rate_limited','Estamos recibiendo muchas consultas. Podés reservar una charla directamente.',429,{'Retry-After':'600'});
          requests.set(requestId,{fingerprint,state:'processing',createdAt:now()});
        }
      }
      if (stored) {
        if (stored.fingerprint !== fingerprint) return failure('request_conflict','Esta consulta cambió. Volvé a enviarla con los datos actualizados.',409);
        if (stored.state === 'complete') return reply(JSON.parse(stored.response_json),stored.response_status);
        return failure('request_processing','Tu consulta ya está en proceso. Esperá un momento antes de volver a intentar; también podés reservar una charla.',409,{'Retry-After':'10'});
      }
      const finish = async (result, status) => {
        if (status === 429 || result.retryable === true) {
          if(db)await db.prepare('DELETE FROM contact_requests WHERE request_id=?').bind(requestId).run();
          else requests.delete(requestId);
        } else if (db) await db.prepare("UPDATE contact_requests SET state='complete',response_status=?,response_json=? WHERE request_id=?").bind(status,JSON.stringify(result),requestId).run();
        else requests.set(requestId,{fingerprint,state:'complete',createdAt:now(),response_status:status,response_json:JSON.stringify(result)});
        return reply(result,status);
      };
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const retryAfter = await rateLimit(db,[
        {key:`ip:${await digest(ip,config.pass)}`,limit:4,duration:600_000},
        {key:`email:${await digest(lead.email,config.pass)}`,limit:2,duration:3_600_000},
        {key:'global',limit:100,duration:3_600_000}
      ]);
      if (retryAfter) {
        const result = await finish({ok:false,code:'rate_limited',error:'Ya recibimos varios intentos. Podés reservar una charla directamente.'},429);
        result.headers.set('Retry-After',String(retryAfter));
        return result;
      }
      const common = {from:{name:'IMAN',address:config.user},headers:{'X-Auto-Response-Suppress':'All','Auto-Submitted':'auto-generated'}};
      try {
        await sendMail({...common,to:config.contact,replyTo:lead.email,...ownerEmail(lead)},config);
      } catch (error) {
        // Do not expose provider errors (which may include private addresses).
        report('contact_owner_delivery_failed');
        return await finish({ok:false,code:'delivery_failed',retryable:definitelyNotSent(error),error:'No pudimos confirmar el envío. Podés reservar una charla o escribirnos por WhatsApp.'},502);
      }
      let confirmationSent = true;
      try { await sendMail({...common,to:lead.email,replyTo:config.contact,...confirmationEmail(lead)},config); }
      catch {confirmationSent=false;report('contact_confirmation_delivery_failed');}
      // With a WhatsApp number, the IMAN assistant writes to them right away (server to server; see worker.mjs).
      let whatsapp = null;
      if (lead.whatsapp && startChat) {
        try { whatsapp = await startChat(lead, env); }
        catch { report('contact_whatsapp_failed'); }
      }
      const response = await finish({ok:true,confirmationSent,agendaUrl:AGENDA_URL,...(whatsapp ? {whatsapp} : {})},200);
      if (db) {
        // Opportunistic cleanup only; never retain hashes/results beyond 7 days.
        try { await db.batch([db.prepare('DELETE FROM contact_requests WHERE created_at < ?').bind(now()-7*DAY),db.prepare('DELETE FROM contact_rate_limits WHERE expires_at < ?').bind(now())]); }
        catch { report('contact_cleanup_failed'); }
      }
      return response;
    } catch {
      report('contact_storage_failed');
      return failure('temporarily_unavailable','No pudimos confirmar el envío. Podés reservar una charla o escribirnos por WhatsApp.',503);
    }
  };
}

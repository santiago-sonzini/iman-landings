import { countHits, digest, failure, mailConfig, readJSON, reply, team } from './contact.mjs';
import { blinLeadEmail } from './email.mjs';

// Leads from the Blin × IMÁN test (iman.ar/blin/): the answers go to the WhatsApp assistant's panel as a lead
// (bot/reservas.py, /api/lead), and each finished test emails the team, like the site's other inquiries.
// The person is never messaged automatically; the team follows up.
const PLANS = new Set(['Mega Plus', 'Estándar Plus']);
const STAGES = new Set(['plan', 'eleccion']);
const EMAIL = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i;
const single = value => typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\s+/g, ' ').trim() : '';
const clip = (value, max) => single(value).slice(0, max);
const list = value => Array.isArray(value) ? value.slice(0, 12).map(item => clip(item, 80)).filter(Boolean) : [];
const money = n => '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function parseBlinLead(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const lead = {
    etapa: STAGES.has(body.etapa) ? body.etapa : 'plan',
    nombre: clip(body.nombre, 100), negocio: clip(body.negocio, 120), whatsapp: clip(body.whatsapp, 50),
    email: clip(body.email, 254).toLowerCase(), instagram: clip(body.instagram, 60),
    plan: PLANS.has(body.plan) ? body.plan : '', sugerido: PLANS.has(body.sugerido) ? body.sugerido : '',
    precio: Number.isInteger(body.precio) && body.precio > 0 && body.precio < 1e8 ? body.precio : 0,
    rubro: clip(body.rubro, 120), metas: list(body.metas), canales: list(body.canales),
    redes: clip(body.redes, 80), plataformas: clip(body.plataformas, 40), consultas: clip(body.consultas, 40),
    productos: clip(body.productos, 40), presupuesto: clip(body.presupuesto, 60), cuando: clip(body.cuando, 60),
  };
  const digits = lead.whatsapp.replace(/\D/g, '').length;
  if (!lead.nombre || digits < 8 || digits > 15 || !lead.plan) return null;
  if (lead.email && !EMAIL.test(lead.email)) return null;
  return lead;
}

// What the team reads in the panel: the plan first, then the answers.
export function describe(lead) {
  const plan = `${lead.etapa === 'eleccion' ? 'Eligió' : 'Le sugerimos'}: ${lead.plan}${lead.precio ? ` (${money(lead.precio)} por mes)` : ''}`;
  return [
    'Test de Blin × IMÁN (iman.ar/blin/)',
    plan + (lead.sugerido && lead.sugerido !== lead.plan ? ` · el test sugería ${lead.sugerido}` : ''),
    lead.rubro && `Rubro: ${lead.rubro}`,
    lead.metas.length && `Quiere: ${lead.metas.join(', ')}`,
    lead.canales.length && `Vende por: ${lead.canales.join(', ')}`,
    (lead.redes || lead.plataformas) && `Redes hoy: ${lead.redes || '—'} · Quiere estar en: ${lead.plataformas || '—'}`,
    (lead.consultas || lead.productos) && `Consultas por día: ${lead.consultas || '—'} · Productos: ${lead.productos || '—'}`,
    (lead.presupuesto || lead.cuando) && `Inversión: ${lead.presupuesto || '—'} · Arranque: ${lead.cuando || '—'}`,
    lead.instagram && `Instagram: ${lead.instagram}`,
  ].filter(Boolean).join('\n');
}

export function createBlinHandler({sendLead, sendMail = null, now = Date.now, report = code => console.error(code)} = {}) {
  const buckets = new Map();
  return async function handleBlin(request, env = {}) {
    if (request.method !== 'POST') return failure('method_not_allowed', 'Método no permitido.', 405, {'Allow': 'POST'});
    const origin = new URL(request.url).origin;
    if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') return failure('origin_not_allowed', 'Origen no permitido.', 403);
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return failure('unsupported_format', 'Formato no permitido.', 415);
    let body;
    try { body = await readJSON(request); }
    catch (error) { return failure('invalid_request', 'No pudimos leer los datos.', error.status || 400); }
    const lead = parseBlinLead(body);
    if (!lead) return failure('validation_failed', 'Revisá tu nombre y tu WhatsApp.', 400);
    // HMAC keeps the IP from being recoverable from the stored bucket name.
    const secret = typeof env.CONTACT_HASH_SECRET === 'string' && env.CONTACT_HASH_SECRET.length >= 32 ? env.CONTACT_HASH_SECRET : 'blin-local-preview-secret';
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const wait = await countHits(env.CONTACT_DB, buckets, [
      {key: `blin:ip:${await digest(ip, secret)}`, limit: 10, duration: 600_000},
      {key: 'blin:global', limit: 300, duration: 3_600_000},
    ], now);
    if (wait) return failure('rate_limited', 'Recibimos varios intentos. Probá en un rato.', 429, {'Retry-After': String(wait)});
    const detalle = describe(lead);
    let saved = null;
    try {
      saved = await sendLead({nombre: lead.nombre, negocio: lead.negocio, email: lead.email, whatsapp: lead.whatsapp, rubro: lead.rubro,
        plan: lead.plan, detalle, origen: 'blin', etapa: lead.etapa}, env);
      if (!saved) report('blin_bot_missing');
    } catch { report('blin_bot_failed'); }
    // One email per finished test (not again when they pick a plan), to each person in the team. If the bot failed,
    // the email still carries the lead.
    let mailed = false;
    const config = sendMail && lead.etapa === 'plan' ? mailConfig(env) : null;
    if (config) {
      const owners = [...new Set([config.contact.toLowerCase(), ...team(env)])];
      const notice = {from: {name: 'IMAN', address: config.user}, headers: {'X-Auto-Response-Suppress': 'All', 'Auto-Submitted': 'auto-generated'},
        ...(lead.email ? {replyTo: lead.email} : {}), ...blinLeadEmail(lead, detalle)};
      const sent = await Promise.allSettled(owners.map(to => sendMail({...notice, to}, config)));
      mailed = sent.some(s => s.status === 'fulfilled');
      if (!mailed) report('blin_mail_failed');
    } else if (sendMail && lead.etapa === 'plan') report('blin_mail_config_missing');
    if (!saved && !mailed) return failure('unavailable', 'No pudimos guardar tus datos.', 502);
    return reply({ok: true, resultado: saved || 'solo_mail', mail: mailed});
  };
}

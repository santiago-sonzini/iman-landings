import { escapeHTML, newsletterEmail, newsletterWelcomeEmail } from './email.mjs';
import { mailConfig, definitelyNotSent } from './contact.mjs';

const SUCCESS = {ok:true,message:'Si este email todavía no estaba suscripto, te enviamos un enlace para confirmar. Revisá tu bandeja de entrada.'};
const CONSENT_VERSION = 'newsletter-2026-09-27';
const EMAIL = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const clean = value => typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').trim() : '';
const json = (value,status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});
const error = (code,message,status) => json({ok:false,code,error:message},status);
const hash = async input => [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input)))].map(n=>n.toString(16).padStart(2,'0')).join('');
const token = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
const originOK = request => request.headers.get('origin') === new URL(request.url).origin && request.headers.get('sec-fetch-site') !== 'cross-site';

async function limitedText(request) {
  if (Number(request.headers.get('content-length'))>4096) throw new Error('too_large');
  if(!request.body)throw new Error('empty');
  const reader=request.body.getReader();let size=0;const data=[];
  try {for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw new Error('too_large');}data.push(value);}}
  finally {reader.releaseLock();}
  const out=new Uint8Array(size);let offset=0;for(const part of data){out.set(part,offset);offset+=part.length;}
  return new TextDecoder('utf-8',{fatal:true}).decode(out);
}

function page(title,text,action,rawToken,status=200) {
  const form = action ? `<form method="post" action="/api/newsletter/${action}"><input type="hidden" name="token" value="${escapeHTML(rawToken)}"><button type="submit">${action==='confirmar'?'Confirmar mi suscripción':'Confirmar la baja'}</button></form>` : '<a class="button" href="/">Volver a IMAN</a>';
  return new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHTML(title)} · IMAN</title><style>body{margin:0;background:#f4f5fb;color:#171726;font:16px/1.6 Arial,sans-serif;min-height:100svh;display:grid;place-items:center}main{box-sizing:border-box;max-width:560px;margin:24px;padding:40px;background:white;border:1px solid #e7e7f1;border-radius:24px}a{color:#4f46f5}.brand{font-size:26px;font-weight:900;letter-spacing:-1px;text-decoration:none}h1{font-size:34px;line-height:1.15;letter-spacing:-1px;margin:30px 0 20px}p{color:#5b5b70}button,.button{display:inline-block;background:#4f46f5;color:white;border:0;border-radius:10px;padding:16px 22px;font:700 15px Arial,sans-serif;text-decoration:none;cursor:pointer;margin-top:20px}button:focus-visible,a:focus-visible{outline:3px solid #171726;outline-offset:4px}</style></head><body><main><a class="brand" href="/">IMAN.</a><h1>${escapeHTML(title)}</h1><p>${escapeHTML(text)}</p>${form}</main></body></html>`,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});
}

export function createNewsletterHandler({sendMail,now=Date.now,report=code=>console.error(code)}) {
  async function limit(db,key,max,duration) {
    const period=Math.floor(now()/duration),expires=(period+1)*duration;
    const row=await db.prepare('INSERT INTO contact_rate_limits (bucket,hits,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=hits+1 RETURNING hits').bind(`newsletter:${key}:${period}`,expires).first();
    return row.hits<=max;
  }

  async function subscribe(request,env) {
    if(request.method!=='POST')return error('method_not_allowed','Método no permitido.',405);
    if(!originOK(request))return error('origin_not_allowed','Origen no permitido.',403);
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))return error('unsupported_format','Formato no permitido.',415);
    let body;try{body=JSON.parse(await limitedText(request));}catch{return error('invalid_request','Revisá los datos e intentá nuevamente.',400);}
    if(!body || typeof body!=='object' || Array.isArray(body))return error('invalid_request','Revisá los datos.',400);
    if(clean(body.sitio_web_empresa))return json(SUCCESS);
    const person={nombre:clean(body.nombre),email:clean(body.email).toLowerCase(),rubro:clean(body.rubro)};
    if(!person.nombre || person.nombre.length>100 || !EMAIL.test(person.email) || person.email.length>254 || person.rubro.length>100 || body.consentimiento!==true)return error('validation_failed','Completá tu nombre, un email válido y la autorización para recibir ideas.',400);
    const db=env.CONTACT_DB,config=mailConfig(env);
    if(!db || !config){report('newsletter_config_missing');return error('mail_unavailable','La suscripción no está disponible en este momento. Intentá más tarde.',503);}
    const id=request.headers.get('idempotency-key') || body.requestId || crypto.randomUUID();
    if(!/^[A-Za-z0-9_-]{16,80}$/.test(id))return error('invalid_request_id','Actualizá la página e intentá de nuevo.',400);
    const requestId=`newsletter:${id}`,fingerprint=await hash(config.pass+JSON.stringify(person));
    try {
      const claim=await db.prepare('INSERT INTO contact_requests (request_id,fingerprint,created_at) VALUES (?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(requestId,fingerprint,now()).run();
      if(!claim.meta.changes){
        const previous=await db.prepare('SELECT fingerprint,state,response_status,response_json FROM contact_requests WHERE request_id=?').bind(requestId).first();
        if(previous.fingerprint!==fingerprint)return error('request_conflict','Tus datos cambiaron. Volvé a enviar el formulario.',409);
        if(previous.state==='complete')return json(JSON.parse(previous.response_json),previous.response_status);
        return error('request_processing','La suscripción se está procesando. Esperá un momento y revisá tu email.',409);
      }
      const finish=async(result,status=200)=>{
        if(status===429 || result.retryable===true)await db.prepare('DELETE FROM contact_requests WHERE request_id=?').bind(requestId).run();
        else await db.prepare("UPDATE contact_requests SET state='complete',response_status=?,response_json=? WHERE request_id=?").bind(status,JSON.stringify(result),requestId).run();
        return json(result,status);
      };
      const ip=await hash(config.pass+(request.headers.get('cf-connecting-ip')||'unknown'));
      const emailHash=await hash(config.pass+person.email);
      if(!await limit(db,`ip:${ip}`,4,600_000)||!await limit(db,`email:${emailHash}`,2,3_600_000)||!await limit(db,'global',100,3_600_000))return finish({ok:false,code:'rate_limited',error:'Ya recibimos varios intentos. Revisá tu bandeja de entrada o probá más tarde.'},429);
      const existing=await db.prepare('SELECT status FROM newsletter_subscribers WHERE email=?').bind(person.email).first();
      if(existing?.status==='subscribed')return finish(SUCCESS);
      const confirmToken=token(),unsubscribeToken=token();
      const confirmationHash=await hash(confirmToken),unsubscribeHash=await hash(unsubscribeToken);
      await db.prepare("INSERT INTO newsletter_subscribers (subscriber_id,email,nombre,rubro,status,consent_version,created_at,updated_at,confirmation_hash,confirmation_expires,unsubscribe_hash) VALUES (?,?,?,?,'pending',?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET nombre=excluded.nombre,rubro=excluded.rubro,status='pending',consent_version=excluded.consent_version,updated_at=excluded.updated_at,confirmation_hash=excluded.confirmation_hash,confirmation_expires=excluded.confirmation_expires,unsubscribe_hash=excluded.unsubscribe_hash,unsubscribe_previous_hash=NULL,confirmed_at=NULL,welcome_state='pending',welcome_attempts=0,welcome_sent_at=NULL WHERE newsletter_subscribers.status!='subscribed'").bind(crypto.randomUUID(),person.email,person.nombre,person.rubro,CONSENT_VERSION,now(),now(),confirmationHash,now()+172_800_000,unsubscribeHash).run();
      // Canonical site only: never build links from a spoofed Origin/Host header.
      let site='https://www.iman.ar';
      if(env.SITE_URL){const configured=new URL(env.SITE_URL);if(configured.protocol==='https:'&&['www.iman.ar','iman.ar'].includes(configured.hostname))site=configured.origin;}
      try{await sendMail({from:{name:'IMAN',address:config.user},to:person.email,replyTo:config.contact,headers:{'Auto-Submitted':'auto-generated','X-Auto-Response-Suppress':'All'},...newsletterEmail(person,`${site}/api/newsletter/confirmar?token=${confirmToken}`,`${site}/api/newsletter/baja?token=${unsubscribeToken}`)},config);}
      catch(error){report('newsletter_confirmation_delivery_failed');return finish({ok:false,code:'delivery_failed',retryable:definitelyNotSent(error),error:'No pudimos confirmar el envío. Revisá tu bandeja de entrada o probá más tarde.'},502);}
      // Opportunistically remove expired pending and 30-day-old unsubscribed records.
      await db.batch([
        db.prepare("DELETE FROM newsletter_subscribers WHERE status='pending' AND confirmation_expires < ?").bind(now()),
        db.prepare("DELETE FROM newsletter_subscribers WHERE status='unsubscribed' AND updated_at < ?").bind(now()-2_592_000_000),
        db.prepare('DELETE FROM contact_requests WHERE created_at < ?').bind(now()-604_800_000),
        db.prepare('DELETE FROM contact_rate_limits WHERE expires_at < ?').bind(now())
      ]).catch(()=>report('newsletter_cleanup_failed'));
      return finish(SUCCESS);
    }catch{report('newsletter_storage_failed');return error('temporarily_unavailable','No pudimos confirmar tu suscripción. Intentá más tarde.',503);}
  }

  async function changeSubscription(request,env,action) {
    if(!['GET','POST'].includes(request.method))return error('method_not_allowed','Método no permitido.',405);
    let rawToken;
    if(request.method==='POST'){
      if(!originOK(request))return page('No pudimos confirmar la acción','Volvé a abrir el enlace desde tu correo.',null,null,403);
      if(!/^application\/x-www-form-urlencoded(?:\s*;|$)/i.test(request.headers.get('content-type')||''))return page('Formato no válido','Volvé a abrir el enlace desde tu correo.',null,null,415);
      try{rawToken=new URLSearchParams(await limitedText(request)).get('token');}catch{return page('Enlace no válido','Volvé a abrir el enlace desde tu correo.',null,null,400);}
    }else rawToken=new URL(request.url).searchParams.get('token');
    if(!TOKEN.test(rawToken||''))return page('Enlace no válido','Pedí un nuevo enlace desde el formulario de IMAN.',null,null,400);
    if(!env.CONTACT_DB)return page('Probá de nuevo más tarde','No pudimos completar la acción en este momento.',null,null,503);
    try{
      const db=env.CONTACT_DB,tokenHash=await hash(rawToken);
      const column=action==='confirmar'?'confirmation_hash':'unsubscribe_hash';
      const query=db.prepare(`SELECT subscriber_id,email,nombre,status,confirmation_expires,welcome_state,welcome_attempts FROM newsletter_subscribers WHERE ${column}=?${action==='baja'?' OR unsubscribe_previous_hash=?':''}`);
      const person=await (action==='baja'?query.bind(tokenHash,tokenHash):query.bind(tokenHash)).first();
      if(!person || (action==='confirmar' && (!['pending','subscribed'].includes(person.status) || person.confirmation_expires<now())))return page('Este enlace venció o ya fue usado','Si todavía no confirmaste tu email, podés solicitar otro enlace desde el formulario de IMAN.',null,null,400);
      if(action==='confirmar' && person.status==='subscribed' && person.welcome_state!=='failed')return page('Ya estás en la lista.','Tu email quedó confirmado. Gracias por sumarte a las ideas de IMAN.');
      if(request.method==='GET')return page(action==='confirmar'?'¿Te sumás a las ideas de IMAN?':'¿Querés dejar de recibir ideas?',action==='confirmar'?'Confirmá que querés recibir ideas de fidelización, comunicación y automatización para tu comercio. Podés darte de baja cuando quieras.':'Al confirmar, dejamos de enviarte ideas de IMAN. Podés volver a suscribirte cuando quieras.',action,rawToken);
      if(action==='confirmar'){
        const config=mailConfig(env);
        if(!config)return page('Probá de nuevo más tarde','No pudimos completar la confirmación en este momento.',null,null,503);
        const unsubscribeToken=token();
        const newUnsubscribeHash=await hash(unsubscribeToken);
        const result=await db.prepare("UPDATE newsletter_subscribers SET status='subscribed',confirmed_at=COALESCE(confirmed_at,?),updated_at=?,welcome_state='sending',welcome_attempts=welcome_attempts+1,unsubscribe_previous_hash=COALESCE(unsubscribe_previous_hash,unsubscribe_hash),unsubscribe_hash=? WHERE subscriber_id=? AND confirmation_hash=? AND confirmation_expires>=? AND welcome_attempts<3 AND ((status='pending' AND welcome_state='pending') OR (status='subscribed' AND welcome_state='failed'))").bind(now(),now(),newUnsubscribeHash,person.subscriber_id,tokenHash,now()).run();
        if(!result.meta.changes)return page('Ya estás en la lista.','Tu suscripción está confirmada. Podés volver al sitio de IMAN.');
        let welcomeSent=false;
        try{
          // Both the initial confirmation email and the welcome can unsubscribe.
          const unsubscribeURL=`https://www.iman.ar/api/newsletter/baja?token=${unsubscribeToken}`;
          await sendMail({from:{name:'IMAN',address:config.user},to:person.email,replyTo:config.contact,headers:{'Auto-Submitted':'auto-generated','X-Auto-Response-Suppress':'All'},...newsletterWelcomeEmail(person,unsubscribeURL)},config);
          await db.prepare("UPDATE newsletter_subscribers SET welcome_state='sent',welcome_sent_at=? WHERE subscriber_id=? AND welcome_state='sending'").bind(now(),person.subscriber_id).run();
          welcomeSent=true;
        }catch(error){
          report('newsletter_welcome_delivery_failed');
          await db.prepare('UPDATE newsletter_subscribers SET welcome_state=? WHERE subscriber_id=? AND welcome_state=\'sending\'').bind(definitelyNotSent(error)?'failed':'unknown',person.subscriber_id).run();
        }
        return page('Ya estás en la lista.',welcomeSent?'Tu suscripción está confirmada. Te enviamos un mensaje de bienvenida con tres ideas para tu comercio.':'Tu suscripción está confirmada. No pudimos confirmar el envío del mensaje de bienvenida; podés leer las ideas en la sección Recursos.');
      }
      await db.prepare("UPDATE newsletter_subscribers SET status='unsubscribed',nombre='',rubro='',updated_at=?,confirmation_hash=NULL,confirmation_expires=NULL,unsubscribe_hash=NULL,unsubscribe_previous_hash=NULL WHERE subscriber_id=?").bind(now(),person.subscriber_id).run();
      return page('Tu baja quedó confirmada.','Dejás de recibir el newsletter de IMAN. Gracias por habernos acompañado.');
    }catch{report('newsletter_action_failed');return page('Probá de nuevo más tarde','No pudimos completar la acción en este momento.',null,null,503);}
  }

  return (request,env)=>{
    const path=new URL(request.url).pathname.replace(/\/$/,'');
    if(path==='/api/newsletter')return subscribe(request,env);
    if(path==='/api/newsletter/confirmar')return changeSubscription(request,env,'confirmar');
    if(path==='/api/newsletter/baja')return changeSubscription(request,env,'baja');
    return error('not_found','No encontrado.',404);
  };
}

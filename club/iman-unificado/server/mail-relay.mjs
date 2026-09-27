// Deploy as iman-correo. Disable workers.dev, preview URLs and all public routes.
// Bind send_email as EMAIL; restrict allowed_sender_addresses to hola@iman.ar.
const ADDRESS=/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
const safeCodes=new Set(['E_VALIDATION_ERROR','E_FIELD_MISSING','E_TOO_MANY_RECIPIENTS','E_SENDER_NOT_VERIFIED','E_RECIPIENT_NOT_ALLOWED','E_RECIPIENT_SUPPRESSED','E_SENDER_DOMAIN_NOT_AVAILABLE','E_CONTENT_TOO_LARGE','E_DELIVERY_FAILED','E_RATE_LIMIT_EXCEEDED','E_DAILY_LIMIT_EXCEEDED','E_INTERNAL_SERVER_ERROR','E_HEADER_NOT_ALLOWED','E_HEADER_USE_API_FIELD','E_HEADER_VALUE_INVALID','E_HEADER_VALUE_TOO_LONG','E_HEADER_NAME_INVALID','E_HEADERS_TOO_LARGE','E_HEADERS_TOO_MANY']);
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.hostname!=='iman-correo.internal'||url.pathname!=='/send'||request.method!=='POST')return json({code:'forbidden'},403);
    if(!env.EMAIL?.send)return json({code:'email_binding_missing'},503);
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))return json({code:'E_VALIDATION_ERROR'},415);
    let raw,mail;try{raw=await request.text();if(new TextEncoder().encode(raw).length>80_000)return json({code:'E_CONTENT_TOO_LARGE'},413);mail=JSON.parse(raw);}catch{return json({code:'E_VALIDATION_ERROR'},400);}
    if(!mail||typeof mail!=='object'||Array.isArray(mail)||typeof mail.to!=='string'||mail.to.length>254||!ADDRESS.test(mail.to)||typeof mail.replyTo!=='string'||!ADDRESS.test(mail.replyTo)||typeof mail.subject!=='string'||!mail.subject||mail.subject.length>250||/[\r\n]/.test(mail.subject)||typeof mail.html!=='string'||mail.html.length>50_000||typeof mail.text!=='string'||mail.text.length>20_000)return json({code:'E_VALIDATION_ERROR'},400);
    // The caller cannot override sender, add hidden recipients or inject raw headers.
    const payload={from:{name:'IMAN',email:'hola@iman.ar'},to:mail.to,replyTo:mail.replyTo,subject:mail.subject,html:mail.html,text:mail.text,headers:{'Auto-Submitted':'auto-generated','X-Auto-Response-Suppress':'All'}};
    try{const result=await env.EMAIL.send(payload);if(!result?.messageId)return json({code:'mail_acceptance_unknown'},502);return json({messageId:result.messageId});}
    catch(error){return json({code:safeCodes.has(error?.code)?error.code:'mail_acceptance_unknown'},502);}
  }
};

import { createContactHandler } from './contact.mjs';
import { createNewsletterHandler } from './newsletter.mjs';

async function sendMail(message,config) {
  const payload={...message,from:{name:'IMAN',email:'hola@iman.ar'}};
  if(config.native){
    const result=await config.transport.send(payload);
    if(!result?.messageId)throw new Error('mail_acceptance_unknown');
    return result;
  }
  // A Cloudflare service binding: this request never goes over the public Internet.
  const response=await config.transport.fetch('https://iman-correo.internal/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  let result;try{result=await response.json();}catch{throw new Error('mail_acceptance_unknown');}
  if(!response.ok || !result.messageId)throw Object.assign(new Error('mail_delivery_failed'),{code:result.code});
  return result;
}
// Asks the WhatsApp assistant (bot on agenda.iman.ar) to write first to someone who left their number. The token is a
// Pages secret shared only with the bot, so nobody can make it message arbitrary numbers. Returns the bot's outcome.
async function startChat(lead,env){
  const url=typeof env.BOT_URL==='string'?env.BOT_URL.replace(/\/$/,''):'', token=typeof env.BOT_TOKEN==='string'?env.BOT_TOKEN:'';
  if(!url||!token)return null;
  const response=await fetch(`${url}/api/consulta`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
    body:JSON.stringify({nombre:lead.nombre,negocio:lead.negocio,email:lead.email,whatsapp:lead.whatsapp,rubro:lead.rubro,ciudad:lead.ciudad,servicios:lead.servicios,comentario:lead.comentario}),
    signal:AbortSignal.timeout(6000)});
  if(!response.ok)throw new Error(`bot_${response.status}`);
  return (await response.json()).resultado||null;
}
const handleContact=createContactHandler({sendMail,startChat});
const handleNewsletter=createNewsletterHandler({sendMail});
const WHATSAPP_FROM_INSTAGRAM='https://wa.me/5493535189997?text='+encodeURIComponent('Hola, vengo de Instagram y quiero info');

export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(url.hostname==='iman.ar'){
      url.protocol='https:';url.hostname='www.iman.ar';url.port='';
      return Response.redirect(url.href,308);
    }
    // Short link for the Instagram bio (iman.ar/wa): opens WhatsApp with the message the assistant recognizes as a lead.
    if(url.pathname==='/wa'||url.pathname==='/wa/')return Response.redirect(WHATSAPP_FROM_INSTAGRAM,302);
    if(url.pathname==='/api/contacto'||url.pathname==='/api/contacto/')return handleContact(request,env);
    if(url.pathname==='/api/newsletter'||url.pathname.startsWith('/api/newsletter/'))return handleNewsletter(request,env);
    if(url.pathname.startsWith('/api/'))return Response.json({ok:false,error:'No encontrado.'},{status:404,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
    const asset=await env.ASSETS.fetch(request);
    if(url.hostname!=='www.iman.ar'){
      if(url.pathname==='/robots.txt') return new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain','X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'}});
      const response=new Response(asset.body,asset);
      response.headers.set('X-Robots-Tag','noindex, nofollow');
      return response;
    }
    return asset;
  }
};

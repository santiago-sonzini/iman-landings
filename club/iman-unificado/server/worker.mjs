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
const handleContact=createContactHandler({sendMail});
const handleNewsletter=createNewsletterHandler({sendMail});

export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(url.hostname==='iman.ar'){
      url.protocol='https:';url.hostname='www.iman.ar';url.port='';
      return Response.redirect(url.href,308);
    }
    if(url.pathname==='/api/contacto'||url.pathname==='/api/contacto/')return handleContact(request,env);
    if(url.pathname==='/api/newsletter'||url.pathname.startsWith('/api/newsletter/'))return handleNewsletter(request,env);
    if(url.pathname.startsWith('/api/'))return Response.json({ok:false,error:'No encontrado.'},{status:404,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
    const asset=await env.ASSETS.fetch(request);
    if(url.hostname.endsWith('.pages.dev')){
      const response=new Response(asset.body,asset);
      response.headers.set('X-Robots-Tag','noindex, nofollow');
      return response;
    }
    return asset;
  }
};

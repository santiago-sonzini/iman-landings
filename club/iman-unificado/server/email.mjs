export const CALENDLY_URL = 'https://calendly.com/santiago-iman/30min';
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const E=escapeHTML;
const serviceList=lead => lead.servicios?.length ? lead.servicios : [lead.servicio || 'Quiero que me orienten'];
// Palette and type follow www.iman.ar: carbon background, serif headlines, gold indexes.
const INK='#eef0f4', MUTED='#a8b4c6', BLUE='#94a4bc', GOLD='#f4c430', CARD='#11141b', LINE='#262c39';
const SERIF="Georgia,'Times New Roman',serif", SANS="-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const WHATSAPP_URL='https://wa.me/5493535189997';
const paragraph=text=>`<p style="font-family:${SANS};font-size:15px;line-height:1.75;color:#c3cad6;margin:0 0 18px">${text}</p>`;
const heading=text=>`<h1 class="email-title" style="font-family:${SERIF};font-size:38px;font-weight:400;line-height:1.12;letter-spacing:-.5px;margin:0 0 24px;color:${INK}">${text}</h1>`;
const eyebrow=text=>`<p style="margin:0 0 16px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${BLUE}">${text}</p>`;
function button(label,url,solid=true){return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 26px"><tr><td align="center" bgcolor="${solid?INK:CARD}" style="background-color:${solid?INK:CARD};border:1px solid ${solid?INK:'#4a5366'};mso-padding-alt:15px 26px"><a href="${E(url)}" style="display:inline-block;padding:15px 26px;mso-padding-alt:0;color:${solid?CARD:INK};font-size:14px;font-family:${SANS};font-weight:600;text-decoration:none;line-height:20px">${label}</a></td></tr></table>`;}
const box=inner=>`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:6px 0 28px;background-color:#171b24;border:1px solid ${LINE}"><tr><td style="padding:22px 24px">${inner}</td></tr></table>`;
const numbered=items=>items.map((s,i)=>`<p style="margin:8px 0;font-family:${SERIF};font-size:18px;line-height:1.4;color:${INK}"><span style="font-family:'Courier New',monospace;font-size:11px;color:${GOLD}">0${i+1}&nbsp;&nbsp;&nbsp;</span>${E(s)}</p>`).join('');
function frame(preheader,body,footer='Este correo responde a una consulta realizada en iman.ar. No te suscribimos a ninguna lista.'){
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>IMÁN</title><style>@media screen and (max-width:480px){.email-pad{padding:28px 22px!important}.email-title{font-size:31px!important}}</style></head><body bgcolor="#0b0d12" style="margin:0;background-color:#0b0d12;color:${INK};font-family:${SANS};-webkit-text-size-adjust:100%"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${E(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0b0d12"><tr><td align="center" style="padding:28px 12px"><!--[if mso]><table role="presentation" width="600"><tr><td><![endif]--><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:${CARD};border:1px solid ${LINE}"><tr><td class="email-pad" style="padding:26px 36px;border-bottom:1px solid ${LINE}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td width="50" style="vertical-align:middle"><a href="https://www.iman.ar/"><img src="https://www.iman.ar/assets/experience/iman-simbolo-email.png" alt="" width="38" height="38" style="display:block;border:0;width:38px;height:38px"></a></td><td style="vertical-align:middle"><a href="https://www.iman.ar/" style="font-family:${SERIF};font-size:28px;font-weight:400;letter-spacing:1px;color:${INK};text-decoration:none">IMÁN</a></td><td align="right" style="vertical-align:middle;font-family:'Courier New',monospace;font-size:9px;line-height:1.8;letter-spacing:1.5px;color:${BLUE}">VENDÉ MÁS<br>TRABAJÁ MENOS</td></tr></table></td></tr><tr><td class="email-pad" style="padding:40px 36px 30px">${body}</td></tr><tr><td class="email-pad" style="padding:22px 36px;border-top:1px solid ${LINE};font-family:${SANS};font-size:11px;line-height:1.7;color:#7d8798">${footer}<br><a href="https://www.iman.ar/" style="color:${MUTED};text-decoration:underline">iman.ar</a> · <a href="https://www.iman.ar/privacidad/" style="color:${MUTED};text-decoration:underline">Privacidad</a> · Hecho en Argentina</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
}
export function confirmationEmail(lead){
  const services=serviceList(lead);
  const comment=lead.comentario?`<p style="margin:18px 0 0;padding-top:16px;border-top:1px solid ${LINE};font-family:${SANS};font-size:14px;line-height:1.7;color:${MUTED};white-space:pre-wrap;font-style:italic">“${E(lead.comentario)}”</p>`:'';
  return {
    subject:`Recibimos tu consulta, ${lead.nombre} · IMÁN`,
    text:`Hola, ${lead.nombre}.\n\nGracias por contarnos sobre ${lead.negocio}. Recibimos tu consulta.\n\nLo que te interesa:\n${services.map(s=>'- '+s).join('\n')}\n\nVamos a revisar tu consulta y te contactamos para entender tu negocio y armar una propuesta a medida.\n\nSi preferís, elegí un horario para conversar con Santiago:\n${CALENDLY_URL}\n\nTambién podés responder este correo o escribirnos por WhatsApp: ${WHATSAPP_URL}\n\nSantiago · IMÁN\nhttps://www.iman.ar/\n\nEsta consulta no te suscribe a ninguna lista.\nPrivacidad: https://www.iman.ar/privacidad/`,
    html:frame('Recibimos tu consulta. Te contactamos para armar una propuesta a medida.',
      eyebrow('Consulta recibida')
      +heading(`Gracias, ${E(lead.nombre)}.<br><em style="font-style:italic;color:#c9d3e3">Ya estamos en eso.</em>`)
      +paragraph(`Recibimos tu consulta sobre <strong style="color:${INK};font-weight:600">${E(lead.negocio)}</strong>. Vamos a revisar tu consulta y contactarte para entender cómo trabajás hoy y armar una propuesta a medida.`)
      +box(eyebrow('Lo que te interesa')+numbered(services)+comment)
      +paragraph('Si querés adelantar, elegí un horario para una charla de 30 minutos con Santiago:')
      +button('Elegir un horario',CALENDLY_URL)
      +paragraph(`También podés responder este correo o <a href="${WHATSAPP_URL}" style="color:${INK};text-decoration:underline">escribirnos por WhatsApp</a>.`)
      +`<p style="margin:30px 0 0;font-family:${SERIF};font-size:20px;line-height:1.3;color:${INK}">Santiago<br><span style="font-family:${SANS};font-size:12px;color:${MUTED}">IMÁN · Tecnología a medida para pymes</span></p>`)
  };
}
export function ownerEmail(lead){
  const services=serviceList(lead);
  const fields=[['Nombre',lead.nombre],['Negocio',lead.negocio],['Email',lead.email],['WhatsApp',lead.whatsapp||'No indicado'],['Rubro',lead.rubro||'No indicado'],['Ciudad',lead.ciudad||'No indicada'],['Consulta',lead.comentario||'Sin comentario adicional'],['Página',lead.source||'No indicada'],...Object.entries(lead.utm||{}).map(([k,v])=>[k,v])];
  const phone=(lead.whatsapp||'').replace(/\D/g,'');
  return {
    subject:`Nueva consulta IMÁN · ${lead.negocio}`,
    text:`Nueva consulta desde iman.ar\n\nServicios: ${services.join(', ')}\n${fields.map(([k,v])=>`${k}: ${v}`).join('\n')}\n\nAutorizó recibir una respuesta a su consulta. Respondé este correo para contactar al cliente. No es una suscripción a marketing.`,
    html:frame(`${lead.nombre} · ${lead.negocio} · ${services.join(', ')}`,
      eyebrow('Nueva consulta desde iman.ar')
      +heading(`${E(lead.negocio)}<br><em style="font-style:italic;color:#c9d3e3">quiere hablar.</em>`)
      +box(eyebrow('Servicios')+numbered(services))
      +`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px">${fields.map(([k,v])=>`<tr><td style="padding:13px 0;border-bottom:1px solid ${LINE};vertical-align:top;width:92px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${BLUE}">${E(k)}</td><td style="padding:13px 0 13px 12px;border-bottom:1px solid ${LINE};font-family:${SANS};font-size:14px;line-height:1.65;color:${INK};word-break:break-word;white-space:pre-wrap">${E(v)}</td></tr>`).join('')}</table>`
      +button(`Responder a ${E(lead.nombre)}`,'mailto:'+lead.email)
      +(phone.length>=8?button('Escribir por WhatsApp','https://wa.me/'+phone,false):'')
      +paragraph('La persona autorizó una respuesta comercial a esta consulta, no una suscripción.'),
      'Notificación interna de una consulta recibida en iman.ar.')
  };
}
export function newsletterEmail(person,confirmationURL,unsubscribeURL){return {
  subject:'Un paso más para recibir ideas de IMAN',
  text:`Hola, ${person.nombre}.\n\nPediste recibir ideas para que tus clientes vuelvan. Confirmá tu email para sumarte:\n${confirmationURL}\n\nVas a recibir ideas de fidelización, comunicación y automatización para comercios. Podés darte de baja cuando quieras. Este enlace vence en 48 horas.\n\nSi no lo solicitaste, ignorá este correo: no te vamos a suscribir. También podés cancelar la solicitud:\n${unsubscribeURL}\n\nIMAN · https://www.iman.ar/`,
  html:frame('Confirmá tu email para recibir ideas de IMAN.',eyebrow('IDEAS / PARA TU COMERCIO')+heading('Clientes que vuelven.<br>Ideas que ayudan.')+paragraph(`Hola, ${E(person.nombre)}. Confirmá tu email para recibir ideas de fidelización, comunicación y automatización para tu comercio.`)+button('Confirmar mi email',confirmationURL)+paragraph('Este enlace vence en 48 horas. Podés darte de baja cuando quieras.'),`Recibís este mensaje porque se solicitó una suscripción en iman.ar. Si no fuiste vos, ignoralo: no te vamos a suscribir. <a href="${E(unsubscribeURL)}" style="color:#d2cfc6">Cancelar solicitud</a>.`)
};}
export function newsletterWelcomeEmail(person,unsubscribeURL){
  const resourceURL='https://www.iman.ar/recursos/recuperar-clientes/';
  const ideas=[['Dale un motivo para volver.','Ofrecé un beneficio concreto en la próxima compra, con una condición fácil de entender.'],['Elegí el momento.','Separá a quienes compraron hace poco de quienes hace tiempo no vuelven antes de mandar el mismo mensaje a todos.'],['Medí la segunda compra.','Mirá cuántos clientes regresan y qué propuesta los trae de nuevo.']];
  return {subject:'Bienvenido a IMAN · Tres ideas para que tus clientes vuelvan',text:`Hola, ${person.nombre}.\n\nTu suscripción está confirmada. Para empezar:\n\n${ideas.map(([h,p],i)=>`${i+1}. ${h} ${p}`).join('\n\n')}\n\nLeé la guía: ${resourceURL}\n\nSantiago · IMAN\n\nPodés darte de baja: ${unsubscribeURL}`,html:frame('Tu suscripción está confirmada. Empezamos con tres ideas.',eyebrow('IDEAS / BIENVENIDO A IMAN')+heading('Hagamos que<br>vuelvan.')+paragraph(`Hola, ${E(person.nombre)}. Tu suscripción está confirmada. Para empezar, tres ideas que podés llevar a tu comercio:`)+ideas.map(([h,p],i)=>`<div style="border-bottom:1px solid #50504c;padding:20px 0">${eyebrow('0'+(i+1))}<h2 style="color:#eeeae1;font-size:19px;font-weight:400;margin:0 0 12px">${h}</h2>${paragraph(p)}</div>`).join('')+button('Leer la guía completa',resourceURL)+paragraph('Gracias por sumarte.<br>Santiago · IMAN'),`Recibís este mensaje porque confirmaste tu suscripción. <a href="${E(unsubscribeURL)}" style="color:#d2cfc6">Darte de baja</a>.`)};
}

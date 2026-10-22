export const AGENDA_URL = 'https://agenda.iman.ar';
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const E=escapeHTML;
const serviceList=lead => lead.servicios?.length ? lead.servicios : [lead.servicio || 'Quiero que me orienten'];
// V1 identity: neutral dark surfaces, sans-serif titles and the original gradient-accent wordmark.
const INK='#f2f2f2', MUTED='#aaa8b0', ACCENT='#c7bcdf', CARD='#121212', LINE='#303034';
const TITLE_FONT="Arial,Helvetica,sans-serif", SANS="Arial,Helvetica,sans-serif";
const WHATSAPP_URL='https://wa.me/5493535189997';
const paragraph=text=>`<p style="font-family:${SANS};font-size:15px;line-height:1.75;color:#c6c4cb;margin:0 0 18px">${text}</p>`;
const heading=text=>`<h1 class="email-title" style="font-family:${TITLE_FONT};font-size:38px;font-weight:500;line-height:1.12;letter-spacing:-1.3px;margin:0 0 24px;color:${INK}">${text}</h1>`;
const eyebrow=text=>`<p style="margin:0 0 16px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${ACCENT}">${text}</p>`;
function button(label,url,solid=true){return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 26px"><tr><td align="center" bgcolor="${solid?INK:CARD}" style="background-color:${solid?INK:CARD};border:1px solid ${solid?INK:'#5a565f'};mso-padding-alt:15px 26px"><a href="${E(url)}" style="display:inline-block;padding:15px 26px;mso-padding-alt:0;color:${solid?CARD:INK};font-size:14px;font-family:${SANS};font-weight:600;text-decoration:none;line-height:20px">${label}</a></td></tr></table>`;}
const box=inner=>`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:6px 0 28px;background-color:#1a1a1a;border:1px solid ${LINE}"><tr><td style="padding:22px 24px">${inner}</td></tr></table>`;
const numbered=items=>items.map((s,i)=>`<p style="margin:8px 0;font-family:${TITLE_FONT};font-size:18px;line-height:1.4;color:${INK}"><span style="font-family:'Courier New',monospace;font-size:11px;color:${ACCENT}">0${i+1}&nbsp;&nbsp;&nbsp;</span>${E(s)}</p>`).join('');
function frame(preheader,body,footer='Este correo responde a una consulta realizada en iman.ar. No te suscribimos a ninguna lista.'){
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>IMÁN</title><style>@media screen and (max-width:480px){.email-pad{padding:28px 22px!important}.email-title{font-size:31px!important}}</style></head><body bgcolor="#121212" style="margin:0;background-color:#121212;color:${INK};font-family:${SANS};-webkit-text-size-adjust:100%"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${E(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#121212"><tr><td align="center" style="padding:28px 12px"><!--[if mso]><table role="presentation" width="600"><tr><td><![endif]--><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:${CARD};border:1px solid ${LINE}"><tr><td class="email-pad" style="padding:26px 36px;border-bottom:1px solid ${LINE}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="vertical-align:middle"><a href="https://www.iman.ar/"><img src="https://www.iman.ar/assets/identity-variants/logo-v1.png" alt="IMÁN" width="140" height="57" style="display:block;border:0;width:140px;height:57px"></a></td><td align="right" style="vertical-align:middle;font-family:'Courier New',monospace;font-size:9px;line-height:1.8;letter-spacing:1.5px;color:${ACCENT}">VENDÉ MÁS<br>GANÁ TIEMPO</td></tr></table></td></tr><tr><td class="email-pad" style="padding:40px 36px 30px">${body}</td></tr><tr><td class="email-pad" style="padding:22px 36px;border-top:1px solid ${LINE};font-family:${SANS};font-size:11px;line-height:1.7;color:#99959f">${footer}<br><a href="https://www.iman.ar/" style="color:${MUTED};text-decoration:underline">iman.ar</a> · <a href="https://www.iman.ar/privacidad/" style="color:${MUTED};text-decoration:underline">Privacidad</a> · Hecho en Argentina</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
}
export function confirmationEmail(lead){
  const services=serviceList(lead);
  const comment=lead.comentario?`<p style="margin:18px 0 0;padding-top:16px;border-top:1px solid ${LINE};font-family:${SANS};font-size:14px;line-height:1.7;color:${MUTED};white-space:pre-wrap;font-style:italic">“${E(lead.comentario)}”</p>`:'';
  return {
    subject:`Recibimos tu consulta, ${lead.nombre} · IMÁN`,
    text:`Hola, ${lead.nombre}.\n\nGracias por contarnos sobre ${lead.negocio}. Recibimos tu consulta.\n\nLo que te interesa:\n${services.map(s=>'- '+s).join('\n')}\n\nVamos a revisar tu consulta y te contactamos para entender tu negocio y armar una propuesta a medida.\n\nSi preferís, elegí un horario para conversar con Santiago:\n${AGENDA_URL}\n\nTambién podés responder este correo o escribirnos por WhatsApp: ${WHATSAPP_URL}\n\nSantiago · IMÁN\nhttps://www.iman.ar/\n\nEsta consulta no te suscribe a ninguna lista.\nPrivacidad: https://www.iman.ar/privacidad/`,
    html:frame('Recibimos tu consulta. Te contactamos para armar una propuesta a medida.',
      eyebrow('Consulta recibida')
      +heading(`Gracias, ${E(lead.nombre)}.<br><em style="font-style:normal;color:#c7bcdf">Ya estamos en eso.</em>`)
      +paragraph(`Recibimos tu consulta sobre <strong style="color:${INK};font-weight:600">${E(lead.negocio)}</strong>. Vamos a revisar tu consulta y contactarte para entender cómo trabajás hoy y armar una propuesta a medida.`)
      +box(eyebrow('Lo que te interesa')+numbered(services)+comment)
      +paragraph('Si querés adelantar, elegí un horario para una charla de 30 minutos con Santiago:')
      +button('Elegir un horario',AGENDA_URL)
      +paragraph(`También podés responder este correo o <a href="${WHATSAPP_URL}" style="color:${INK};text-decoration:underline">escribirnos por WhatsApp</a>.`)
      +`<p style="margin:30px 0 0;font-family:${TITLE_FONT};font-size:20px;line-height:1.3;color:${INK}">Santiago<br><span style="font-family:${SANS};font-size:12px;color:${MUTED}">IMÁN · Tecnología a medida para pymes</span></p>`)
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
      +heading(`${E(lead.negocio)}<br><em style="font-style:normal;color:#c7bcdf">quiere hablar.</em>`)
      +box(eyebrow('Servicios')+numbered(services))
      +`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px">${fields.map(([k,v])=>`<tr><td style="padding:13px 0;border-bottom:1px solid ${LINE};vertical-align:top;width:92px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${ACCENT}">${E(k)}</td><td style="padding:13px 0 13px 12px;border-bottom:1px solid ${LINE};font-family:${SANS};font-size:14px;line-height:1.65;color:${INK};word-break:break-word;white-space:pre-wrap">${E(v)}</td></tr>`).join('')}</table>`
      +button(`Responder a ${E(lead.nombre)}`,'mailto:'+lead.email)
      +(phone.length>=8?button('Escribir por WhatsApp','https://wa.me/'+phone,false):'')
      +paragraph('La persona autorizó una respuesta comercial a esta consulta, no una suscripción.'),
      'Notificación interna de una consulta recibida en iman.ar.')
  };
}
// The notice each person of the team gets when someone finishes the Blin × IMÁN test (iman.ar/blin/).
export function blinLeadEmail(lead,detail){
  const who=lead.negocio||lead.nombre;
  const phone=(lead.whatsapp||'').replace(/\D/g,'');
  const fields=[['Nombre',lead.nombre],['Negocio',lead.negocio||'No indicado'],['WhatsApp',lead.whatsapp],['Email',lead.email||'No indicado'],['Instagram',lead.instagram||'No indicado']];
  const answers=detail.split('\n').slice(1).map(line=>{const i=line.indexOf(': ');return i>0?[line.slice(0,i),line.slice(i+2)]:['',line];});
  const rows=list=>`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px">${list.map(([k,v])=>`<tr><td style="padding:13px 0;border-bottom:1px solid ${LINE};vertical-align:top;width:110px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${ACCENT}">${E(k)}</td><td style="padding:13px 0 13px 12px;border-bottom:1px solid ${LINE};font-family:${SANS};font-size:14px;line-height:1.65;color:${INK};word-break:break-word">${E(v)}</td></tr>`).join('')}</table>`;
  return {
    subject:`Test Blin × IMÁN · ${who} · ${lead.plan}`,
    text:`${detail}\n\n${fields.map(([k,v])=>`${k}: ${v}`).join('\n')}\n\nYa quedó como lead en el panel del asistente.${phone.length>=8?`\nWhatsApp: https://wa.me/${phone}`:''}`,
    html:frame(`${lead.nombre} · ${who} · ${lead.plan}`,
      eyebrow('Test de Blin × IMÁN · iman.ar/blin')
      +heading(`${E(who)}<br><em style="font-style:normal;color:#c7bcdf">${E(lead.plan)}</em>`)
      +rows(fields)
      +box(eyebrow('Sus respuestas')+rows(answers))
      +(phone.length>=8?button('Escribir por WhatsApp','https://wa.me/'+phone):'')
      +(lead.email?button(`Responder a ${E(lead.nombre)}`,'mailto:'+lead.email,false):'')
      +paragraph('Ya quedó como lead en el panel del asistente.'),
      'Notificación interna de un test hecho en iman.ar/blin/.')
  };
}
export function newsletterEmail(person,confirmationURL,unsubscribeURL){return {
  subject:'Un paso más para recibir ideas de IMAN',
  text:`Hola, ${person.nombre}.\n\nPediste recibir ideas para que tus clientes vuelvan. Confirmá tu email para sumarte:\n${confirmationURL}\n\nVas a recibir ideas de fidelización, comunicación y automatización para comercios. Podés darte de baja cuando quieras. Este enlace vence en 48 horas.\n\nSi no lo solicitaste, ignorá este correo: no te vamos a suscribir. También podés cancelar la solicitud:\n${unsubscribeURL}\n\nIMAN · https://www.iman.ar/`,
  html:frame('Confirmá tu email para recibir ideas de IMAN.',eyebrow('IDEAS / PARA TU COMERCIO')+heading('Clientes que vuelven.<br>Ideas que ayudan.')+paragraph(`Hola, ${E(person.nombre)}. Confirmá tu email para recibir ideas de fidelización, comunicación y automatización para tu comercio.`)+button('Confirmar mi email',confirmationURL)+paragraph('Este enlace vence en 48 horas. Podés darte de baja cuando quieras.'),`Recibís este mensaje porque se solicitó una suscripción en iman.ar. Si no fuiste vos, ignoralo: no te vamos a suscribir. <a href="${E(unsubscribeURL)}" style="color:#c7bcdf">Cancelar solicitud</a>.`)
};}
export function newsletterWelcomeEmail(person,unsubscribeURL){
  const resourceURL='https://www.iman.ar/recursos/recuperar-clientes/';
  const ideas=[['Dale un motivo para volver.','Ofrecé un beneficio concreto en la próxima compra, con una condición fácil de entender.'],['Elegí el momento.','Separá a quienes compraron hace poco de quienes hace tiempo no vuelven antes de mandar el mismo mensaje a todos.'],['Medí la segunda compra.','Mirá cuántos clientes regresan y qué propuesta los trae de nuevo.']];
  return {subject:'Bienvenido a IMAN · Tres ideas para que tus clientes vuelvan',text:`Hola, ${person.nombre}.\n\nTu suscripción está confirmada. Para empezar:\n\n${ideas.map(([h,p],i)=>`${i+1}. ${h} ${p}`).join('\n\n')}\n\nLeé la guía: ${resourceURL}\n\nSantiago · IMAN\n\nPodés darte de baja: ${unsubscribeURL}`,html:frame('Tu suscripción está confirmada. Empezamos con tres ideas.',eyebrow('IDEAS / BIENVENIDO A IMAN')+heading('Hagamos que<br>vuelvan.')+paragraph(`Hola, ${E(person.nombre)}. Tu suscripción está confirmada. Para empezar, tres ideas que podés llevar a tu comercio:`)+ideas.map(([h,p],i)=>`<div style="border-bottom:1px solid #303034;padding:20px 0">${eyebrow('0'+(i+1))}<h2 style="color:#f2f2f2;font-size:19px;font-weight:400;margin:0 0 12px">${h}</h2>${paragraph(p)}</div>`).join('')+button('Leer la guía completa',resourceURL)+paragraph('Gracias por sumarte.<br>Santiago · IMAN'),`Recibís este mensaje porque confirmaste tu suscripción. <a href="${E(unsubscribeURL)}" style="color:#c7bcdf">Darte de baja</a>.`)};
}
const utc=t=>new Date(t*1000).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
export const googleCalendarURL=(title,booking)=>'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:title,dates:`${utc(booking.inicio)}/${utc(booking.fin)}`,details:`Link de Google Meet: ${booking.meet}`,location:booking.meet});
// The notice each person of the team gets when a call is booked from the diagnosis: when, the Meet, the answers and how to reach them.
export function teamBookingEmail(lead,booking){
  // "jueves 22 de octubre a las 18:30 (16:30 en Perú)": Argentina's time, and the client's when they booked from abroad.
  const [,ours,theirs]=booking.cuando.match(/^(.*?)(?: \(([^()]+ en [^()]+)\))?$/);
  const cuando=ours.charAt(0).toUpperCase()+ours.slice(1);
  const zone=theirs?`Hora de Argentina · ${theirs} para el cliente`:'Hora de Argentina';
  // The diagnosis travels as "Clave: valor" lines; the first one only says where it was made.
  const answers=lead.comentario.split('\n').slice(1).map(line=>line.split(/:\s(.*)/s)).filter(([k,v])=>k&&v);
  const contact=[['Nombre',lead.nombre],['Email',lead.email],['WhatsApp',lead.whatsapp||'No indicado'],['Página',lead.source||'No indicada'],...Object.entries(lead.utm||{})];
  const phone=(lead.whatsapp||'').replace(/\D/g,'');
  const table=rows=>`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px">${rows.map(([k,v])=>`<tr><td style="padding:12px 0;border-bottom:1px solid ${LINE};vertical-align:top;width:104px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${ACCENT}">${E(k)}</td><td style="padding:12px 0 12px 12px;border-bottom:1px solid ${LINE};font-family:${SANS};font-size:14px;line-height:1.6;color:${INK};word-break:break-word">${E(v)}</td></tr>`).join('')}</table>`;
  const calendar=googleCalendarURL(`Llamada con ${lead.nombre} · ${lead.negocio}`,booking);
  // Booked from the diagnosis or from the onboarding behind the home's "Conocer más" (/conocer/): the mail says which.
  const diagnosis=lead.source==='/diagnostico/',from=diagnosis?'desde el diagnóstico':'desde el onboarding de la web',answersTitle=diagnosis?'Su diagnóstico':'Sus respuestas';
  const minutes=Math.round((booking.fin-booking.inicio)/60);
  const why={sin_whatsapp:'el número no tiene WhatsApp',telefono_invalido:'el número no es válido',whatsapp_desconectado:'el WhatsApp de IMÁN está desconectado'};
  const whatsapp=booking.whatsapp==='enviado'
    ?(booking.mail?'Ya le confirmamos por WhatsApp y por mail.':'Ya le confirmamos por WhatsApp; el mail de confirmación no salió.')
    :`${booking.mail?'Le confirmamos por mail.':'El mail de confirmación no salió.'} Por WhatsApp no le escribimos: ${why[booking.whatsapp]||'no se pudo'}.`;
  return {
    subject:`Llamada agendada · ${lead.negocio} · ${booking.cuando}`,
    text:`${lead.negocio} agendó una llamada ${from}.\n\nCuándo: ${cuando} (hora de Argentina${theirs?`; ${theirs} para el cliente`:''}), ${minutes} minutos.\nMeet: ${booking.meet}\nAgregar a Google Calendar: ${calendar}\n\n${whatsapp}\n\n${answersTitle}\n${answers.map(([k,v])=>`${k}: ${v}`).join('\n')}\n\nContacto\n${contact.map(([k,v])=>`${k}: ${v}`).join('\n')}\n\nRespondé este correo para escribirle a ${lead.nombre}.`,
    html:frame(`${cuando} · ${lead.nombre} · ${lead.negocio}`,
      eyebrow(`Llamada agendada ${from}`)
      +heading(`${E(lead.negocio)}<br><em style="font-style:normal;color:#c7bcdf">agendó una llamada.</em>`)
      +box(eyebrow('Cuándo')+`<p style="margin:0 0 6px;font-family:${TITLE_FONT};font-size:24px;line-height:1.25;letter-spacing:-.5px;color:${INK}">${E(cuando)}</p><p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:${MUTED}">${E(zone)} · ${minutes} minutos · Google Meet</p>`)
      +button('Entrar a la videollamada',booking.meet)
      +paragraph(`<a href="${E(calendar)}" style="color:${INK};text-decoration:underline">Agregar a Google Calendar</a> · ${E(whatsapp)}`)
      +eyebrow(answersTitle)+table(answers)
      +eyebrow('Contacto')+table(contact)
      +button(`Responder a ${E(lead.nombre)}`,'mailto:'+lead.email)
      +(phone.length>=8?button('Escribir por WhatsApp','https://wa.me/'+phone,false):''),
      `Aviso interno de una llamada agendada en iman.ar${lead.source||'/'}.`)
  };
}

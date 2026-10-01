(() => {
  'use strict';
  const form=document.querySelector('#inquiry-form');
  if(!form)return;
  const submit=form.querySelector('[type="submit"]'), label=submit.querySelector('.cta-label');
  const status=form.querySelector('.form-status'), error=form.querySelector('.form-error');
  const industry=form.elements.rubro, other=form.elements.rubro_otro;
  const serviceError=document.querySelector('#services-error');
  let pending=false, previousPayload='', requestId='';
  submit.disabled=false;
  industry.addEventListener('change',()=>{
    const show=industry.value==='Otro';other.closest('.field').hidden=!show;other.disabled=!show;other.required=show;
  });
  form.querySelectorAll('[name="servicios"]').forEach(input=>input.addEventListener('change',()=>{serviceError.textContent='';input.removeAttribute('aria-invalid');}));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(pending)return;
    error.hidden=true;error.textContent='';status.textContent='';serviceError.textContent='';
    const services=[...form.querySelectorAll('[name="servicios"]:checked')].map(x=>x.value);
    if(!services.length){serviceError.textContent='Elegí al menos un servicio. Podés seleccionar los tres.';const first=form.querySelector('[name="servicios"]');first.setAttribute('aria-invalid','true');first.setAttribute('aria-describedby','services-error');first.focus();return;}
    if(!form.reportValidity())return;
    const data=new FormData(form), payload={};
    for(const field of ['nombre','negocio','email','whatsapp','ciudad','comentario','sitio_web_empresa'])payload[field]=String(data.get(field)||'').trim();
    payload.rubro=industry.value==='Otro'?other.value.trim():industry.value;
    if(!payload.rubro){other.setCustomValidity('Contanos el rubro de tu negocio.');other.reportValidity();other.addEventListener('input',()=>other.setCustomValidity(''),{once:true});return;}
    payload.servicios=services;payload.consentimiento=data.get('consentimiento')==='on';payload.source=location.pathname;
    const params=new URLSearchParams(location.search);
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){if(params.has(key))payload[key]=params.get(key).slice(0,key==='utm_source'||key==='utm_medium'?120:180);}
    const serialized=JSON.stringify(payload);
    if(serialized!==previousPayload){previousPayload=serialized;requestId=crypto.randomUUID();}
    pending=true;submit.disabled=true;form.setAttribute('aria-busy','true');label.textContent='Enviando…';status.textContent='Estamos enviando tu consulta.';
    const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch('/api/contacto',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestId},body:serialized,signal:controller.signal});
      let result;try{result=await response.json();}catch{throw new Error('No pudimos confirmar el envío. Tus datos siguen acá; podés reintentar.');}
      if(!response.ok||result.ok!==true)throw new Error(result.error||'No pudimos confirmar el envío. Probá otra vez o escribinos por WhatsApp.');
      form.hidden=true;const success=document.querySelector('.inquiry-success');success.hidden=false;
      success.querySelector('[data-success-message]').textContent=(result.whatsapp==='enviado'?'¡Listo! Te acabamos de escribir por WhatsApp para seguir la charla por ahí. ':'')
        +(result.confirmationSent?'Recibimos tu consulta y enviamos una confirmación a tu email.':'Recibimos tu consulta. La confirmación por email no pudo enviarse, pero tu mensaje ya está en nuestro circuito de atención.');
      success.focus();
      dispatchEvent(new CustomEvent('iman:consulta'));   // pixel.js counts it as a lead
    }catch(problem){status.textContent='';error.textContent=problem.name==='AbortError'?'El envío tardó más de lo esperado. No podemos confirmarlo todavía. Conservamos tus datos: podés reintentar sin duplicar la consulta.':problem.message;error.hidden=false;}
    finally{clearTimeout(timeout);pending=false;submit.disabled=false;form.removeAttribute('aria-busy');label.textContent='Enviar consulta';}
  });
})();

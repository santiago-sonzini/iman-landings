/* IMÁN · Conocer: the onboarding behind the home's "Conocer más". Three steps: the rubro, the client's data and budget,
   and the agenda. The data reach IMÁN as soon as they are complete (/api/contacto: a mail to the team, and the WhatsApp
   assistant writes to them offering times), so nobody is lost if they don't book. Then the free times come from
   /api/agenda and the call is booked right there, with the same data (server/booking.mjs). */
(() => {
  'use strict';
  const view=document.querySelector('[data-view]');
  if(!view)return;
  // The onboarding's box: the whole page on /conocer/, the dark sheet under IMÁN on the home.
  const root=view.closest('[data-cn]')||document.body;
  const AGENDA='https://agenda.iman.ar/', WA='https://wa.me/5493535189997';

  /* ---------- Content ---------- */

  // [id, the rubro, what it covers]. The id also works as ?rubro= in the address (for ads by rubro).
  const RUBROS=[
    ['gastronomia','Gastronomía','Bar, restaurante, delivery'],
    ['cafeteria','Cafetería','Café de especialidad, panadería'],
    ['comercio','Comercio','Local, almacén, kiosco'],
    ['indumentaria','Indumentaria','Ropa, calzado, accesorios'],
    ['petshop','Pet shop','Mascotas y forrajería'],
    ['mayorista','Mayorista','Venta por mayor'],
    ['distribuidora','Distribuidora','Reparto y cartera de clientes'],
    ['barberia','Barbería y estética','Peluquería, uñas, spa'],
    ['salud','Salud','Consultorio, clínica, kinesiología'],
    ['gimnasio','Gimnasio','Box, crossfit, yoga'],
    ['autos','Agencia de autos','Concesionaria, usados'],
    ['inmobiliaria','Inmobiliaria','Ventas y alquileres'],
    ['industria','Industria','Fábrica, producción, compras'],
    ['contable','Estudio contable','Contadores y asesores'],
    ['otro','Otro rubro','Escribilo vos']
  ];
  // Monthly budget, as in the diagnosis.
  const PRESUPUESTOS=['Hasta $50.000','Entre $50.000 y $150.000','Entre $150.000 y $400.000','Más de $400.000','Todavía no lo sé'];

  /* ---------- Helpers and state ---------- */

  const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARROW='<span class="arr" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  // Progress lives in this tab only (sessionStorage): a reload keeps the step, closing the tab forgets the data.
  const KEY='iman.conocer.1';
  const blank=()=>({rubro:'',otro:'',datos:{nombre:'',negocio:'',email:'',whatsapp:'',presupuesto:'',consentimiento:false},guardado:'',reserva:null});
  let S=blank(),step='rubro',honey='';
  try{const saved=JSON.parse(sessionStorage.getItem(KEY));if(saved&&saved.datos){S=Object.assign(blank(),saved);step=saved.step||'rubro'}}catch(e){}
  const keep=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(Object.assign({},S,{step})))}catch(e){}};

  const rubro=()=>RUBROS.find(r=>r[0]===S.rubro);
  const rubroT=()=>S.rubro==='otro'&&S.otro?cap(S.otro):(rubro()?rubro()[1]:'');
  const ready=()=>Boolean(rubro()&&(S.rubro!=='otro'||S.otro));
  const filled=()=>{const d=S.datos;return Boolean(d.nombre&&d.negocio&&d.email&&d.whatsapp&&d.presupuesto&&d.consentimiento)};
  const utm=()=>{
    const params=new URLSearchParams(location.search),found={};
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'])if(params.has(key))found[key]=params.get(key).slice(0,key==='utm_source'||key==='utm_medium'?120:180);
    return found;
  };
  // What IMÁN receives, in the inquiry and in the booked call. The answers travel as "Clave: valor" lines (the team's
  // mail and the WhatsApp assistant read them that way); the first line says where they come from.
  const lead=()=>{
    const d=S.datos,b=d.presupuesto==='Todavía no lo sé'?d.presupuesto:d.presupuesto+' por mes';
    return Object.assign({nombre:d.nombre,negocio:d.negocio,email:d.email,whatsapp:d.whatsapp,sitio_web_empresa:honey,
      rubro:rubroT().slice(0,120),servicios:['Quiero que me orienten'],
      comentario:['Onboarding en iman.ar/conocer/',`Rubro: ${rubroT()}`,`Presupuesto: ${b}`].join('\n'),
      consentimiento:true,source:location.pathname},utm());
  };
  const waLink=()=>WA+'?text='+encodeURIComponent(`Hola, quiero agendar una llamada.\nRubro: ${rubroT()}${S.datos.presupuesto?`\nPresupuesto: ${S.datos.presupuesto}`:''}`);
  // The same body gets the same key, so a retry never sends the inquiry twice.
  const keys={};
  const key=body=>keys[body]||(keys[body]=crypto.randomUUID());
  async function post(url,payload,ms){
    const body=JSON.stringify(payload),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),ms);
    try{
      const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key(url+body)},body,signal:controller.signal});
      let result={};try{result=await response.json()}catch(e){}
      return {status:response.status,result};
    }finally{clearTimeout(timeout)}
  }

  /* ---------- Steps ---------- */

  const steps=$$('.cn-steps li'),back=$('[data-back]');
  const INDEX={rubro:0,datos:1,horario:2,listo:3,luego:3};
  const PREV={datos:'rubro',horario:'datos'};
  // A step can only be shown once the ones before it are done.
  const allowed=s=>s==='rubro'||(s==='datos'&&ready())||(s==='horario'&&ready()&&filled())||(s==='listo'&&S.reserva)||(s==='luego'&&filled());

  // Each step is an entry in the browser history (d counts how many this page added), so the back button goes one step back.
  const depth=()=>(history.state&&history.state.d)||0;
  function render(next,{push=true,focus=true}={}){
    step=allowed(next)?next:!ready()?'rubro':!filled()?'datos':'horario';
    keep();
    if(push)history.pushState({cn:step,d:depth()+1},'');else history.replaceState({cn:step,d:depth()},'');
    if(step==='horario')slot=null;
    const n=INDEX[step];
    steps.forEach((li,i)=>{li.classList.toggle('on',i===n);li.classList.toggle('ok',i<n);if(i===n)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current')});
    back.hidden=!PREV[step];
    view.innerHTML=VIEWS[step]();
    if(!reduce){view.classList.remove('is-in');void view.offsetWidth;view.classList.add('is-in')}
    if(step==='datos'){fill();load()}
    if(step==='horario')drawAgenda();
    // A new step starts at the top of the onboarding, never above it (on the home that would be IMÁN).
    if(focus){if(root.getBoundingClientRect().top<0)root.scrollIntoView({block:'start'});$('#cn-title',view).focus({preventScroll:true})}
  }

  const VIEWS={
    rubro:()=>`<p class="kick">Conocer IMÁN</p>
<h1 id="cn-title" tabindex="-1">¿Qué negocio tenés?</h1>
<p class="cn-hint">Elegí tu rubro. Preparamos la llamada con ejemplos de negocios como el tuyo.</p>
<div class="cn-rubros" role="group" aria-labelledby="cn-title">${RUBROS.map(r=>`<button class="cn-r" type="button" data-r="${r[0]}" aria-pressed="${r[0]===S.rubro}"><b>${esc(r[1])}</b><small>${esc(r[2])}</small></button>`).join('')}</div>
${S.rubro==='otro'?`<form class="cn-other" data-other novalidate><label class="sr" for="cn-otro">¿Cuál es tu rubro?</label><input id="cn-otro" maxlength="80" placeholder="¿Cuál? Por ejemplo: óptica, vivero, librería" value="${esc(S.otro)}" autocomplete="off" enterkeyhint="next"><button class="btn btn-ink" type="submit">Seguir ${ARROW}</button></form>`:''}`,

    datos:()=>`<p class="cn-chip">${esc(rubroT())}<button type="button" data-change>Cambiar</button></p>
<h1 id="cn-title" tabindex="-1">¿Con quién hablamos?</h1>
<p class="cn-hint">Con tus datos preparamos la llamada. En el paso siguiente elegís el horario; si ninguno te sirve, te escribimos para coordinar.</p>
<form class="cn-form" data-form novalidate>
<div class="fgrid">
<label class="fld" for="cn-nombre"><span>Tu nombre</span><input id="cn-nombre" name="nombre" autocomplete="name" maxlength="100" required></label>
<label class="fld" for="cn-negocio"><span>Nombre del negocio</span><input id="cn-negocio" name="negocio" autocomplete="organization" maxlength="120" required></label>
<label class="fld" for="cn-email"><span>Tu email</span><input id="cn-email" name="email" type="email" autocomplete="email" maxlength="254" required></label>
<label class="fld" for="cn-whatsapp"><span>WhatsApp · ahí te llega el link</span><input id="cn-whatsapp" name="whatsapp" type="tel" autocomplete="tel" maxlength="50" pattern="[0-9\\+\\(\\)\\.\\s\\-]{6,50}" title="Con código de área. Solo números, espacios y +" required></label>
</div>
<fieldset class="cn-budget"><legend>¿Cuánto pensás invertir por mes?</legend><p>Sirve para ajustar la propuesta. No te compromete a nada.</p>
<div class="cn-pills">${PRESUPUESTOS.map((p,i)=>`<label><input type="radio" name="presupuesto" value="${esc(p)}"${i?'':' required'}><span>${esc(p)}</span></label>`).join('')}</div></fieldset>
<div class="honey" aria-hidden="true"><label>Dejar vacío<input name="sitio_web_empresa" tabindex="-1" autocomplete="off"></label></div>
<label class="consent"><input type="checkbox" name="consentimiento" required><span>Acepto que IMÁN me contacte por email y WhatsApp para coordinar esta llamada. <a href="/privacidad/" target="_blank" rel="noopener">Privacidad</a>.</span></label>
<button class="btn btn-ink" type="submit"><span data-label>Ver horarios</span> ${ARROW}</button>
<p class="f-status" role="status" aria-live="polite" aria-atomic="true"></p>
<p class="f-error" role="alert" hidden></p>
</form>`,

    horario:()=>`${S.guardado?`<p class="cn-saved">Listo, ${esc(S.datos.nombre.split(' ')[0])}: ya tenemos tus datos.</p>`:''}
<h1 id="cn-title" tabindex="-1">Elegí día y horario.</h1>
<p class="cn-hint">30 minutos por videollamada con Santiago, fundador de IMÁN. Hora de Argentina. El link de Meet te llega por mail y por WhatsApp.</p>
<div class="cn-agenda${days.length?'':' is-loading'}" data-agenda>
<p class="cn-note" role="alert" data-note hidden></p>
<div class="cn-days" role="group" aria-label="Días" data-days></div>
<p class="cn-day" data-day></p>
<div class="cn-times" role="group" aria-label="Horarios" data-times></div>
${days.length?'':'<p class="cn-wait">Buscando horarios libres…</p>'}
<div class="cn-confirm" data-confirm hidden><p><small>Tu llamada</small><span data-chosen></span></p><button class="btn btn-ink" type="button" data-book><span data-label>Confirmar la llamada</span> ${ARROW}</button></div>
<p class="f-status" role="status" aria-live="polite" aria-atomic="true"></p>
<p class="f-error" role="alert" hidden></p>
</div>
<p class="cn-later"><button class="link" type="button" data-later>Ningún horario me sirve: que me escriban</button></p>`,

    listo:()=>{const b=S.reserva;return `<div class="cn-done"><span class="cn-check" aria-hidden="true"></span>
<h1 id="cn-title" tabindex="-1">Quedó agendada.</h1>
<p class="cn-when">${esc(cap(b.cuando))}, hora de Argentina.</p>
<p>${b.whatsapp?'Te mandamos el link de Meet por mail y por WhatsApp.':'Te mandamos el link de Meet por mail.'} Llegamos a la llamada con tu rubro y tus datos leídos.</p>
<div class="actions"><a class="btn btn-ink" href="${esc(calendar(b))}" target="_blank" rel="noopener">Agregar a Google Calendar ${ARROW}</a>${b.meet?`<a class="link" href="${esc(b.meet)}" target="_blank" rel="noopener">Abrir el link de Meet</a>`:''}</div>
<p class="cn-after"><a class="link" href="/info/">Mientras tanto, mirá lo que hacemos</a></p></div>`},

    luego:()=>`<div class="cn-done"><span class="cn-check" aria-hidden="true"></span>
<h1 id="cn-title" tabindex="-1">Te escribimos.</h1>
<p class="cn-when">${S.guardado?'Ya tenemos tus datos.':'Tus datos no llegaron a enviarse.'}</p>
<p>${S.guardado?'Te escribimos por WhatsApp para encontrar un horario que te sirva.':'Mandanos tu rubro por WhatsApp y coordinamos el horario desde ahí.'}</p>
<div class="actions">${S.guardado?`<a class="btn btn-ink" href="/info/">Mirá lo que hacemos ${ARROW}</a><a class="link" href="${esc(waLink())}" target="_blank" rel="noopener">O escribinos vos por WhatsApp</a>`:`<a class="btn btn-ink" href="${esc(waLink())}" target="_blank" rel="noopener">Escribir por WhatsApp ${ARROW}</a><a class="link" href="${AGENDA}">Elegir en la agenda</a>`}</div>
<p class="cn-after"><button class="link" type="button" data-to="horario">Volver a los horarios</button></p></div>`
  };

  /* ---------- Step 1: the rubro ---------- */

  view.addEventListener('click',e=>{
    const r=e.target.closest('[data-r]');
    if(r){
      S.rubro=r.dataset.r;
      if(S.rubro==='otro'){render('rubro',{push:false,focus:false});$('#cn-otro',view).focus();return}
      $$('[data-r]',view).forEach(b=>b.setAttribute('aria-pressed',String(b===r)));
      setTimeout(()=>render('datos'),reduce?0:180);
    }
    else if(e.target.closest('[data-change]'))render('rubro');
    else if(e.target.closest('[data-to]'))render(e.target.closest('[data-to]').dataset.to);
  });
  view.addEventListener('submit',e=>{
    e.preventDefault();
    if(e.target.matches('[data-other]')){
      S.otro=$('#cn-otro',view).value.trim().slice(0,80);
      if(S.otro)render('datos');else $('#cn-otro',view).focus();
    }
    else if(e.target.matches('[data-form]'))submitData(e.target);
  });

  /* ---------- Step 2: the data, sent to IMÁN as soon as they are complete ---------- */

  function fill(){
    const f=$('[data-form]',view);
    for(const [k,v] of Object.entries(S.datos)){
      if(k==='presupuesto'){const r=$$('[name=presupuesto]',f).find(x=>x.value===v);if(r)r.checked=true}
      else if(k==='consentimiento')f.elements[k].checked=v;
      else f.elements[k].value=v;
    }
  }
  view.addEventListener('input',e=>{
    const f=e.target;if(!f.form||!f.form.matches('[data-form]'))return;
    if(f.name==='sitio_web_empresa'){honey=f.value;return}
    if(f.name in S.datos){S.datos[f.name]=f.type==='checkbox'?f.checked:f.value.trim();keep()}
  });
  view.addEventListener('change',e=>{if(e.target.name==='presupuesto'){S.datos.presupuesto=e.target.value;keep()}});

  let sending=false;
  async function submitData(form){
    // What the browser autofilled may not have fired an input event: read the form once more.
    for(const el of form.elements){
      if(el.name==='sitio_web_empresa')honey=el.value;
      else if(el.name==='presupuesto'){if(el.checked)S.datos.presupuesto=el.value}
      else if(el.name in S.datos)S.datos[el.name]=el.type==='checkbox'?el.checked:el.value.trim();
    }
    keep();
    if(sending||!form.reportValidity())return;
    const sent=JSON.stringify(lead());
    // Same data as last time and already received: straight to the times, without a second notice to the team.
    if(S.guardado===sent){render('horario');return}
    const button=$('[type=submit]',form),label=$('[data-label]',form),status=$('.f-status',form),error=$('.f-error',form);
    error.hidden=true;sending=true;button.disabled=true;label.textContent='Guardando…';status.textContent='Estamos guardando tus datos.';
    try{
      const {status:code,result}=await post('/api/contacto',lead(),20000);
      if(code===400){error.textContent=result.error||'Revisá los datos.';error.hidden=false;return}
      if(code===200&&result.ok){S.guardado=sent;dispatchEvent(new CustomEvent('iman:consulta'))}   // pixel.js counts it as a lead
      // If it didn't get through, they still see the times: the booking carries the same data.
      render('horario');
    }catch(problem){
      render('horario');
    }finally{
      sending=false;
      if(form.isConnected){button.disabled=false;label.textContent='Ver horarios';status.textContent=''}
    }
  }

  /* ---------- Step 3: the agenda, as in the diagnosis ---------- */

  let days=[],day=0,slot=null,loading=null,loaded=false,free=false;
  // Asked once, while they fill in the data; asked again when a time gets taken.
  const load=()=>loading||(loading=(async()=>{
    let data=null;
    try{const r=await fetch('/api/agenda',{headers:{Accept:'application/json'},cache:'no-store'});data=await r.json()}catch(e){}
    const was=days[day]&&days[day].fecha;
    days=(data&&data.disponible&&Array.isArray(data.dias)?data.dias:[]).filter(d=>d.horarios.some(h=>h.libre));
    day=Math.max(0,days.findIndex(d=>d.fecha===was));loaded=true;free=Boolean(data&&data.disponible);
    if(step==='horario')drawAgenda();
  })());
  function drawAgenda(){
    const box=$('[data-agenda]',view);if(!box)return;
    if(!loaded){load();return}
    box.classList.remove('is-loading');const wait=$('.cn-wait',box);if(wait)wait.remove();
    if(!days.length){
      // No times here: the data already reached IMÁN, so the way out is WhatsApp or the agenda page.
      box.innerHTML=`<p class="cn-hint" style="margin:0 0 18px">${free?'No quedan horarios libres en los próximos días.':'La agenda no cargó acá.'} ${S.guardado?'Ya tenemos tus datos: te escribimos para coordinar.':''}</p><div class="actions"><a class="btn btn-ink" href="${esc(waLink())}" target="_blank" rel="noopener">Escribir por WhatsApp ${ARROW}</a>${free?'':`<a class="link" href="${AGENDA}">Abrir la agenda</a>`}</div>`;
      return;
    }
    $('[data-days]',view).innerHTML=days.map((d,i)=>`<button class="cn-d" type="button" data-d="${i}" aria-pressed="${i===day}" aria-label="${esc(d.largo)}"><small>${esc(d.dia)}</small><b>${esc(String(d.numero))}</b><small>${esc(d.mes)}</small></button>`).join('');
    drawTimes();
  }
  function drawTimes(){
    const d=days[day];$('[data-day]',view).textContent=d.largo;
    $('[data-times]',view).innerHTML=d.horarios.map((h,i)=>`<button class="cn-t" type="button" data-t="${i}"${h.libre?'':' disabled'} aria-pressed="${Boolean(slot&&slot.inicio===h.inicio)}" aria-label="${esc(d.largo)} a las ${esc(h.hora)}${h.libre?'':', no disponible'}">${esc(h.hora)}</button>`).join('');
  }
  view.addEventListener('click',e=>{
    const d=e.target.closest('.cn-d'),t=e.target.closest('.cn-t');
    if(d){day=Number(d.dataset.d);$$('.cn-d',view).forEach((x,i)=>x.setAttribute('aria-pressed',String(i===day)));drawTimes()}
    else if(t&&!t.disabled){
      const dd=days[day],h=dd.horarios[Number(t.dataset.t)];
      slot={inicio:h.inicio,hora:h.hora,largo:dd.largo};
      $$('.cn-t',view).forEach(x=>x.setAttribute('aria-pressed',String(x===t)));
      const confirm=$('[data-confirm]',view);confirm.hidden=false;$('[data-chosen]',view).textContent=`${dd.largo} a las ${h.hora}`;
      $('.f-error',view).hidden=true;
      confirm.scrollIntoView({behavior:reduce?'auto':'smooth',block:'nearest'});
    }
    else if(e.target.closest('[data-book]'))book(e.target.closest('[data-book]'));
    else if(e.target.closest('[data-later]'))later();
  });

  const utc=t=>new Date(t*1000).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const calendar=b=>'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:'Videollamada con Santiago · IMÁN',dates:`${utc(b.inicio)}/${utc(b.fin)}`,details:b.meet?`Link de Google Meet: ${b.meet}`:'',location:b.meet||''});
  async function book(button){
    if(sending||!slot)return;
    const label=$('[data-label]',button),status=$('.f-status',view),error=$('.f-error',view);
    error.hidden=true;sending=true;button.disabled=true;label.textContent='Agendando…';status.textContent='Estamos reservando tu horario.';
    try{
      const {status:code,result}=await post('/api/agenda',Object.assign(lead(),{inicio:slot.inicio}),30000);
      if(code===409&&result.code==='slot_taken'){
        // Someone else got it first: the times are asked again.
        slot=null;loading=null;loaded=false;render('horario',{push:false,focus:false});await load();
        const note=$('[data-note]',view);if(note){note.textContent=result.error;note.hidden=false}
        return;
      }
      if(code!==200||result.ok!==true)throw new Error(result.error||'No pudimos confirmar la reserva. Probá otra vez o escribinos por WhatsApp.');
      S.reserva={inicio:result.inicio||slot.inicio,fin:result.fin||slot.inicio+1800,meet:result.meet||'',cuando:result.cuando||`${slot.largo} a las ${slot.hora}`,whatsapp:result.whatsapp==='enviado'};
      render('listo');
      dispatchEvent(new CustomEvent('iman:agenda'));   // pixel.js counts it as a booked call
    }catch(problem){
      if(!error.isConnected)return;
      error.textContent=problem.name==='AbortError'?'La reserva tardó más de lo esperado. Antes de reintentar, fijate si te llegó el mail o el WhatsApp con el link: puede haber quedado agendada.':problem.message;error.hidden=false;
    }finally{
      sending=false;
      if(button.isConnected){button.disabled=false;label.textContent='Confirmar la llamada';status.textContent=''}
    }
  }
  // No time works for them: the data are what matter. If they hadn't reached IMÁN yet, one more try.
  async function later(){
    if(sending)return;
    if(!S.guardado){
      sending=true;
      try{const {status:code,result}=await post('/api/contacto',lead(),20000);if(code===200&&result.ok){S.guardado=JSON.stringify(lead());dispatchEvent(new CustomEvent('iman:consulta'))}}catch(e){}
      sending=false;
    }
    render('luego');
  }

  /* ---------- History and start ---------- */

  back.addEventListener('click',()=>{if(!PREV[step])return;if(depth()>0)history.back();else render(PREV[step],{push:false})});
  addEventListener('popstate',e=>{if(e.state&&e.state.cn)render(e.state.cn,{push:false})});
  // ?rubro=barberia skips the first question; a booked call stays on its confirmation.
  const wanted=new URLSearchParams(location.search).get('rubro');
  if(!S.reserva&&RUBROS.some(r=>r[0]===wanted&&r[0]!=='otro')&&wanted!==S.rubro){S.rubro=wanted;step='datos'}
  render(step,{push:false,focus:false});
  if(step!=='rubro'&&step!=='listo')load();
})();

(() => {
  'use strict';
  const {services, context} = JSON.parse(document.getElementById('iman-public-data').textContent);
  const ids = services.map(s => s.id);
  const storage = {get(key, fallback) {try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; }}, set(key,value) {try {sessionStorage.setItem(key,JSON.stringify(value));} catch {}}, remove(key) {try {sessionStorage.removeItem(key);} catch {}}};
  const query = new URLSearchParams(location.search);
  const clean = value => Array.isArray(value) ? ids.filter(id => value.includes(id)) : [];
  let selected = clean(query.has('intereses') ? query.get('intereses').split(',') : storage.get('iman_interests', []));
  const form = document.getElementById('inquiry-form');
  const selection = document.getElementById('selection-state');
  const consultation = document.getElementById('consultation');
  const solutionDialog = document.getElementById('solution-dialog');
  let solutionSource,solutionReturnHash="";
  const modeBar=document.querySelector('.mode-bar');
  let modeFrame=0;
  function keepActionsClear(){
    modeFrame=0;if(!modeBar)return;
    const bar=modeBar.getBoundingClientRect();
    const overlaps=[...document.querySelectorAll('.action.primary')].some(button=>{
      const r=button.getBoundingClientRect();
      return r.width>0&&r.bottom>bar.top-8&&r.top<bar.bottom+8&&r.right>bar.left&&r.left<bar.right;
    });
    modeBar.dataset.obstructed=String(overlaps);
  }
  function scheduleModeCheck(){if(!modeFrame)modeFrame=requestAnimationFrame(keepActionsClear);}
  addEventListener('scroll',scheduleModeCheck,{passive:true});
  addEventListener('resize',scheduleModeCheck,{passive:true});
  document.fonts?.ready.then(scheduleModeCheck);scheduleModeCheck();
  let sending = false, sent = false;
  let requestRecord = storage.get('iman_request', null);
  let pulseCount = 0;
  function contextualURL(href, list = selected) {
    const url = new URL(href, location.origin);
    url.searchParams.set('intereses',list.join(','));
    return url.pathname + url.search + url.hash;
  }
  function syncInterests() {
    storage.set('iman_interests',selected);
    document.querySelectorAll('input[name="interes"], input[name="servicios"]').forEach(input => input.checked = selected.includes(input.value));
    const chosen = services.filter(s => selected.includes(s.id));
    document.querySelectorAll('[data-interest-link], [data-consult-link]').forEach(a => a.href = contextualURL(a.getAttribute('href')));
    document.querySelectorAll('[data-add-interest]').forEach(a => a.href = contextualURL('/#contacto', clean([...selected,a.dataset.addInterest])));
    document.querySelectorAll('[data-interest-summary]').forEach(el => el.textContent = chosen.length ? chosen.map(s => s.name).join(' · ') : 'Sin intereses seleccionados. La información general incluye los cuatro servicios.');
    const counter = document.querySelector('.selection-count');
    if (counter) counter.textContent = chosen.length ? `${String(chosen.length).padStart(2,'0')} ${chosen.length === 1 ? 'servicio elegido' : 'servicios elegidos'}` : 'Podés elegir más de uno';
    document.querySelectorAll('[data-service-tab]').forEach(tab => {const badge = tab.querySelector('.tab-interest'); if(badge) badge.hidden = !selected.includes(tab.dataset.serviceTab);});
    document.querySelectorAll('[data-form-summary]').forEach(el => el.textContent = chosen.length ? chosen.map(s => s.name).join(' · ') : 'Sin una elección todavía. Te ayudamos a encontrar el punto de partida.');
    document.querySelectorAll('[data-question]').forEach(el => el.textContent = chosen.length === 1 ? chosen[0].question : chosen.length > 1 ? '¿Qué te gustaría conectar o mejorar con estos servicios?' : '¿Qué te gustaría mejorar en tu negocio?');
    const url = new URL(location.href); url.searchParams.set('intereses',selected.join(','));
    history.replaceState(null,'',url.pathname + url.search + url.hash);
  }
  document.querySelectorAll('input[name="interes"], input[name="servicios"]').forEach(input => input.addEventListener('change',() => {
    selected = clean(input.checked ? [...selected,input.value] : selected.filter(id => id !== input.value));
    syncInterests();
    document.dispatchEvent(new CustomEvent('iman:field-pulse',{detail:{service:input.value,sequence:++pulseCount,selected:[...selected]}}));
  }));
  syncInterests();

  function openSolution(step='selection') {
    if(!solutionDialog) return;
    if(!solutionDialog.open) {
      solutionSource=document.activeElement;solutionReturnHash=location.hash;
      solutionDialog.showModal();
      document.body.classList.add('solution-open');
    }
    const isForm=step==='form'||sent;
    selection.hidden=isForm;consultation.hidden=!isForm;
    const title=sent?'inquiry-success':isForm?'form-title':'selection-title';
    solutionDialog.setAttribute('aria-labelledby',sent?'success-title':title);
    document.querySelector('[data-step]').textContent=sent?'CONSULTA / RECIBIDA':isForm?'02 / CONVERSEMOS':'01 / TU PUNTO DE PARTIDA';
    history.replaceState(null,'',contextualURL(isForm?'/#contacto':'/#seleccion'));
    solutionDialog.scrollTop=0;
    document.getElementById(title).focus({preventScroll:true});
  }
  function openForm(){openSolution('form');}
  document.querySelectorAll('[data-open-selection]').forEach(button=>button.addEventListener('click',()=>openSolution()));
  document.querySelector('[data-close-solution]')?.addEventListener('click',()=>solutionDialog.close());
  solutionDialog?.addEventListener('close',()=>{
    document.body.classList.remove('solution-open');
    if(['#contacto','#seleccion'].includes(location.hash))history.replaceState(null,'',contextualURL('/'+solutionReturnHash));
    solutionSource?.focus({preventScroll:true});
  });
  document.querySelectorAll('[data-start-service]').forEach(button=>button.addEventListener('click',()=>{
    selected=clean([...selected,button.dataset.startService]);syncInterests();openSolution();
  }));
  document.querySelector('[data-open-form]')?.addEventListener('click',() => {openForm();window.imanTrack?.('cta_click',{placement:'selection',destination:'form'});});
  document.querySelector('[data-back]')?.addEventListener('click',() => openSolution());
  document.querySelectorAll('[data-consult-link]').forEach(a => a.addEventListener('click', event => {if (form) {event.preventDefault(); openSolution();}}));
  if (form && ['#contacto','#seleccion'].includes(location.hash)) openSolution(location.hash==='#contacto'?'form':'selection');
  addEventListener('hashchange',() => {if(form&&['#contacto','#seleccion'].includes(location.hash))openSolution(location.hash==='#contacto'?'form':'selection');});

  // Tabs are progressive enhancement; all service text exists in the initial HTML.
  const tabs = [...document.querySelectorAll('[data-service-tab]')];
  if (tabs.length) {
    const nav = document.querySelector('.service-tabs'); nav.setAttribute('role','tablist');
    function activate(id, focus=false, animate=true) {
      if (!ids.includes(id)) id = ids[0];
      tabs.forEach(tab => {
        const active = tab.dataset.serviceTab === id;
        tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(active));tab.setAttribute('aria-controls',tab.dataset.serviceTab);tab.tabIndex = active ? 0 : -1;
        if(active && focus) tab.focus();
      });
      document.querySelectorAll('[data-service-panel]').forEach(panel => {panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','tab-'+panel.id);panel.tabIndex=0;panel.hidden = panel.id !== id;});
      if(animate) document.dispatchEvent(new CustomEvent('iman:field-pulse',{detail:{service:id,sequence:++pulseCount}}));
    }
    tabs.forEach((tab,index) => {
      tab.addEventListener('click',event => {event.preventDefault(); activate(tab.dataset.serviceTab);history.replaceState(null,'',contextualURL('/servicios/#'+tab.dataset.serviceTab));});
      tab.addEventListener('keydown',event => {
        let next;
        if(event.key==='ArrowRight') next=(index+1)%tabs.length;
        if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
        if(event.key==='Home') next=0;
        if(event.key==='End') next=tabs.length-1;
        if(next!==undefined){event.preventDefault();tabs[next].click();tabs[next].focus();}
      });
    });
    activate(ids.includes(location.hash.slice(1)) ? location.hash.slice(1) : selected[0] || ids[0],false,false);
    addEventListener('hashchange',() => {if(ids.includes(location.hash.slice(1))) activate(location.hash.slice(1));});
  }

  const dialog = document.getElementById('copy-dialog');
  const manual = document.getElementById('manual-context');
  let copySource, toastTimer;
  function copyText(){return context+'\n\n## Intereses seleccionados por el visitante\n\n'+(selected.length ? services.filter(s => selected.includes(s.id)).map(s => '- '+s.name).join('\n') : 'Sin selección. Evaluar los cuatro servicios según el contexto del negocio.')+'\n\nEstos intereses son preferencias iniciales, no un diagnóstico ni una recomendación.\n';}
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click',async () => {
    copySource = button;
    const text = copyText();
    try {
      if(!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      const toast = document.querySelector('.copy-toast');
      (solutionDialog?.open?solutionDialog:document.body).append(toast);
      toast.textContent = 'Copiado. Pegalo en el chat que uses.';
      clearTimeout(toastTimer);toastTimer=setTimeout(() => toast.textContent='',7000);
    } catch {
      manual.value=text;
      if(typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
      manual.focus();manual.select();
    }
  }));
  document.querySelector('[data-close-copy]')?.addEventListener('click',() => {if(dialog.close) dialog.close(); else dialog.removeAttribute('open');copySource?.focus();});
  dialog?.addEventListener('close',() => copySource?.focus());
  document.querySelector('[data-select-context]')?.addEventListener('click',() => {manual.focus();manual.select();});

  if (!form) return;
  const fields = ['nombre','negocio','email','whatsapp','comentario'];
  const draft = storage.get('iman_draft',{});
  fields.forEach(name => {if(typeof draft[name]==='string') form.elements[name].value=draft[name];});
  if(draft.consentimiento===true) form.elements.consentimiento.checked=true;
  function saveDraft(){const d={};fields.forEach(name => d[name]=form.elements[name].value);d.consentimiento=form.elements.consentimiento.checked;storage.set('iman_draft',d);}
  form.addEventListener('input',event => {saveDraft();const input=event.target;input.removeAttribute('aria-invalid');const error=document.getElementById('error-'+input.name);if(error)error.textContent='';});
  form.addEventListener('change',saveDraft);
  const status = form.querySelector('.form-status');
  const errorBox = form.querySelector('.form-error');
  const submit = form.querySelector('[type=submit]');
  const setBusy = busy => {sending=busy;document.querySelector('[data-back]').disabled=busy;form.setAttribute('aria-busy',String(busy));[...form.elements].forEach(el => el.disabled = busy);submit.querySelector('span').textContent=busy ? 'Enviando tu consulta…' : 'Pongamos esto en marcha';};
  function validate(){
    let first;
    for(const name of ['nombre','negocio','email','whatsapp','consentimiento']) {
      const el=form.elements[name]; let message='';
      if(name==='consentimiento'&&!el.checked) message='Necesitamos tu autorización para responder esta consulta.';
      else if(['nombre','negocio'].includes(name)&&!el.value.trim()) message=name==='nombre'?'Decinos cómo te llamás.':'Completá el nombre de tu negocio.';
      else if(name==='email'&&(!el.value.trim()||!el.validity.valid||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()))) message='Escribí un email válido, por ejemplo nombre@negocio.com.';
      else if(name==='whatsapp'&&el.value.trim()&&!/^[\d+().\s-]{6,50}$/.test(el.value.trim()))message='Usá números, código de área y, si querés, el signo +.';
      const output=document.getElementById('error-'+name);output.textContent=message;
      if(message){el.setAttribute('aria-invalid','true');first ||=el;}else el.removeAttribute('aria-invalid');
    }
    if(first){first.focus();return false;}return true;
  }
  form.addEventListener('submit',async event => {
    event.preventDefault();if(sending||sent)return;
    errorBox.replaceChildren(); status.textContent='';
    if(!validate())return;
    saveDraft();
    const payload=Object.fromEntries(new FormData(form));
    payload.servicios=services.filter(s => selected.includes(s.id)).map(s => s.backend);
    payload.consentimiento=form.elements.consentimiento.checked;
    payload.source=location.pathname;
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){const value=query.get(key);if(value)payload[key]=value.slice(0,key==='utm_source'||key==='utm_medium'?120:180);}
    const serialized=JSON.stringify(payload);
    if(!requestRecord||requestRecord.payload!==serialized)requestRecord={key:crypto.randomUUID(),payload:serialized};
    storage.set('iman_request',requestRecord);
    setBusy(true);status.textContent='Estamos enviando tu consulta.';
    const controller=new AbortController();const timeout=setTimeout(() => controller.abort(),20000);
    try {
      const response=await fetch('/api/contacto',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestRecord.key},body:serialized,signal:controller.signal});
      let result;try {result=await response.json();} catch {throw new Error('No pudimos confirmar la recepción. Conservamos tus datos. Volvé a intentar.');}
      if(!response.ok||result.ok!==true) {
        const error=new Error(result.error||'No pudimos enviar tu consulta. Volvé a intentar.');error.code=result.code;error.retryable=result.retryable;error.retryAfter=Number(response.headers.get('Retry-After'));throw error;
      }
      const acceptedRequestId=requestRecord.key;sent=true;form.hidden=true;status.textContent='';
      const success=document.getElementById('inquiry-success');success.hidden=false;
      solutionDialog?.setAttribute('aria-labelledby','success-title');
      document.querySelector('[data-step]').textContent='CONSULTA / RECIBIDA';
      document.querySelector('[data-success-message]').textContent=result.confirmationSent ? 'Recibimos tu consulta. La confirmación está en camino a tu email; revisá también la carpeta de spam.' : 'Recibimos tu consulta. No pudimos enviar el correo de confirmación, pero el equipo ya tiene tu mensaje.';
      document.querySelector('[data-success-services]').textContent=payload.servicios.length ? 'Servicios: '+services.filter(s=>selected.includes(s.id)).map(s=>s.name).join(' · ') : 'Te ayudamos a definir por dónde empezar.';
      document.querySelector('[data-back]').hidden=true;
      form.reset();storage.remove('iman_draft');storage.remove('iman_request');requestRecord=null;
      success.focus();window.imanTrack?.('generate_lead',{requestId:acceptedRequestId});
    } catch(error) {
      status.textContent='';
      const p=document.createElement('p');
      p.textContent=error.name==='AbortError' ? 'La conexión tardó más de lo esperado. No pudimos confirmar la recepción. Conservamos tus datos; podés volver a intentar sin duplicar la consulta.' : error.message==='Failed to fetch'||error instanceof TypeError ? 'Se interrumpió la conexión. Conservamos tus datos. Revisá tu conexión y volvé a intentar.' : error.message;
      errorBox.append(p);
      if(error.code==='rate_limited'&&error.retryAfter){const wait=document.createElement('p');wait.textContent=`Podés volver a intentar en ${Math.ceil(error.retryAfter/60)} min.`;errorBox.append(wait);}
      if(error.code==='delivery_failed'&&error.retryable===false){const note=document.createElement('p');note.textContent='Para evitar un envío duplicado, esta consulta no se reenviará automáticamente. Podés continuar por WhatsApp o la agenda.';errorBox.append(note);}
      const contact=document.createElement('a');contact.href='https://wa.me/5493535189997';contact.textContent='Continuar por WhatsApp';contact.target='_blank';contact.rel='noopener';errorBox.append(contact);
      window.imanTrack?.('form_error',{reason:'submission_failed'});
    } finally {clearTimeout(timeout);if(!sent)setBusy(false);}
  });
})();

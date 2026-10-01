// Meta Pixel for IMÁN's ads. It records the visit and the contact steps so campaigns can optimize for them:
//   PageView  every page
//   Contact   a tap on WhatsApp or on the booking link, or a sent inquiry (content_name says which)
//   Lead      an inquiry sent through the form
// Nothing typed in the form is sent to Meta, and the pixel does not load when the browser asks not to be tracked.
(() => {
  'use strict';
  const ID='1666535484901345';
  if(!/^\d+$/.test(ID)||navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
  s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  fbq('set','autoConfig',false,ID);          // no automatic button or form-field collection: only the events below
  fbq('init',ID);
  fbq('track','PageView');
  const page=location.pathname;
  const contact=how=>fbq('track','Contact',{content_name:how,content_category:page});
  addEventListener('click',event=>{
    const link=event.target.closest&&event.target.closest('a[href]');
    if(!link)return;
    const url=new URL(link.href,location.href);
    if(url.hostname==='wa.me'||url.hostname==='api.whatsapp.com'||(url.hostname===location.hostname&&/^\/wa\/?$/.test(url.pathname)))contact('whatsapp');
    else if(url.hostname==='agenda.iman.ar'||(url.hostname===location.hostname&&/^\/agenda\/?$/.test(url.pathname)))contact('agenda');
  },true);
  // form.js announces a sent inquiry with this event.
  addEventListener('iman:consulta',()=>{contact('formulario');fbq('track','Lead',{content_category:page});});
})();

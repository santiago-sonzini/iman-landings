"""Production layer for the approved IMÁN experience and readable service pages."""
from pathlib import Path
from html import escape as e
import hashlib, json, re, shutil

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'experience'
BASE='https://www.iman.ar'
SERVICES=json.loads((SOURCE/'services.json').read_text())
INTRO='IMÁN es un estudio argentino de software y automatización con IA para pymes: asistentes de WhatsApp, integraciones con tu ERP, catálogos, fidelización y automatización de compras.'
DATE='2026-10-22'
# The tab and search title carry what people search for; the line "Lo que vale un cliente que vuelve." stays on the home and in shares.
HOME_TITLE='IMÁN · Software y automatización con IA para pymes'
BRAND_LOGO='/assets/identity-variants/logo-v1.png'
BRAND_ICON='/assets/identity-variants/favicon-v1.svg'
BRAND_SHARE='/assets/identity-variants/share-site-v1.png'
HUB='/software-y-automatizacion/'
# What Google and assistants should associate IMÁN with (Organization.knowsAbout), and its public profiles.
TOPICS=['Software a medida','Automatización de procesos','Inteligencia artificial aplicada a negocios','Agentes de IA','Automatización de WhatsApp','WhatsApp Business Platform','Integración con ERP','Integraciones por API','Catálogos digitales','Automatización de compras','Fidelización de clientes','Email marketing']
PROFILES=['https://www.instagram.com/iman.solutions/','https://www.tiktok.com/@estudio.iman']
# Google "preferred sources": a reader who adds iman.ar sees its pages more often in Top Stories and badged in AI Mode.
# publisher.js renders Google's own button wherever the attribute is; the plain link opens the same setting without it.
GOOGLE_SOURCE='https://www.google.com/preferences/source?q=iman.ar'
GOOGLE_BUTTON='google-add-preferred-source-btn'
GOOGLE_SCRIPT='<script async src="https://news.google.com/swg/js/v1/publisher.js"></script>'

def schemas(path,title,desc,extra=()):
    graph=[{'@type':'Organization','@id':BASE+'/#organization','name':'IMÁN','alternateName':['Iman','IMÁN Estudio'],'url':BASE+'/','logo':BASE+BRAND_LOGO,'description':INTRO,'slogan':'Lo que vale un cliente que vuelve.','knowsAbout':TOPICS,'sameAs':PROFILES,'areaServed':{'@type':'Country','name':'Argentina'},'contactPoint':{'@type':'ContactPoint','telephone':'+54-9-353-518-9997','contactType':'sales','availableLanguage':'es'}},{'@type':'WebSite','@id':BASE+'/#website','url':BASE+'/','name':'IMÁN','inLanguage':'es-AR','publisher':{'@id':BASE+'/#organization'}},{'@type':'WebPage','@id':BASE+path+'#webpage','url':BASE+path,'name':title,'description':desc,'inLanguage':'es-AR','isPartOf':{'@id':BASE+'/#website'},'about':{'@id':BASE+'/#organization'}}]+list(extra)
    return '<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('</','<\\/')+'</script>'

def seo(path,title,desc,extra=()):
    return f'''<link rel="canonical" href="{BASE}{path}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:url" content="{BASE}{path}"><meta property="og:site_name" content="IMÁN"><meta property="og:image" content="{BASE}{BRAND_SHARE}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="IMÁN · Lo que vale un cliente que vuelve."><meta name="twitter:card" content="summary_large_image">{schemas(path,title,desc,extra)}'''

def asset(name):
    # Cloudflare keeps /assets/* cached for hours: the content hash in the URL makes a new version show up at once.
    # Files in experience/assets/ are published next to the styles and scripts, in the same folder.
    source=SOURCE/name if (SOURCE/name).exists() else SOURCE/'assets'/name
    return f'/assets/experience/{name}?v={hashlib.md5(source.read_bytes()).hexdigest()[:8]}'

def button(label,url):
    return f'<a class="cta" href="{e(url,quote=True)}"><span class="cta-label">{e(label)}</span></a>'

def identity_head():
    return f'<link rel="preload" href="/assets/identity-variants/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="{asset("v3.css")}"><link rel="stylesheet" href="{asset("reading-v3.css")}">'

def logo_link(class_name='nav-brand'):
    # The mark is the existing PNG used as a mask (v3.css): ink on white, white on dark, the accent keeps its gradient.
    return f'<a class="{class_name}" href="/" aria-label="IMÁN, inicio"><span class="logo" aria-hidden="true"></span></a>'

def versioned(html):
    """Point the hand-written pages (home, Gauss) at the hashed copies of the shared V3 files."""
    return re.sub(r'/assets/experience/(v3\.css|v3\.js|conocer\.css|conocer\.js)(?=")',lambda m:asset(m[1]),html)

def production_home():
    """The home is experience/home-iman.html: IMÁN, a background and "Conocer más", which opens the onboarding (/conocer/).
    What the home used to show (demos, services) is /info/. /V1/ stays as the earlier review page."""
    home=versioned((SOURCE/'home-iman.html').read_text())
    return home.replace('</head>',seo('/',HOME_TITLE,INTRO)+f'<script src="{asset("pixel.js")}" defer></script></head>')

def actions():
    # The two ways to start a conversation: book a call, or write on WhatsApp (the assistant recognizes "quiero info").
    # The booking page lives with the assistant; iman.ar/agenda is a short link to it (server/worker.mjs).
    wa='https://wa.me/5493535189997?text=Hola%2C%20quiero%20info%20del%20asistente%20de%20WhatsApp'
    return f'<div class="cta-row"><a class="cta solid" href="https://agenda.iman.ar/"><span class="cta-label">Agendá una llamada</span></a><a class="cta" href="{wa}"><span class="cta-label">Contactanos</span></a></div>'

# Seconds of the video at which each step happens (experience/assets/demo-agencia.json, written by scripts/capture-agencia-video.mjs).
DEMO=json.loads((SOURCE/'assets/demo-agencia.json').read_text())
def demo(s):
    """Hero of the WhatsApp page: the title next to the dealership demo (on a phone, the video comes first), then its steps."""
    title=e(s['title']).replace(e(s['emphasis']),'<em>'+e(s['emphasis'])+'</em>')
    steps=[(0,'Llega la consulta','De noche, desde la publicación de Mercado Libre.'),(DEMO['responde'],'Responde en segundos','Con el stock y el precio que cargó la agencia.'),(DEMO['califica'],'Pregunta cómo paga','Contado, financiado o con un usado en parte de pago.'),(DEMO['financia'],'Propone un horario','Explica la financiación y ofrece dos turnos para ver la unidad.'),(DEMO['agenda'],'Agenda la visita','Y le avisa al vendedor que hay un comprador listo.')]
    items=''.join(f'<li data-at="{at}"><b>{e(title)}</b><span>{e(text)}</span></li>' for at,title,text in steps)
    video=f'<video class="demo-video" width="{DEMO["ancho"]}" height="{DEMO["alto"]}" muted loop playsinline preload="metadata" poster="{asset("demo-agencia.webp")}" aria-label="Video de un asistente de WhatsApp que responde una consulta por una camioneta, pregunta cómo paga el comprador y agenda la visita."><source src="{asset("demo-agencia.mp4")}" type="video/mp4"></video>'
    hero=f'<section class="reading-hero demo-hero"><div class="demo-copy"><p class="eyebrow">{e(s["name"])} · Ejemplo: agencia de autos</p><h1>{title}</h1><p class="reading-intro">{e(s["intro"])}</p>{actions()}</div><div class="demo-phone">{video}</div></section>'
    return hero+f'<section class="demo" aria-labelledby="demo-title"><p class="eyebrow">QUÉ PASA EN EL VIDEO</p><h2 id="demo-title">De la consulta<br><em>a la visita agendada.</em></h2><ol class="demo-steps">{items}</ol><p class="demo-note">Demostración con datos de ejemplo: el asistente se arma con la información y las reglas de cada negocio. Foto del vehículo: Just a Man / Wikimedia Commons, CC BY 4.0.</p>{actions()}</section>'

def preferred_source():
    """The card that asks readers to add IMÁN as a preferred source in Google. Pages that carry it load publisher.js (shell())."""
    return f'<aside class="g-source" aria-labelledby="g-source-title"><div><p class="eyebrow">GOOGLE · FUENTE PREFERIDA</p><h2 id="g-source-title">Seguí a IMÁN<br><em>en Google.</em></h2><p>Sumá IMÁN a tus fuentes preferidas y nuestras guías de software y automatización te aparecen más seguido en las noticias destacadas y en el Modo IA de Google.</p></div><div class="g-source-act"><div {GOOGLE_BUTTON} data-lang="es-419"></div><a class="g-source-alt" href="{GOOGLE_SOURCE}" target="_blank" rel="noopener">¿No ves el botón? Abrilo en Google</a></div></aside>'

def footer():
    return '<footer class="foot dark dots">'+logo_link('foot-brand')+'<nav aria-label="Más sobre IMÁN"><a href="'+HUB+'">Software y automatización</a><a href="/servicios/">Servicios</a><a href="/gauss/">Gauss</a><a href="/recursos/">Guías</a><a href="/agente/">Para agentes</a><a href="/privacidad/">Privacidad</a><a href="'+GOOGLE_SOURCE+'" target="_blank" rel="noopener">Seguinos en Google</a><a href="https://wa.me/5493535189997">WhatsApp</a></nav><span>Hecho en Argentina.</span></footer>'

def shell(path,title,desc,body,extra=()):
    return f'''<!doctype html><html lang="es-AR" data-identity="v3"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#ffffff"><meta name="color-scheme" content="light"><title>{e(title)}</title><meta name="description" content="{e(desc,quote=True)}"><meta property="og:title" content="{e(title,quote=True)}"><meta property="og:description" content="{e(desc,quote=True)}"><meta property="og:type" content="website"><meta property="og:locale" content="es_AR">{seo(path,title,desc,extra)}<link rel="icon" href="{BRAND_ICON}" type="image/svg+xml">{identity_head()}<script src="{asset('form.js')}" defer></script><script src="{asset('demo.js')}" defer></script><script src="{asset('pixel.js')}" defer></script>{GOOGLE_SCRIPT if GOOGLE_BUTTON in body else ''}</head><body class="reading"><a class="skip" href="#contenido">Saltar al contenido</a><header class="nav"><div class="nav-in">{logo_link()}<nav class="nav-links" aria-label="Principal"><a href="{HUB}">Software</a><a href="/servicios/">Servicios</a><a href="/recursos/">Guías</a><a href="/gauss/">Gauss</a><a class="nav-cta" href="https://agenda.iman.ar/"><i aria-hidden="true"></i>Agendar llamada</a></nav></div></header><main id="contenido">{body}</main>{footer()}</body></html>'''

def form(selected=''):
    fields=''
    for name,label,typ,auto,limit,required in [('nombre','Tu nombre','text','name',100,True),('negocio','Nombre del negocio','text','organization',120,True),('email','Tu email','email','email',254,True),('whatsapp','WhatsApp · te escribimos al instante','tel','tel',50,False)]:
        fields+=f'<label class="field" for="{name}"><span>{label}</span><input id="{name}" name="{name}" type="{typ}" autocomplete="{auto}" maxlength="{limit}" {"required" if required else ""}></label>'
    rubros=['Comercio minorista','Mayorista o distribuidora','Gastronomía','Indumentaria','Pet shop o forrajería','Limpieza','Repuestos o taller','Salud y bienestar','Servicios profesionales','Industria o fábrica','Otro']
    fields+='<label class="field" for="rubro"><span>Rubro del negocio</span><select id="rubro" name="rubro" required><option value="">Seleccioná tu rubro</option>'+''.join(f'<option>{e(x)}</option>' for x in rubros)+'</select></label><label class="field" for="ciudad"><span>Ciudad o zona · opcional</span><input id="ciudad" name="ciudad" autocomplete="address-level2" maxlength="120"></label>'
    choices=''.join(f'<label class="service-choice"><input type="checkbox" name="servicios" value="{e(s["name"],quote=True)}" data-id="{s["id"]}" {"checked" if selected==s["id"] else ""}><span>{e(s["name"])}</span></label>' for s in SERVICES)
    # Gauss is a separate product with its own landing (/gauss/): one more choice here, not a fourth service page.
    choices+=f'<label class="service-choice"><input type="checkbox" name="servicios" value="Gauss · Compras" data-id="gauss" {"checked" if selected=="gauss" else ""}><span>Gauss · Compras</span></label>'
    # Same for Gauss for accounting firms: /contacto/?servicio=estudios ticks its option. Its landing now sends people to the app instead.
    choices+=f'<label class="service-choice"><input type="checkbox" name="servicios" value="Gauss · Estudios contables" data-id="estudios" {"checked" if selected=="estudios" else ""}><span>Gauss · Estudios contables</span></label>'
    return f'''<section class="inquiry" id="consulta" aria-labelledby="inquiry-title"><p class="eyebrow">EL PRÓXIMO PASO</p><h2 id="inquiry-title">Te lo mostramos<br><em>en tu negocio.</em></h2><p class="intro-small">Dejanos tus datos y coordinamos una demostración.</p><form id="inquiry-form" action="/api/contacto" method="post"><fieldset class="service-choices"><legend>¿Qué te interesa?</legend><p id="services-help">Podés elegir uno o varios, sea cual sea tu rubro.</p><div>{choices}</div><small class="field-error" id="services-error"></small></fieldset><div class="form-grid">{fields}</div><label class="field other-industry" for="rubro_otro" hidden><span>¿Cuál es tu rubro?</span><input id="rubro_otro" name="rubro_otro" maxlength="120" disabled></label><label class="field" for="comentario"><span>Tu consulta</span><textarea id="comentario" name="comentario" rows="4" minlength="10" maxlength="2000" required placeholder="Qué necesitás, qué herramientas usás o qué te gustaría resolver."></textarea></label><div class="honey" aria-hidden="true"><label>Dejar vacío<input name="sitio_web_empresa" tabindex="-1" autocomplete="off"></label></div><label class="consent"><input type="checkbox" name="consentimiento" required><span>Acepto que IMÁN me contacte sobre esta consulta y me envíe una confirmación por email. <a href="/privacidad/">Privacidad</a>.</span></label><button class="cta" type="submit" disabled><span class="cta-label">Enviar consulta</span></button><p class="form-status" role="status" aria-live="polite" aria-atomic="true"></p><p class="form-error" role="alert" hidden></p><noscript><p>Activá JavaScript para enviar el formulario, o <a href="https://wa.me/5493535189997">escribinos por WhatsApp</a>.</p></noscript><p class="form-note">Esta consulta no te suscribe a publicidad. También podés <a href="https://wa.me/5493535189997">escribirnos por WhatsApp</a>.</p></form><div class="inquiry-success" hidden tabindex="-1"><h3>Ya tenemos<br><em>un punto de partida.</em></h3><p data-success-message></p><p>Vamos a revisar tu consulta y contactarte para definir el próximo paso.</p><a class="more-link" href="/">Volver a IMÁN</a></div></section>'''

def service_body(s):
    title=e(s['title']).replace(e(s['emphasis']),'<em>'+e(s['emphasis'])+'</em>')
    hero=demo(s) if s['id']=='whatsapp' else f'<section class="reading-hero"><p class="eyebrow">{e(s["name"])}</p><h1>{title}</h1><p class="reading-intro">{e(s["intro"])}</p>{button("Quiero verlo en mi negocio", "#consulta")}</section>'
    body=hero+'<article class="reading-content">'
    for i,section in enumerate(s['sections']):
        body+=f'<section class="reading-section"><span class="section-index">0{i+1}</span><h2>{e(section["title"])}</h2><p>{e(section["text"])}</p>'
        if section['items']: body+='<ul>'+''.join('<li>'+e(x)+'</li>' for x in section['items'])+'</ul>'

        if s['id']=='whatsapp' and i==1: body+='<p><a class="more-link" href="/agentes/">Más sobre agentes de IA</a></p>'
        body+='</section>'
    body+='<section class="reading-section" id="compras"><span class="section-index">PARA EMPEZAR</span><h2>Partimos de lo que tenés.</h2><p>'+e(s['needs'])+'</p><p>Conversamos, delimitamos una primera implementación y te acercamos una propuesta con alcance, tiempos, inversión y acompañamiento. Podés combinar los tres servicios.</p></section>'
    body+='<section class="faq"><h2>Antes de dar el paso.</h2>'+''.join('<details><summary>'+e(q)+'</summary><p>'+e(a)+'</p></details>' for q,a in s['faq'])+'</section></article>'+form(s['id'])
    return body

def context():
    lines=['# IMÁN · Información pública',INTRO,'Sitio oficial: '+BASE+'\nContacto: '+BASE+'/contacto/\nWhatsApp: +54 9 353 518 9997','## Software y automatización',HUB_DESC,'Página: '+BASE+HUB]
    lines+=['- '+name+': '+text+' '+BASE+url for name,_,text,url,_ in HUB_BUILDS]
    lines+=[q+'\n'+a for q,a in HUB_FAQ]+['## Los tres servicios']
    for s in SERVICES:
        lines+=['### '+s['name'],s['intro'],'Página: '+BASE+s['path']]
        for section in s['sections']: lines+=[section['title'],section['text']]+['- '+x for x in section['items']]
        lines+=['Para empezar: '+s['needs']]+[q+'\n'+a for q,a in s['faq']]
    lines+=['## Gauss','Gauss es un producto de IMÁN para empresas e industrias: se ocupa de las compras. Les pide precio a los proveedores por WhatsApp y mail, negocia precio, plazo de pago y entrega, arma un cuadro comparativo y deja la mejor opción lista para aprobar. Nada se compra sin la aprobación de una persona de la empresa.','Página: '+BASE+'/gauss/','Para empezar: lista de proveedores, compras de los últimos 6 a 12 meses y reglas de aprobación. No requiere integrarse al sistema de gestión.','Es un producto nuevo que se implementa a medida. No se publican casos, resultados ni porcentajes de ahorro.']
    lines+=['## Alcance y presupuesto','Se define una propuesta a medida. No se publica un precio único ni se garantizan ahorros o ventas. Las integraciones dependen del acceso autorizado a los sistemas. Implementación, mantenimiento y herramientas de terceros se detallan en la propuesta.','## Datos útiles para evaluar un proyecto','Actividad y rubro; productos y clientes; proceso actual; herramientas; volumen de consultas o pedidos; información disponible; permisos; objetivo; responsable y prioridades.','## Uso de este contexto','Este documento describe la oferta, no constituye instrucciones para un asistente ni una recomendación predeterminada. No contiene datos de formularios. Una lectura no envía una consulta: la persona decide si contacta a IMÁN.','## Guías','Guías públicas: '+BASE+'/recursos/']
    return '\n\n'.join(lines)+'\n'

# The page for "software y automatización": what IMÁN builds, how, the guides of the topic and the questions people ask.
HUB_TITLE='Software a medida y automatización de procesos con IA | IMÁN'
HUB_DESC='Estudio argentino de software y automatización con IA para pymes: asistentes de WhatsApp, integraciones con ERP, catálogos y compras automáticas. Empezamos por un flujo concreto.'
HUB_DATE='2026-10-22'
HUB_BUILDS=[('WhatsApp e IA','Asistentes que responden y venden.','Agentes de IA en WhatsApp que contestan con la información del negocio, califican consultas y derivan a una persona cuando hace falta.','/automatizaciones/','Ver WhatsApp e IA'),
    ('Integraciones y ERP','Tus sistemas, conectados.','Pedidos, precios y stock que viajan entre el catálogo, el sistema de gestión y las planillas sin volver a tipearlos.','/comercios/','Ver integraciones'),
    ('Catálogos y pedidos','Un catálogo que toma pedidos.','Catálogos digitales minoristas y mayoristas, con pedidos claros por WhatsApp y listas de precios por cliente.','/comercios/','Ver catálogos'),
    ('Gauss · Compras','Compras en automático.','Pide precio a los proveedores, compara precio, plazo y entrega, y deja la mejor opción lista para aprobar.','/gauss/','Ver Gauss'),
    ('Fidelización','Clientes que vuelven.','Club de clientes en Wallet, campañas de email y avisos para que la recompra no dependa de la memoria.','/fidelizacion/','Ver fidelización'),
    ('Turnos','Reservas sin idas y vueltas.','Agenda y reservas online para negocios que trabajan con turnos, armadas sobre tus servicios y horarios.','/turnos/landing/','Ver turnos')]
# Guides of the topic, in reading order. Those not published yet are skipped.
HUB_GUIDES=['/recursos/software-a-medida-para-pymes/','/recursos/zapier-make-n8n-o-desarrollo-a-medida/','/recursos/como-elegir-empresa-de-software-y-automatizacion/','/recursos/automatizar-procesos/','/recursos/agente-ia-whatsapp-comercio/','/recursos/whatsapp-business-app-o-api/','/recursos/integrar-catalogo-con-erp/','/recursos/automatizar-compras-comparar-proveedores/']
HUB_FAQ=[('¿Qué hace una empresa de software y automatización como IMÁN?','Diseña y construye sistemas que hacen solos el trabajo repetido de un negocio: responder consultas, registrar pedidos, comparar proveedores, avisar a los clientes. IMÁN lo hace para pymes, mayoristas y distribuidoras de Argentina, con IA cuando aporta y conectado a las herramientas que el negocio ya usa.'),
    ('¿Cuánto cuesta automatizar un proceso o desarrollar un software a medida?','Depende del alcance: cuántos flujos, qué sistemas hay que conectar, cuánta información hay que ordenar y qué mantenimiento necesita. No publicamos un precio único. Después de ver el proceso, la propuesta separa implementación, mantenimiento y costos de terceros, como los mensajes de WhatsApp o los modelos de IA.'),
    ('¿Tengo que cambiar mi sistema de gestión?','No. Trabajamos sobre lo que ya usás: sistema de gestión, planillas, tienda online y WhatsApp. Si el sistema permite conectarse por API, exportaciones o base de datos, integramos ahí, siempre con los accesos que el negocio autoriza.'),
    ('¿Conviene Zapier, Make o n8n, o un desarrollo a medida?','Las herramientas de automatización sirven para conectar aplicaciones con reglas simples y pocas excepciones. Un desarrollo a medida conviene cuando el flujo tiene muchas excepciones, maneja datos sensibles o tiene que convivir con sistemas que esas herramientas no conectan. Muchas veces la respuesta es una combinación de las dos.'),
    ('¿Usan inteligencia artificial en todo?','No. La IA sirve para entender mensajes, clasificar pedidos, leer cotizaciones o preparar respuestas. Si una tarea se resuelve con reglas simples, la resolvemos con reglas. Y lo sensible, como comprar o confirmar un precio especial, pasa por la aprobación de una persona.'),
    ('¿Trabajan con negocios de todo el país?','Sí. Trabajamos con negocios de toda Argentina: las reuniones son por videollamada y la implementación se hace sobre los accesos que el negocio autoriza.'),
    ('¿Cuánto tarda en estar funcionando?','Lo define la propuesta según el alcance. Empezamos por un flujo concreto para tener algo funcionando y medible antes de sumar más.')]

def hub(pages):
    titles={p['path']:p for p in pages}
    cards='<div class="service-directory">'+''.join(f'<article><p class="eyebrow">{e(name)}</p><h3>{e(title)}</h3><p>{e(text)}</p><a class="more-link" href="{url}">{e(label)}</a></article>' for name,title,text,url,label in HUB_BUILDS)+'</div>'
    guides=''.join(f'<li><a class="hub-guide" href="{path}"><b>{e(titles[path]["title"].split(" | ")[0])}</b><span>{e(titles[path]["description"])}</span></a></li>' for path in HUB_GUIDES if path in titles)
    software_guide='<p><a class="more-link" href="/recursos/software-a-medida-para-pymes/">Cuándo conviene el software a medida</a></p>' if '/recursos/software-a-medida-para-pymes/' in titles else ''
    body=('<section class="reading-hero"><p class="eyebrow">SOFTWARE Y AUTOMATIZACIÓN</p><h1>Software a medida.<br><em>Procesos en automático.</em></h1>'
        '<p class="reading-intro">IMÁN es un estudio argentino de software y automatización con IA para pymes, mayoristas y distribuidoras. Construimos la pieza que le falta a tu operación y la conectamos con lo que ya usás: WhatsApp, tu sistema de gestión, tus planillas y tu tienda.</p>'
        '<div class="cta-row"><a class="cta solid" href="/conocer/"><span class="cta-label">Agendá una llamada</span></a><a class="cta" href="/info/#demos"><span class="cta-label">Ver las demos</span></a></div></section>'
        '<section class="hub-builds" aria-labelledby="hub-builds-title"><h2 id="hub-builds-title">Lo que <em>construimos.</em></h2>'+cards+'</section>'
        '<article class="reading-content">'
        '<section class="reading-section"><span class="section-index">01</span><h2>Automatización de procesos, por un flujo concreto.</h2><p>Una automatización útil empieza por una tarea que se repite, tiene entradas claras y un resultado que se puede controlar. No arrancamos por la herramienta: arrancamos por el trabajo que hoy hace una persona a mano.</p>'
        '<ul><li>Consultas de WhatsApp que se responden siempre igual.</li><li>Pedidos que llegan por un canal y se vuelven a cargar en el sistema.</li><li>Cotizaciones de proveedores que se comparan en una planilla.</li><li>Avisos, recordatorios y seguimientos que dependen de acordarse.</li><li>Reportes que se arman copiando datos de varios lados.</li></ul>'
        '<p><a class="more-link" href="/recursos/automatizar-procesos/">Qué proceso conviene automatizar primero</a></p></section>'
        '<section class="reading-section"><span class="section-index">02</span><h2>Software a medida, sin cambiar de sistema.</h2><p>La mayoría de las pymes no necesita reemplazar su sistema de gestión: necesita la pieza que falta entre las herramientas que ya tiene. Construimos esa pieza y la conectamos por API, exportaciones o base de datos, con los accesos que el negocio autoriza.</p><p>Si un producto que ya existe resuelve el problema, te lo decimos: configurar bien una herramienta suele salir menos que desarrollar.</p>'+software_guide+'</section>'
        '<section class="reading-section"><span class="section-index">03</span><h2>IA cuando aporta. Personas cuando hace falta.</h2><p>Usamos modelos de IA para entender mensajes, clasificar pedidos, leer cotizaciones o preparar respuestas. Cada agente trabaja con la información y las reglas del negocio, tiene límites claros y le pasa a una persona lo que no debe resolver solo. Las acciones sensibles, como comprar o confirmar un precio especial, pasan por una aprobación.</p></section>'
        '<section class="reading-section"><span class="section-index">04</span><h2>Cómo trabajamos.</h2><ul><li><span><strong>Diagnóstico.</strong> Vemos el proceso real: quién hace qué, con qué herramientas y dónde se traba.</span></li><li><span><strong>Primer flujo.</strong> Elegimos una tarea concreta y te mostramos una demo con tu caso antes de construir todo.</span></li><li><span><strong>Implementación.</strong> Conectamos los sistemas, probamos con datos reales y definimos qué pasa con cada excepción.</span></li><li><span><strong>Acompañamiento.</strong> Medimos el uso, ajustamos y sumamos el siguiente flujo cuando el primero funciona.</span></li></ul><p>Alcance, tiempos, inversión y costos de terceros quedan escritos en la propuesta.</p></section>'
        +(f'<section class="reading-section"><span class="section-index">GUÍAS</span><h2>Para decidir con información.</h2><ul class="hub-guides">{guides}</ul><p><a class="more-link" href="/recursos/">Todas las guías</a></p></section>' if guides else '')+
        '<section class="faq"><h2>Preguntas frecuentes.</h2>'+''.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q,a in HUB_FAQ)+'</section></article>'
        +preferred_source()+form())
    offers=[{'@type':'Offer','itemOffered':{'@type':'Service','name':name,'description':text,'url':BASE+url}} for name,_,text,url,_ in HUB_BUILDS]
    extra=[{'@type':'Service','@id':BASE+HUB+'#service','name':'Software a medida y automatización de procesos con IA','serviceType':['Desarrollo de software a medida','Automatización de procesos','Integración de sistemas','Agentes de IA'],'description':HUB_DESC,'url':BASE+HUB,'provider':{'@id':BASE+'/#organization'},'areaServed':{'@type':'Country','name':'Argentina'},'audience':{'@type':'BusinessAudience','audienceType':'Pymes, mayoristas y distribuidoras'},'hasOfferCatalog':{'@type':'OfferCatalog','name':'Software y automatización de IMÁN','itemListElement':offers}},
        {'@type':'FAQPage','@id':BASE+HUB+'#faq','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in HUB_FAQ]},
        {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'IMÁN','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'Software y automatización','item':BASE+HUB}]}]
    return body,extra

def build_dark(out,pages):
    dest=out/'assets/experience';dest.mkdir(parents=True,exist_ok=True)
    shutil.copytree(SOURCE/'assets',dest,dirs_exist_ok=True)
    for name in ['site.css','home.css','home.js','reading.css','form.js','demo.js','pixel.js','identity-v1.css','identity-v1.js','v3.css','v3.js','reading-v3.css','purchases-demo.css','purchases-demo.js','diagnostico.js','conocer.js','conocer.css']:shutil.copy2(SOURCE/name,dest/name)
    (out/'index.html').write_text(production_home())
    # The demos and services that were the home; its call buttons go to the onboarding.
    info=(SOURCE/'info.html').read_text()
    i_title=re.search(r'<title>(.*?)</title>',info)[1];i_desc=re.search(r'<meta name="description" content="(.*?)">',info)[1]
    info=versioned(info.replace('</head>',seo('/info/',i_title,i_desc)+f'<script src="{asset("pixel.js")}" defer></script></head>'))
    (out/'info').mkdir(exist_ok=True);(out/'info/index.html').write_text(info)
    pages[:]=[p for p in pages if p['path']!='/info/']
    pages.append({'path':'/info/','title':i_title,'description':i_desc,'file':'info/index.html','dateModified':DATE})
    # The onboarding behind "Conocer más": rubro, data and budget, then the agenda. A form, like the diagnosis: unlisted.
    know=(SOURCE/'conocer.html').read_text()
    k_title=re.search(r'<title>(.*?)</title>',know)[1];k_desc=re.search(r'<meta name="description" content="(.*?)">',know)[1]
    k_head=seo('/conocer/',k_title,k_desc).replace('index,follow,max-image-preview:large','noindex,follow')
    know=versioned(know.replace('</head>',k_head+f'<script src="{asset("pixel.js")}" defer></script></head>'))
    (out/'conocer').mkdir(exist_ok=True);(out/'conocer/index.html').write_text(know)
    purchase_title='Ejemplo de automatización de compras mayoristas | IMÁN'
    purchase_desc='Ejemplo interactivo con datos ficticios para comparar propuestas de proveedores por presupuesto y entrega. No realiza pedidos ni pagos.'
    purchase_body=(SOURCE/'purchases-demo.html').read_text()+'<span id="contacto" aria-hidden="true"></span>'+form('whatsapp')
    purchase=shell('/automatizaciones/compras-demo/',purchase_title,purchase_desc,purchase_body)
    purchase=purchase.replace('index,follow,max-image-preview:large','noindex,follow')
    # Keep the demo's existing manual newsletter signup and booking option.
    purchase=purchase.replace(identity_head(),'<link rel="stylesheet" href="/assets/newsletter.css">'+identity_head())
    purchase=purchase.replace('</head>',f'<link rel="stylesheet" href="{asset("purchases-demo.css")}"><script src="{asset("purchases-demo.js")}" defer></script><script src="/assets/newsletter.js" defer></script></head>')
    purchase=purchase.replace('</nav><span>Hecho en Argentina.</span>','<a href="#newsletter-title" data-newsletter-open>Recibir ideas</a></nav><span>Hecho en Argentina.</span>')
    purchase=purchase.replace('</body>',(ROOT/'templates/newsletter.html').read_text()+'</body>')
    (out/'automatizaciones/compras-demo/index.html').write_text(purchase)
    # Gauss is a hand-written page on the shared V3 system (v3.css, v3.js).
    gauss=(SOURCE/'gauss.html').read_text()
    g_title=re.search(r'<title>(.*?)</title>',gauss)[1];g_desc=re.search(r'<meta name="description" content="(.*?)">',gauss)[1]
    g_extra=[{'@type':'Service','@id':BASE+'/gauss/#service','name':'Gauss','serviceType':'Automatización de compras','description':g_desc,'url':BASE+'/gauss/','provider':{'@id':BASE+'/#organization'},'areaServed':{'@type':'Country','name':'Argentina'}}]
    g_head=seo('/gauss/',g_title,g_desc,g_extra).replace(BASE+BRAND_SHARE,BASE+'/assets/identity-variants/share-gauss-v1.png').replace('IMÁN · Lo que vale un cliente que vuelve.','Gauss · Tus compras, en automático.')
    gauss=versioned(gauss.replace('</head>',g_head+'</head>'))
    (out/'gauss').mkdir(exist_ok=True);(out/'gauss/index.html').write_text(gauss)
    pages[:]=[p for p in pages if p['path']!='/gauss/']
    pages.append({'path':'/gauss/','title':g_title,'description':g_desc,'file':'gauss/index.html','dateModified':DATE})
    # The diagnosis is a hand-written conversion landing on V3: eight questions, then a plan built from the answers and a call.
    # Unlisted for now: noindex, outside the sitemap and docs/pages.json.
    diag=(SOURCE/'diagnostico.html').read_text()
    d_title=re.search(r'<title>(.*?)</title>',diag)[1];d_desc=re.search(r'<meta name="description" content="(.*?)">',diag)[1]
    d_head=seo('/diagnostico/',d_title,d_desc).replace('index,follow,max-image-preview:large','noindex,follow')
    diag=versioned(diag.replace('</head>',d_head+f'<script src="{asset("pixel.js")}" defer></script></head>')).replace('/assets/experience/diagnostico.js"',asset('diagnostico.js')+'"')
    (out/'diagnostico').mkdir(exist_ok=True);(out/'diagnostico/index.html').write_text(diag)
    routes=[]
    for s in SERVICES:
        extra=[{'@type':'Service','@id':BASE+s['path']+'#service','name':s['name'],'description':s['description'],'url':BASE+s['path'],'provider':{'@id':BASE+'/#organization'},'areaServed':{'@type':'Country','name':'Argentina'}},{'@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in s['faq']]}]
        routes.append((s['path'],s['name']+' para negocios de Argentina | IMÁN',s['description'],service_body(s),extra))
    cards='<div class="service-directory">'+''.join('<article id="servicio-'+s['id']+'"><p class="eyebrow">'+e(s['name'])+'</p><h2>'+e(s['title'])+'</h2><p>'+e(s['intro'])+'</p><a class="more-link" href="'+s['path']+'">Más información</a></article>' for s in SERVICES)+'</div>'
    intro='<section class="reading-hero"><p class="eyebrow">LOS SERVICIOS</p><h1>Todo empieza<br><em>con tu negocio.</em></h1><p class="reading-intro">Tres formas de conectar a tus clientes con una operación más simple.</p></section>'
    routes.append(('/servicios/','Automatización, fidelización y ERP | IMÁN','Los servicios de IMÁN para pymes: WhatsApp con IA, fidelización y email marketing, catálogos e integración con ERP. Se pueden combinar en un mismo proyecto.',intro+cards+form(),[]))
    routes.append(('/contacto/','Hablemos de tu negocio | IMÁN','Consultá por WhatsApp e IA, fidelización y email marketing, catálogos y ERP. Podés combinar servicios en una misma consulta.',form().replace('<h2 id="inquiry-title">','<h1 id="inquiry-title">').replace('</em></h2>','</em></h1>'),[]))
    agent='<section class="reading-hero"><p class="eyebrow">INFORMACIÓN ABIERTA</p><h1>El contexto.<br><em>Para tu agente.</em></h1><p class="reading-intro">La misma información de IMÁN en un formato que podés leer, compartir o usar con tu asistente.</p>'+button('Leer el contexto en Markdown','/contexto-iman.md')+'</section><article class="reading-content"><section class="reading-section"><h2>Qué es IMÁN.</h2><p>'+e(INTRO)+'</p></section>'+''.join('<section class="reading-section"><h2>'+e(s['name'])+'</h2><p>'+e(s['intro'])+'</p><p>'+e(s['needs'])+'</p><a class="more-link" href="'+s['path']+'">Leer el servicio completo</a></section>' for s in SERVICES)+'<section class="reading-section"><h2>Una evaluación con contexto.</h2><p>Para evaluar una implementación hacen falta el rubro, el proceso actual, las herramientas, el volumen de trabajo y el objetivo. El alcance, las integraciones y el presupuesto se confirman en una propuesta. Este documento no incluye datos de consultas.</p><p><a href="/llms.txt">Resumen del sitio</a> · <a href="/llms-full.txt">Contexto completo</a> · <a href="/recursos/">Guías</a></p></section></article>'+form()
    routes.append(('/agente/','Contexto de IMÁN para personas y agentes','Información pública de los tres servicios de IMÁN, alcance, requisitos y contacto. Versión Markdown para lectura y asistentes.',agent,[]))
    # Retain the indexed agent-service URL as a focused explanation within WhatsApp + IA.
    agent_service='<section class="reading-hero"><p class="eyebrow">WHATSAPP E IA</p><h1>Asistencia con<br><em>contexto.</em></h1><p class="reading-intro">Agentes que consultan información y ayudan con tareas definidas, con permisos y límites claros.</p></section><article class="reading-content"><section class="reading-section"><h2>Información útil. Acciones definidas.</h2><p>Un agente puede consultar documentación, preparar respuestas o clasificar solicitudes. Acordamos las fuentes, herramientas, evaluación y derivación al equipo. Las acciones sensibles requieren los controles definidos para el proyecto.</p><p>Si una tarea se resuelve con reglas simples, esa puede ser la primera implementación. El punto de partida es el proceso del negocio.</p><a class="more-link" href="/automatizaciones/">Conocé WhatsApp e IA</a></section></article>'+form('whatsapp')
    routes.append(('/agentes/','Agentes de IA y automatización a medida | IMÁN','Asistentes con información del negocio, herramientas y límites definidos. Integrados al servicio de automatización de IMÁN.',agent_service,[]))
    privacy='<section class="reading-hero"><p class="eyebrow">PRIVACIDAD</p><h1>Tus datos.<br><em>Un uso claro.</em></h1></section><article class="reading-content"><section class="reading-section"><h2>Datos de tu consulta.</h2><p>IMÁN utiliza el nombre, negocio, email, rubro, servicios elegidos y consulta que completás para responderte y preparar una propuesta. Si agregás WhatsApp o ciudad, se usan con esa misma finalidad. No te suscribimos automáticamente a marketing.</p></section><section class="reading-section"><h2>Cómo se envían.</h2><p>Cloudflare aloja la web y procesa los correos transaccionales. La consulta se envía al buzón comercial de IMÁN y se intenta enviar una confirmación a tu email. Guardamos temporalmente huellas técnicas y estado de envío para limitar abuso y evitar duplicados; la base de contacto no guarda el texto de la consulta.</p><p>El correo queda en el buzón comercial durante la atención y seguimiento. Podés pedir acceso, corrección o eliminación por <a href="https://wa.me/5493535189997">WhatsApp al +54 9 353 518 9997</a>.</p></section><section class="reading-section"><h2>Navegación y enlaces.</h2><p>Las fuentes se alojan en este sitio. Para medir nuestros anuncios usamos el píxel de Meta: registra la visita y si tocás un botón de contacto, y puede guardar cookies en tu navegador. No le enviamos lo que escribís en el formulario. Si tu navegador pide no ser rastreado (Do Not Track o Global Privacy Control), el píxel no se carga. WhatsApp y Google Meet aplican sus propias políticas cuando elegís abrirlos. En las guías, el botón «Seguí a IMÁN en Google» carga un script de Google, que aplica su propia política de privacidad. Las páginas de demostración y otros recursos pueden usar servicios externos identificados en esas páginas.</p></section><section class="reading-section"><h2>Suscripciones anteriores.</h2><p>La consulta comercial es independiente de las suscripciones confirmadas anteriormente. Si ya recibís correos de una lista de IMÁN, podés usar el enlace de baja incluido en esos mensajes.</p></section></article>'
    hub_body,hub_extra=hub(pages)
    routes.append((HUB,HUB_TITLE,HUB_DESC,hub_body,hub_extra))
    routes.append(('/privacidad/','Privacidad y contacto | IMÁN','Cómo se utilizan los datos de las consultas recibidas en IMÁN y cómo pedir su corrección o eliminación.',privacy,[]))
    for path,title,desc,body,extra in routes:
        file=out/path.strip('/')/'index.html';file.parent.mkdir(parents=True,exist_ok=True);file.write_text(shell(path,title,desc,body,extra))
        pages[:]=[p for p in pages if p['path']!=path]
        pages.append({'path':path,'title':title,'description':desc,'file':str(file.relative_to(out)),'dateModified':HUB_DATE if path==HUB else DATE})
    for p in pages:
        if p['path']=='/':p.update(title=HOME_TITLE,description=INTRO,dateModified=DATE)
    # Preserve indexed guides with the approved typography and their original article data.
    guides=[p for p in pages if p['path'].startswith('/recursos/') and p['path']!='/recursos/']
    for p in guides:
        file=out/p['file'];raw=file.read_text();match=re.search(r'<article class="article">(.*?)</article>',raw,re.S)
        if match:
            article_html=match[1].replace('/#contacto','/contacto/')
            # A returning browser must fetch the new palette instead of a cached diagram.
            for diagram in ['editorial-catalogo.svg','editorial-wallet.svg','editorial-compras.svg']:
                version=hashlib.md5((ROOT/'assets'/diagram).read_bytes()).hexdigest()[:8]
                article_html=article_html.replace(f'src="/assets/{diagram}"',f'src="/assets/{diagram}?v={version}"')
            body='<section class="reading-hero"><p class="eyebrow">GUÍAS DE IMÁN</p><h1>'+e(p['title'].split(' | ')[0])+'</h1><p class="reading-intro">'+e(p['description'])+'</p></section><div class="legacy-reading"><article class="archive-article">'+article_html+'</article></div>'+preferred_source()+'<div class="document-links">'+button('Conversemos sobre tu negocio','/contacto/')+'</div>'
            graph=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',raw,re.S)[1])['@graph']
            article_schemas=[s for s in graph if s.get('@type')=='Article']
            for article in article_schemas:
                if article.get('image')==BASE+'/assets/og.png':article['image']=BASE+BRAND_SHARE
            file.write_text(shell(p['path'],p['title'],p['description'],body,article_schemas))
    index=next(p for p in pages if p['path']=='/recursos/')
    resource_body='<section class="reading-hero"><p class="eyebrow">GUÍAS DE IMÁN</p><h1>Antes de hacer,<br><em>entender.</em></h1><p class="reading-intro">Guías de software, automatización con IA y fidelización para pensar tu próximo proyecto.</p></section><div class="legacy-reading">'+''.join('<a class="resource-entry" href="'+p['path']+'"><h2>'+e(p['title'].split(' | ')[0])+'</h2><p>'+e(p['description'])+'</p><span>LEER LA GUÍA</span></a>' for p in guides)+'<p><a href="/turnos/landing/">Proyectos de turnos y reservas</a> · <a href="'+HUB+'">Software y automatización para pymes</a></p></div>'+preferred_source()
    (out/index['file']).write_text(shell('/recursos/',index['title'],index['description'],resource_body))
    turnos=next(p for p in pages if p['path']=='/turnos/landing/')
    turnos_body='<section class="reading-hero"><p class="eyebrow">SERVICIO COMPLEMENTARIO</p><h1>Un horario.<br><em>Todo más claro.</em></h1><p class="reading-intro">Recorridos de reservas a medida para negocios que trabajan con turnos.</p></section><article class="reading-content"><section class="reading-section"><h2>Una agenda para tu operación.</h2><p>Definimos servicios, duración, disponibilidad y responsables. Confirmaciones, cancelaciones, pagos e integraciones se evalúan en la propuesta según las herramientas que usa el equipo.</p><p>Contanos cómo organizás hoy las reservas para evaluar una primera implementación.</p><a href="/turnos/">Ver la demostración existente</a></section></article>'+form('whatsapp')
    (out/turnos['file']).write_text(shell(turnos['path'],turnos['title'],turnos['description'],turnos_body))
    for route in ['/informacion/','/nosotros/','/catalogos/']:
        pages[:]=[p for p in pages if p['path']!=route]
        file=out/route.strip('/')/'index.html'
        if file.exists():file.unlink()
    (out/'contexto-iman.md').write_text(context())
    (out/'llms-full.txt').write_text(context())
    (out/'llms.txt').write_text('# IMÁN\n\n'+INTRO+'\n\n- [Software a medida y automatización de procesos con IA]('+BASE+HUB+')\n'+''.join('- ['+s['name']+']('+BASE+s['path']+')\n' for s in SERVICES)+'- [Qué hace IMÁN: demos y servicios]('+BASE+'/info/)\n- [Gauss · Compras para empresas]('+BASE+'/gauss/)\n- [Contacto]('+BASE+'/contacto/)\n- [Guías]('+BASE+'/recursos/)\n- [Contexto completo]('+BASE+'/contexto-iman.md)\n- [Información para agentes]('+BASE+'/agente/)\n\nPresupuesto y alcance a medida; sin precios únicos ni resultados garantizados.\n')


def not_found():
    return shell('/404.html','Página no encontrada | IMÁN','Esta dirección no existe en IMÁN.','<section class="reading-hero"><p class="eyebrow">404</p><h1>Probemos<br><em>otro camino.</em></h1>'+button('Volver a IMÁN','/')+'</section>').replace('index,follow,max-image-preview:large','noindex,follow')

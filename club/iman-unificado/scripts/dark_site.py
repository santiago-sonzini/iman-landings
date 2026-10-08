"""Production layer for the approved IMÁN experience and readable service pages."""
from pathlib import Path
from html import escape as e
import hashlib, json, re, shutil

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'experience'
BASE='https://www.iman.ar'
SERVICES=json.loads((SOURCE/'services.json').read_text())
INTRO='IMÁN desarrolla automatización de WhatsApp con IA, fidelización y email marketing, y catálogos conectados con ERP para pymes, mayoristas y distribuidoras de Argentina.'
DATE='2026-10-01'

def schemas(path,title,desc,extra=()):
    graph=[{'@type':'Organization','@id':BASE+'/#organization','name':'IMÁN','alternateName':'Iman','url':BASE+'/','logo':BASE+'/assets/experience/iman-simbolo.svg','description':INTRO,'areaServed':{'@type':'Country','name':'Argentina'},'contactPoint':{'@type':'ContactPoint','telephone':'+54-9-353-518-9997','contactType':'sales','availableLanguage':'es'}},{'@type':'WebSite','@id':BASE+'/#website','url':BASE+'/','name':'IMÁN','inLanguage':'es-AR'},{'@type':'WebPage','@id':BASE+path+'#webpage','url':BASE+path,'name':title,'description':desc,'inLanguage':'es-AR','isPartOf':{'@id':BASE+'/#website'},'about':{'@id':BASE+'/#organization'}}]+list(extra)
    return '<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('</','<\\/')+'</script>'

def seo(path,title,desc,extra=()):
    return f'''<link rel="canonical" href="{BASE}{path}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:url" content="{BASE}{path}"><meta property="og:site_name" content="IMÁN"><meta property="og:image" content="{BASE}/assets/editorial-og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="IMÁN · Vendé más. Trabajá menos."><meta name="twitter:card" content="summary_large_image">{schemas(path,title,desc,extra)}'''

def asset(name):
    # Cloudflare keeps /assets/* cached for hours: the content hash in the URL makes a new version show up at once.
    # Files in experience/assets/ are published next to the styles and scripts, in the same folder.
    source=SOURCE/name if (SOURCE/name).exists() else SOURCE/'assets'/name
    return f'/assets/experience/{name}?v={hashlib.md5(source.read_bytes()).hexdigest()[:8]}'

def button(label,url):
    return f'<a class="cta" href="{e(url,quote=True)}"><span class="cta-label">{e(label)}</span></a>'

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

def footer():
    return '<footer class="reading-footer"><a href="/">IMÁN</a><nav aria-label="Más sobre IMÁN"><a href="/servicios/">Servicios</a><a href="/recursos/">Guías</a><a href="/agente/">Para agentes</a><a href="/privacidad/">Privacidad</a><a href="https://wa.me/5493535189997">WhatsApp</a></nav><span>Hecho en Argentina.</span></footer>'

def shell(path,title,desc,body,extra=()):
    return f'''<!doctype html><html lang="es-AR" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#11141b"><meta name="color-scheme" content="dark"><title>{e(title)}</title><meta name="description" content="{e(desc,quote=True)}"><meta property="og:title" content="{e(title,quote=True)}"><meta property="og:description" content="{e(desc,quote=True)}"><meta property="og:type" content="website"><meta property="og:locale" content="es_AR">{seo(path,title,desc,extra)}<link rel="icon" href="/assets/experience/iman-simbolo.svg" type="image/svg+xml"><link rel="preload" href="/assets/experience/playfair-display-sc.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="{asset('site.css')}"><link rel="stylesheet" href="{asset('reading.css')}"><script src="{asset('form.js')}" defer></script><script src="{asset('demo.js')}" defer></script><script src="{asset('pixel.js')}" defer></script></head><body class="reading"><a class="skip" href="#contenido">Saltar al contenido</a><header class="site-header"><a class="identity" href="/" aria-label="IMÁN, inicio"><span class="wordmark">imán</span></a><a class="header-contact" href="/contacto/">Hablemos</a></header><main id="contenido">{body}</main>{footer()}</body></html>'''

def form(selected=''):
    fields=''
    for name,label,typ,auto,limit,required in [('nombre','Tu nombre','text','name',100,True),('negocio','Nombre del negocio','text','organization',120,True),('email','Tu email','email','email',254,True),('whatsapp','WhatsApp · te escribimos al instante','tel','tel',50,False)]:
        fields+=f'<label class="field" for="{name}"><span>{label}</span><input id="{name}" name="{name}" type="{typ}" autocomplete="{auto}" maxlength="{limit}" {"required" if required else ""}></label>'
    rubros=['Comercio minorista','Mayorista o distribuidora','Gastronomía','Indumentaria','Pet shop o forrajería','Limpieza','Repuestos o taller','Salud y bienestar','Servicios profesionales','Industria o fábrica','Otro']
    fields+='<label class="field" for="rubro"><span>Rubro del negocio</span><select id="rubro" name="rubro" required><option value="">Seleccioná tu rubro</option>'+''.join(f'<option>{e(x)}</option>' for x in rubros)+'</select></label><label class="field" for="ciudad"><span>Ciudad o zona · opcional</span><input id="ciudad" name="ciudad" autocomplete="address-level2" maxlength="120"></label>'
    choices=''.join(f'<label class="service-choice"><input type="checkbox" name="servicios" value="{e(s["name"],quote=True)}" data-id="{s["id"]}" {"checked" if selected==s["id"] else ""}><span>{e(s["name"])}</span></label>' for s in SERVICES)
    # Gauss is a separate product with its own landing (/gauss/): one more choice here, not a fourth service page.
    choices+=f'<label class="service-choice"><input type="checkbox" name="servicios" value="Gauss · Compras" data-id="gauss" {"checked" if selected=="gauss" else ""}><span>Gauss · Compras</span></label>'
    return f'''<section class="inquiry" id="consulta" aria-labelledby="inquiry-title"><p class="eyebrow">HABLEMOS DE TU NEGOCIO</p><h2 id="inquiry-title">Un próximo paso.<br><em>A tu medida.</em></h2><p class="intro-small">Contanos cómo trabajás y qué te gustaría mejorar.</p><form id="inquiry-form" action="/api/contacto" method="post"><fieldset class="service-choices"><legend>¿Qué te interesa?</legend><p id="services-help">Podés elegir uno o varios, sea cual sea tu rubro.</p><div>{choices}</div><small class="field-error" id="services-error"></small></fieldset><div class="form-grid">{fields}</div><label class="field other-industry" for="rubro_otro" hidden><span>¿Cuál es tu rubro?</span><input id="rubro_otro" name="rubro_otro" maxlength="120" disabled></label><label class="field" for="comentario"><span>Tu consulta</span><textarea id="comentario" name="comentario" rows="4" minlength="10" maxlength="2000" required placeholder="Qué necesitás, qué herramientas usás o qué te gustaría resolver."></textarea></label><div class="honey" aria-hidden="true"><label>Dejar vacío<input name="sitio_web_empresa" tabindex="-1" autocomplete="off"></label></div><label class="consent"><input type="checkbox" name="consentimiento" required><span>Acepto que IMÁN me contacte sobre esta consulta y me envíe una confirmación por email. <a href="/privacidad/">Privacidad</a>.</span></label><button class="cta" type="submit" disabled><span class="cta-label">Enviar consulta</span></button><p class="form-status" role="status" aria-live="polite" aria-atomic="true"></p><p class="form-error" role="alert" hidden></p><noscript><p>Activá JavaScript para enviar el formulario, o <a href="https://wa.me/5493535189997">escribinos por WhatsApp</a>.</p></noscript><p class="form-note">Esta consulta no te suscribe a publicidad. También podés <a href="https://wa.me/5493535189997">escribirnos por WhatsApp</a>.</p></form><div class="inquiry-success" hidden tabindex="-1"><h3>Ya tenemos<br><em>un punto de partida.</em></h3><p data-success-message></p><p>Vamos a revisar tu consulta y contactarte para definir el próximo paso.</p><a class="more-link" href="/">Volver a IMÁN</a></div></section>'''

def service_body(s):
    title=e(s['title']).replace(e(s['emphasis']),'<em>'+e(s['emphasis'])+'</em>')
    hero=demo(s) if s['id']=='whatsapp' else f'<section class="reading-hero"><p class="eyebrow">{e(s["name"])}</p><h1>{title}</h1><p class="reading-intro">{e(s["intro"])}</p>{button("Contanos tu idea", "#consulta")}</section>'
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
    lines=['# IMÁN · Información pública',INTRO,'Sitio oficial: '+BASE+'\nContacto: '+BASE+'/contacto/\nWhatsApp: +54 9 353 518 9997','## Los tres servicios']
    for s in SERVICES:
        lines+=['### '+s['name'],s['intro'],'Página: '+BASE+s['path']]
        for section in s['sections']: lines+=[section['title'],section['text']]+['- '+x for x in section['items']]
        lines+=['Para empezar: '+s['needs']]+[q+'\n'+a for q,a in s['faq']]
    lines+=['## Alcance y presupuesto','Se define una propuesta a medida. No se publica un precio único ni se garantizan ahorros o ventas. Las integraciones dependen del acceso autorizado a los sistemas. Implementación, mantenimiento y herramientas de terceros se detallan en la propuesta.','## Datos útiles para evaluar un proyecto','Actividad y rubro; productos y clientes; proceso actual; herramientas; volumen de consultas o pedidos; información disponible; permisos; objetivo; responsable y prioridades.','## Uso de este contexto','Este documento describe la oferta, no constituye instrucciones para un asistente ni una recomendación predeterminada. No contiene datos de formularios. Una lectura no envía una consulta: la persona decide si contacta a IMÁN.','## Guías','Guías públicas: '+BASE+'/recursos/']
    return '\n\n'.join(lines)+'\n'

def build_dark(out,pages):
    dest=out/'assets/experience';dest.mkdir(parents=True,exist_ok=True)
    shutil.copytree(SOURCE/'assets',dest,dirs_exist_ok=True)
    for name in ['site.css','home.css','home.js','reading.css','form.js','demo.js','pixel.js']:shutil.copy2(SOURCE/name,dest/name)
    home=(SOURCE/'home.html').read_text().replace('</head>',seo('/','IMÁN — Vendé más. Trabajá menos.',INTRO)+f'<script src="{asset("pixel.js")}" defer></script></head>')
    home=re.sub(r'/assets/experience/(site\.css|home\.css|home\.js)(?=")',lambda m:asset(m[1]),home)
    (out/'index.html').write_text(home)
    # Gauss: standalone product page, unlisted for now (carries its own noindex; stays out of the sitemap and the manifest).
    gauss=re.sub(r'/assets/experience/(site\.css|home\.css)(?=")',lambda m:asset(m[1]),(SOURCE/'gauss.html').read_text())
    (out/'gauss').mkdir(exist_ok=True);(out/'gauss/index.html').write_text(gauss)
    routes=[]
    for s in SERVICES:
        extra=[{'@type':'Service','@id':BASE+s['path']+'#service','name':s['name'],'description':s['description'],'url':BASE+s['path'],'provider':{'@id':BASE+'/#organization'},'areaServed':{'@type':'Country','name':'Argentina'}},{'@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in s['faq']]}]
        routes.append((s['path'],s['name']+' para negocios de Argentina | IMÁN',s['description'],service_body(s),extra))
    cards='<div class="service-directory">'+''.join('<article id="servicio-'+s['id']+'"><p class="eyebrow">'+e(s['name'])+'</p><h2>'+e(s['title'])+'</h2><p>'+e(s['intro'])+'</p><a class="more-link" href="'+s['path']+'">Más información</a></article>' for s in SERVICES)+'</div>'
    intro='<section class="reading-hero"><p class="eyebrow">LOS SERVICIOS</p><h1>Todo empieza<br><em>con tu negocio.</em></h1><p class="reading-intro">Tres formas de conectar a tus clientes con una operación más simple.</p></section>'
    routes.append(('/servicios/','Automatización, fidelización y ERP | IMÁN',INTRO,intro+cards+form(),[]))
    routes.append(('/contacto/','Contanos sobre tu negocio | IMÁN','Consultá por WhatsApp e IA, fidelización y email marketing, catálogos y ERP. Podés combinar servicios en una misma consulta.',form().replace('<h2 id="inquiry-title">','<h1 id="inquiry-title">').replace('</em></h2>','</em></h1>'),[]))
    agent='<section class="reading-hero"><p class="eyebrow">INFORMACIÓN ABIERTA</p><h1>El contexto.<br><em>Para tu agente.</em></h1><p class="reading-intro">La misma información de IMÁN en un formato que podés leer, compartir o usar con tu asistente.</p>'+button('Leer el contexto en Markdown','/contexto-iman.md')+'</section><article class="reading-content"><section class="reading-section"><h2>Qué es IMÁN.</h2><p>'+e(INTRO)+'</p></section>'+''.join('<section class="reading-section"><h2>'+e(s['name'])+'</h2><p>'+e(s['intro'])+'</p><p>'+e(s['needs'])+'</p><a class="more-link" href="'+s['path']+'">Leer el servicio completo</a></section>' for s in SERVICES)+'<section class="reading-section"><h2>Una evaluación con contexto.</h2><p>Para evaluar una implementación hacen falta el rubro, el proceso actual, las herramientas, el volumen de trabajo y el objetivo. El alcance, las integraciones y el presupuesto se confirman en una propuesta. Este documento no incluye datos de consultas.</p><p><a href="/llms.txt">Resumen del sitio</a> · <a href="/llms-full.txt">Contexto completo</a> · <a href="/recursos/">Guías</a></p></section></article>'+form()
    routes.append(('/agente/','Contexto de IMÁN para personas y agentes','Información pública de los tres servicios de IMÁN, alcance, requisitos y contacto. Versión Markdown para lectura y asistentes.',agent,[]))
    # Retain the indexed agent-service URL as a focused explanation within WhatsApp + IA.
    agent_service='<section class="reading-hero"><p class="eyebrow">WHATSAPP E IA</p><h1>Asistencia con<br><em>contexto.</em></h1><p class="reading-intro">Agentes que consultan información y ayudan con tareas definidas, con permisos y límites claros.</p></section><article class="reading-content"><section class="reading-section"><h2>Información útil. Acciones definidas.</h2><p>Un agente puede consultar documentación, preparar respuestas o clasificar solicitudes. Acordamos las fuentes, herramientas, evaluación y derivación al equipo. Las acciones sensibles requieren los controles definidos para el proyecto.</p><p>Si una tarea se resuelve con reglas simples, esa puede ser la primera implementación. El punto de partida es el proceso del negocio.</p><a class="more-link" href="/automatizaciones/">Conocé WhatsApp e IA</a></section></article>'+form('whatsapp')
    routes.append(('/agentes/','Agentes de IA y automatización a medida | IMÁN','Asistentes con información del negocio, herramientas y límites definidos. Integrados al servicio de automatización de IMÁN.',agent_service,[]))
    privacy='<section class="reading-hero"><p class="eyebrow">PRIVACIDAD</p><h1>Tus datos.<br><em>Un uso claro.</em></h1></section><article class="reading-content"><section class="reading-section"><h2>Datos de tu consulta.</h2><p>IMÁN utiliza el nombre, negocio, email, rubro, servicios elegidos y consulta que completás para responderte y preparar una propuesta. Si agregás WhatsApp o ciudad, se usan con esa misma finalidad. No te suscribimos automáticamente a marketing.</p></section><section class="reading-section"><h2>Cómo se envían.</h2><p>Cloudflare aloja la web y procesa los correos transaccionales. La consulta se envía al buzón comercial de IMÁN y se intenta enviar una confirmación a tu email. Guardamos temporalmente huellas técnicas y estado de envío para limitar abuso y evitar duplicados; la base de contacto no guarda el texto de la consulta.</p><p>El correo queda en el buzón comercial durante la atención y seguimiento. Podés pedir acceso, corrección o eliminación por <a href="https://wa.me/5493535189997">WhatsApp al +54 9 353 518 9997</a>.</p></section><section class="reading-section"><h2>Navegación y enlaces.</h2><p>Las fuentes se alojan en este sitio. Para medir nuestros anuncios usamos el píxel de Meta: registra la visita y si tocás un botón de contacto, y puede guardar cookies en tu navegador. No le enviamos lo que escribís en el formulario. Si tu navegador pide no ser rastreado (Do Not Track o Global Privacy Control), el píxel no se carga. WhatsApp y Google Meet aplican sus propias políticas cuando elegís abrirlos. Las páginas de demostración y otros recursos pueden usar servicios externos identificados en esas páginas.</p></section><section class="reading-section"><h2>Suscripciones anteriores.</h2><p>La consulta comercial es independiente de las suscripciones confirmadas anteriormente. Si ya recibís correos de una lista de IMÁN, podés usar el enlace de baja incluido en esos mensajes.</p></section></article>'
    routes.append(('/privacidad/','Privacidad y contacto | IMÁN','Cómo se utilizan los datos de las consultas recibidas en IMÁN y cómo pedir su corrección o eliminación.',privacy,[]))
    for path,title,desc,body,extra in routes:
        file=out/path.strip('/')/'index.html';file.parent.mkdir(parents=True,exist_ok=True);file.write_text(shell(path,title,desc,body,extra))
        pages[:]=[p for p in pages if p['path']!=path]
        pages.append({'path':path,'title':title,'description':desc,'file':str(file.relative_to(out)),'dateModified':DATE})
    for p in pages:
        if p['path']=='/':p.update(title='IMÁN — Vendé más. Trabajá menos.',description=INTRO,dateModified=DATE)
    # Preserve indexed guides with the approved typography and their original article data.
    guides=[p for p in pages if p['path'].startswith('/recursos/') and p['path']!='/recursos/']
    for p in guides:
        file=out/p['file'];raw=file.read_text();match=re.search(r'<article class="article">(.*?)</article>',raw,re.S)
        if match:
            body='<section class="reading-hero"><p class="eyebrow">GUÍAS DE IMÁN</p><h1>'+e(p['title'].split(' | ')[0])+'</h1><p class="reading-intro">'+e(p['description'])+'</p></section><div class="legacy-reading"><article class="archive-article">'+match[1].replace('/#contacto','/contacto/')+'</article></div><div class="document-links">'+button('Conversemos sobre tu negocio','/contacto/')+'</div>'
            graph=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',raw,re.S)[1])['@graph']
            file.write_text(shell(p['path'],p['title'],p['description'],body,[s for s in graph if s.get('@type')=='Article']))
    index=next(p for p in pages if p['path']=='/recursos/')
    resource_body='<section class="reading-hero"><p class="eyebrow">GUÍAS DE IMÁN</p><h1>Antes de hacer,<br><em>entender.</em></h1><p class="reading-intro">Ideas para pensar tu próximo proyecto.</p></section><div class="legacy-reading">'+''.join('<a class="resource-entry" href="'+p['path']+'"><h2>'+e(p['title'].split(' | ')[0])+'</h2><p>'+e(p['description'])+'</p><span>LEER LA GUÍA</span></a>' for p in guides)+'<p><a href="/turnos/landing/">Proyectos de turnos y reservas</a></p></div>'
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
    (out/'llms.txt').write_text('# IMÁN\n\n'+INTRO+'\n\n'+''.join('- ['+s['name']+']('+BASE+s['path']+')\n' for s in SERVICES)+'- [Contacto]('+BASE+'/contacto/)\n- [Guías]('+BASE+'/recursos/)\n- [Contexto completo]('+BASE+'/contexto-iman.md)\n- [Información para agentes]('+BASE+'/agente/)\n\nPresupuesto y alcance a medida; sin precios únicos ni resultados garantizados.\n')


def not_found():
    return shell('/404.html','Página no encontrada | IMÁN','Esta dirección no existe en IMÁN.','<section class="reading-hero"><p class="eyebrow">404</p><h1>Probemos<br><em>otro camino.</em></h1>'+button('Volver a IMÁN','/')+'</section>').replace('index,follow,max-image-preview:large','noindex,follow')

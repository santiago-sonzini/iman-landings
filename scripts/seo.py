#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Aplica el sistema SEO/AEO sobre las landings. Idempotente: se puede re-correr.

Uso:  python3 scripts/seo.py
Documentación: SEO.md
"""
import re, os, html, json, subprocess, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://iman.ar"
OLD  = "https://iman-landings.vercel.app"
ORG  = BASE + "/#organization"
SITE = BASE + "/#website"
MARK_A = "<!-- ═══ SEO/AEO generado — no editar a mano, ver SEO.md ═══ -->"
MARK_B = "<!-- ═══ /SEO/AEO ═══ -->"

def rd(p):  return open(os.path.join(ROOT, p), encoding="utf-8").read()
def wr(p,s): open(os.path.join(ROOT, p), "w", encoding="utf-8").write(s)

def gitdate(p):
    try:
        out = subprocess.run(["git","log","-1","--format=%cs","--",p], cwd=ROOT,
                             capture_output=True, text=True).stdout.strip()
        return out or datetime.date.today().isoformat()
    except Exception:
        return datetime.date.today().isoformat()

# ─────────────────────────────────────────────────────────────
# Configuración por página
# ─────────────────────────────────────────────────────────────
def P(**kw): return kw

PAGES = {
"club/index.html": P(
    url="/", prio="1.0", aud=None,
    crumbs=[], kind="club",
    desc="Imán Club es un Club de Clientes con la marca de tu comercio: puntos, beneficios y referidos. Tus clientes escanean un QR y participan sin descargar ninguna aplicación.",
),
"comercios/index.html": P(
    url="/comercios/", prio="0.9", aud="min",
    crumbs=[("Para comercios","/comercios/")], kind="service",
    svc_name="Imán para comercios y distribuidoras",
    svc_aud="Comercios minoristas y distribuidoras mayoristas de Argentina",
),
"turnos/landing/index.html": P(
    url="/turnos/landing/", prio="0.9", aud=None,
    crumbs=[("Imán Turnos","/turnos/landing/")], kind="turnos",
    og_image=BASE+"/og.png",
),
"pet/index.html": P(
    url="/pet/", prio="0.8", aud=None,
    crumbs=[("Pet shops","/pet/")], kind="service",
    svc_name="Imán para pet shops y forrajerías",
    svc_aud="Pet shops, forrajerías y veterinarias con venta de alimento",
),
"ropa/index.html": P(
    url="/ropa/", prio="0.8", aud=None,
    crumbs=[("Indumentaria","/ropa/")], kind="service",
    svc_name="Imán para locales de indumentaria",
    svc_aud="Locales de ropa e indumentaria",
),
"limpieza/index.html": P(
    url="/limpieza/", prio="0.8", aud=None,
    crumbs=[("Artículos de limpieza","/limpieza/")], kind="service",
    svc_name="Imán para negocios de artículos de limpieza",
    svc_aud="Comercios de artículos de limpieza y perfumería",
),
"repuestos/index.html": P(
    url="/repuestos/", prio="0.8", aud=None,
    crumbs=[("Repuestos y lubricentros","/repuestos/")], kind="service",
    svc_name="Imán para casas de repuestos, lubricentros y talleres",
    svc_aud="Casas de repuestos, lubricentros y talleres mecánicos",
),
"transporte/index.html": P(
    url="/transporte/", prio="0.8", aud=None,
    crumbs=[("Transporte y reparto","/transporte/")], kind="service",
    svc_name="Imán para transporte y reparto",
    svc_aud="Empresas de transporte, logística y reparto de última milla",
    og_image=BASE+"/transporte/og.png",
),
"petshops/minorista/index.html": P(
    url="/petshops/minorista/", prio="0.7", aud="min",
    crumbs=[("Pet shops","/petshops/minorista/"),("Minorista","/petshops/minorista/")],
    kind="service",
    title="Imán para pet shops — que tus clientes vuelvan a comprar a tiempo",
    desc="Imán mira las ventas de tu pet shop, detecta a quién se le está por terminar el alimento y te deja las promos y los WhatsApp listos para mandar. Sin cambiar tu sistema.",
    svc_name="Imán para pet shops (minorista)",
    svc_aud="Pet shops y forrajerías minoristas",
),
"petshops/distribuidora/index.html": P(
    url="/petshops/distribuidora/", prio="0.7", aud="dist",
    crumbs=[("Pet shops","/petshops/minorista/"),("Distribuidoras","/petshops/distribuidora/")],
    kind="service",
    title="Imán para distribuidoras pet — premiá a tus comercios y recuperá los que se enfrían",
    desc="Imán analiza tu facturación mayorista, te muestra qué pet shops bajaron sin avisar y a cuáles premiar, y te deja regalarles la herramienta con tu marca.",
    svc_name="Imán para distribuidoras de productos pet",
    svc_aud="Distribuidoras mayoristas de alimento y productos para mascotas",
),
"limpieza/minorista/index.html": P(
    url="/limpieza/minorista/", prio="0.7", aud="min",
    crumbs=[("Limpieza","/limpieza/"),("Minorista","/limpieza/minorista/")],
    kind="service",
    title="Imán para negocios de limpieza — clientes que recompran todas las semanas",
    desc="Imán usa las ventas de tu negocio de limpieza para detectar quién está por reponer y quién dejó de venir, y te arma las promos con el WhatsApp listo.",
    svc_name="Imán para comercios de artículos de limpieza (minorista)",
    svc_aud="Comercios minoristas de artículos de limpieza",
),
"limpieza/distribuidora/index.html": P(
    url="/limpieza/distribuidora/", prio="0.7", aud="dist",
    crumbs=[("Limpieza","/limpieza/"),("Distribuidoras","/limpieza/distribuidora/")],
    kind="service",
    title="Imán para distribuidoras de limpieza — premiá a tus comercios y recuperá los que se enfrían",
    desc="Imán analiza tu facturación mayorista, te muestra qué comercios de limpieza bajaron sin avisar y a cuáles premiar, y te deja regalarles la herramienta con tu marca.",
    svc_name="Imán para distribuidoras de artículos de limpieza",
    svc_aud="Distribuidoras mayoristas de artículos de limpieza",
),
"petshops/index.html": P(
    url="/petshops/", canonical="/petshops/minorista/", prio=None, aud="min",
    crumbs=[("Pet shops","/petshops/minorista/")], kind="service",
    svc_name="Imán para pet shops y distribuidoras",
    svc_aud="Pet shops y distribuidoras de productos pet",
),
"urbase/index.html": P(
    url="/urbase/", prio="0.8", aud=None, crumbs=[], kind="urbase",
),
}

NOINDEX = ["turnos/index.html", "turnos/reservar.html"]

# ─────────────────────────────────────────────────────────────
# Utilidades de parsing
# ─────────────────────────────────────────────────────────────
def txt(s):
    s = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', s, flags=re.S)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

def drop_other_aud(frag, aud):
    """Quita los bloques del público contrario (solo-min / solo-dist)."""
    if not aud: return frag
    other = 'solo-dist' if aud == 'min' else 'solo-min'
    out, i = [], 0
    for m in re.finditer(r'<(\w+)([^>]*\bclass="[^"]*\b%s\b[^"]*"[^>]*)>' % other, frag):
        tag, start = m.group(1), m.start()
        depth, j = 1, m.end()
        for t in re.finditer(r'</?%s\b[^>]*>' % tag, frag[m.end():]):
            depth += -1 if t.group(0).startswith('</') else 1
            if depth == 0:
                j = m.end() + t.end(); break
        if start < i: continue
        out.append(frag[i:start]); i = j
    out.append(frag[i:])
    return ''.join(out)

def faqs(src, aud):
    src = drop_other_aud(src, aud)
    res = []
    for b in re.findall(r'<details[^>]*>(.*?)</details>', src, re.S):
        m = re.search(r'<summary[^>]*>(.*?)</summary>', b, re.S)
        if not m: continue
        q = txt(re.sub(r'<span[^>]*class="[^"]*(?:prox|badge|chip|pill)[^"]*"[^>]*>.*?</span>', '', m.group(1), flags=re.S|re.I))
        a = txt(re.sub(r'<summary[^>]*>.*?</summary>', '', b, flags=re.S))
        q = re.sub(r'\s*Próximamente\s*$', '', q).strip()
        if q and a: res.append((q, a))
    return res

def meta(src, key, attr='name'):
    m = re.search(r'<meta\s+%s="%s"\s+content="([^"]*)"' % (attr, re.escape(key)), src)
    return html.unescape(m.group(1)) if m else None

def title_of(src):
    m = re.search(r'<title>(.*?)</title>', src, re.S)
    return html.unescape(txt(m.group(1))) if m else ""

# ─────────────────────────────────────────────────────────────
# Nodos JSON-LD compartidos
# ─────────────────────────────────────────────────────────────
def org_node():
    return {
        "@type": "Organization", "@id": ORG,
        "name": "Imán",
        "alternateName": ["Iman", "Imán App"],
        "url": BASE + "/",
        "logo": {"@type": "ImageObject", "@id": BASE + "/#logo",
                 "url": BASE + "/og.png", "width": 1200, "height": 630, "caption": "Imán"},
        "image": {"@id": BASE + "/#logo"},
        "slogan": "La próxima venta ya está en tus ventas de ayer.",
        "description": ("Imán es una herramienta argentina de recupero y fidelización de clientes para "
                        "comercios. Usa las ventas que el negocio ya tiene para detectar quién está por "
                        "volver a comprar y quién se enfrió, y entrega los mensajes de WhatsApp listos "
                        "para mandar. El cliente final no descarga ninguna aplicación."),
        "areaServed": {"@type": "Country", "name": "Argentina"},
        "knowsLanguage": ["es-AR", "es"],
        "contactPoint": [{
            "@type": "ContactPoint", "contactType": "sales",
            "telephone": "+5493534797679",
            "url": "https://wa.me/5493534797679",
            "availableLanguage": ["Spanish"],
            "areaServed": "AR",
        }],
    }

def site_node():
    return {"@type": "WebSite", "@id": SITE, "url": BASE + "/", "name": "Imán",
            "publisher": {"@id": ORG}, "inLanguage": "es-AR"}

FEATURES = [
    "Detección automática del ciclo de recompra de cada cliente",
    "Semáforo de cartera: quién compra seguido y quién se enfrió",
    "Campañas de WhatsApp armadas y segmentadas, listas para aprobar",
    "Importación desde Excel o desde el reporte de cualquier sistema de facturación",
    "Programa de puntos, beneficios y referidos con la marca del comercio",
    "Sin aplicación para el cliente final",
]

def club_node():
    return {
        "@type": ["SoftwareApplication", "Product"], "@id": BASE + "/#imanclub",
        "name": "Imán Club",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Programa de fidelización y recupero de clientes",
        "operatingSystem": "Web — funciona en el navegador, sin instalación",
        "url": BASE + "/",
        "inLanguage": "es-AR",
        "brand": {"@id": ORG}, "provider": {"@id": ORG}, "publisher": {"@id": ORG},
        "audience": {"@type": "BusinessAudience", "name": "Comercios minoristas y distribuidoras de Argentina"},
        "featureList": FEATURES,
        "description": ("Imán Club es un Club de Clientes personalizado con la marca del comercio: puntos, "
                        "beneficios y referidos. El cliente escanea un QR, se registra en el navegador de su "
                        "teléfono y participa sin descargar ninguna aplicación ni entrar a un marketplace."),
    }

def turnos_node():
    return {
        "@type": ["SoftwareApplication", "Product"], "@id": BASE + "/turnos/landing/#imanturnos",
        "name": "Imán Turnos",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Turnero online / gestión de agenda",
        "operatingSystem": "Web — funciona en el navegador, sin instalación",
        "url": BASE + "/turnos/landing/",
        "inLanguage": "es-AR",
        "brand": {"@id": ORG}, "provider": {"@id": ORG},
        "audience": {"@type": "BusinessAudience", "name": "Barberías y peluquerías"},
        "featureList": [
            "Link público de reserva para compartir en la bio de Instagram",
            "Seña por Mercado Pago, sin comisión adicional de Imán",
            "Detección de huecos en la agenda y del cliente que ya está para volver",
            "Sin app para el cliente: reserva desde el navegador",
            "Configuración en menos de 3 minutos",
        ],
        "description": ("Imán Turnos es un turnero online para barberías y peluquerías: link de reserva "
                        "público, seña por Mercado Pago y aviso de qué cliente está para volver cuando "
                        "queda un hueco en la agenda. $ 15.000 ARS por mes, con 14 días gratis y sin tarjeta."),
        "offers": {
            "@type": "Offer", "price": "15000", "priceCurrency": "ARS",
            "availability": "https://schema.org/InStock",
            "url": BASE + "/turnos/landing/",
            "seller": {"@id": ORG},
            "description": "Plan mensual en pesos argentinos. 14 días de prueba gratis, sin tarjeta y sin permanencia.",
            "priceSpecification": {
                "@type": "UnitPriceSpecification", "price": "15000", "priceCurrency": "ARS",
                "billingDuration": 1, "billingIncrement": 1, "unitCode": "MON",
                "referenceQuantity": {"@type": "QuantitativeValue", "value": 1, "unitCode": "MON"},
            },
        },
    }

def service_node(url, name, aud_desc, desc):
    return {
        "@type": "Service", "@id": url + "#service",
        "name": name,
        "serviceType": "Recupero y fidelización de clientes para comercios",
        "category": "Marketing de recompra",
        "url": url,
        "provider": {"@id": ORG}, "brand": {"@id": ORG},
        "areaServed": {"@type": "Country", "name": "Argentina"},
        "audience": {"@type": "BusinessAudience", "name": aud_desc},
        "availableChannel": [
            {"@type": "ServiceChannel", "name": "WhatsApp", "serviceUrl": "https://wa.me/5493534797679"},
            {"@type": "ServiceChannel", "name": "Llamada de 30 minutos", "serviceUrl": "https://calendly.com/santiago-iman/30min"},
        ],
        "description": desc,
        "isRelatedTo": {"@id": BASE + "/#imanclub"},
    }

def urbase_nodes(url, title, desc):
    ub_org = url + "#organization"
    return [
        {"@type": ["Organization", "Brand"], "@id": ub_org, "name": "URBASE",
         "url": url, "description": "Fábrica argentina de soportes de pared impresos en 3D para cascos de moto.",
         "logo": {"@type": "ImageObject", "url": BASE + "/urbase/img/og.jpg"},
         "areaServed": {"@type": "Country", "name": "Argentina"},
         "sameAs": ["https://instagram.com/urbase.vm"],
         "contactPoint": [{"@type": "ContactPoint", "contactType": "sales",
                           "url": "https://wa.me/5493534419023", "areaServed": "AR",
                           "availableLanguage": ["Spanish"]}]},
        {"@type": "Product", "@id": url + "#product",
         "name": "Soporte de pared para casco de moto URBASE",
         "url": url,
         "category": "Accesorios para motociclismo",
         "brand": {"@id": ub_org}, "manufacturer": {"@id": ub_org},
         "image": [BASE + "/urbase/img/hero-casco.jpg", BASE + "/urbase/img/producto-blanco.jpg",
                   BASE + "/urbase/img/extra-producto-negro.jpg"],
         "countryOfOrigin": {"@type": "Country", "name": "Argentina"},
         "additionalProperty": [
             {"@type": "PropertyValue", "name": "Fabricación", "value": "Impresión 3D, diseñado e impreso en Argentina"},
             {"@type": "PropertyValue", "name": "Montaje", "value": "Pared"},
             {"@type": "PropertyValue", "name": "Personalización", "value": "Grabado del logo del local o de las marcas que vende"},
         ],
         "description": desc},
        {"@type": "Offer", "@id": url + "#mayorista",
         "name": "Venta mayorista URBASE para tiendas de motos",
         "itemOffered": {"@id": url + "#product"},
         "eligibleCustomerType": "https://schema.org/Reseller",
         "seller": {"@id": ub_org},
         "areaServed": {"@type": "Country", "name": "Argentina"},
         "url": "https://wa.me/5493534419023",
         "description": "Precio mayorista escalonado por cantidad para tiendas de motos, con grabado personalizado del logo del local."},
    ]

def breadcrumbs(crumbs, url):
    items = [{"@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE + "/"}]
    for i, (name, href) in enumerate(crumbs, start=2):
        items.append({"@type": "ListItem", "position": i, "name": name, "item": BASE + href})
    return {"@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": items}

# ─────────────────────────────────────────────────────────────
# Inyección
# ─────────────────────────────────────────────────────────────
def build_block(path, cfg, src):
    url  = BASE + cfg["url"]
    canon = BASE + cfg.get("canonical", cfg["url"])
    t    = cfg.get("title") or title_of(src)
    d    = cfg.get("desc")  or meta(src, "description") or ""
    lastmod = gitdate(path)
    is_urbase = cfg["kind"] == "urbase"

    page = {
        "@type": "WebPage", "@id": url + "#webpage",
        "url": url, "name": t, "description": d,
        "isPartOf": {"@id": SITE},
        "inLanguage": "es-AR",
        "dateModified": lastmod,
        "primaryImageOfPage": {"@type": "ImageObject",
                               "url": cfg.get("og_image") or (BASE + "/urbase/img/og.jpg" if is_urbase else BASE + "/og.png")},
    }
    if not is_urbase:
        page["about"] = {"@id": ORG}
        page["publisher"] = {"@id": ORG}

    graph = []
    if is_urbase:
        graph += urbase_nodes(url, t, d)
        page["about"] = {"@id": url + "#product"}
        page["publisher"] = {"@id": url + "#organization"}
        graph.append(site_node())
    else:
        graph += [org_node(), site_node()]

    if cfg["kind"] == "club":
        graph.append(club_node())
        page["mainEntity"] = {"@id": BASE + "/#imanclub"}
    elif cfg["kind"] == "turnos":
        graph.append(turnos_node())
        page["mainEntity"] = {"@id": BASE + "/turnos/landing/#imanturnos"}
    elif cfg["kind"] == "service":
        graph.append(club_node())
        graph.append(service_node(url, cfg["svc_name"], cfg["svc_aud"], d))
        page["mainEntity"] = {"@id": url + "#service"}

    if cfg["crumbs"]:
        bc = breadcrumbs(cfg["crumbs"], url)
        graph.append(bc)
        page["breadcrumb"] = {"@id": bc["@id"]}

    qa = faqs(src, cfg.get("aud"))
    if qa:
        faq = {"@type": "FAQPage", "@id": url + "#faq", "url": url, "inLanguage": "es-AR",
               "mainEntity": [{"@type": "Question", "name": q,
                               "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]}
        graph.append(faq)
        page["hasPart"] = {"@id": faq["@id"]}

    graph.append(page)
    ld = {"@context": "https://schema.org", "@graph": graph}

    lines = [MARK_A,
             '<link rel="canonical" href="%s">' % canon,
             '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">',
             '<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">']

    # Top-up de Open Graph / Twitter que falten
    need = [("og:type", "website", "property"),
            ("og:site_name", "URBASE" if is_urbase else "Imán", "property"),
            ("og:locale", "es_AR", "property"),
            ("og:url", url, "property"),
            ("og:title", t, "property"),
            ("og:description", d, "property"),
            ("og:image", cfg.get("og_image") or (BASE + "/urbase/img/og.jpg" if is_urbase else BASE + "/og.png"), "property"),
            ("twitter:card", "summary_large_image", "name"),
            ("twitter:title", t, "name"),
            ("twitter:description", d, "name"),
            ("twitter:image", cfg.get("og_image") or (BASE + "/urbase/img/og.jpg" if is_urbase else BASE + "/og.png"), "name")]
    for key, val, attr in need:
        if not re.search(r'<meta\s+%s="%s"' % (attr, re.escape(key)), src):
            lines.append('<meta %s="%s" content="%s">' % (attr, key, html.escape(val, quote=True)))

    lines.append('<script type="application/ld+json">')
    lines.append(json.dumps(ld, ensure_ascii=False, indent=2))
    lines.append('</script>')
    lines.append(MARK_B)
    return "\n".join(lines)

def apply_page(path, cfg):
    src = rd(path)
    # 1. dominio
    src = src.replace(OLD, BASE)
    # 2. bloque anterior fuera
    src = re.sub(re.escape(MARK_A) + r'.*?' + re.escape(MARK_B) + r'\n?', '', src, flags=re.S)
    # 3. canonical/robots previos fuera (se re-emiten en el bloque)
    src = re.sub(r'[ \t]*<link rel="canonical"[^>]*>\n?', '', src)
    src = re.sub(r'[ \t]*<meta name="robots"[^>]*>\n?', '', src)
    src = re.sub(r'[ \t]*<meta name="googlebot"[^>]*>\n?', '', src)
    # 4. título/descripción propios de la URL
    if cfg.get("title"):
        src = re.sub(r'<title>.*?</title>', '<title>%s</title>' % html.escape(cfg["title"]), src, count=1, flags=re.S)
    if cfg.get("desc"):
        if re.search(r'<meta name="description"[^>]*>', src):
            src = re.sub(r'<meta name="description"[^>]*>',
                         '<meta name="description" content="%s">' % html.escape(cfg["desc"], quote=True), src, count=1)
    # 5. og:title/og:description/twitter alineados al override
    for key, attr, val in (("og:title","property",cfg.get("title")), ("twitter:title","name",cfg.get("title")),
                           ("og:description","property",cfg.get("desc")), ("twitter:description","name",cfg.get("desc"))):
        if val:
            src = re.sub(r'<meta %s="%s" content="[^"]*">' % (attr, re.escape(key)),
                         '<meta %s="%s" content="%s">' % (attr, key, html.escape(val, quote=True)), src, count=1)
    # 6. inyectar antes de </head>
    block = build_block(path, cfg, src)
    src = src.replace("</head>", block + "\n</head>", 1)
    wr(path, src)
    return len(faqs(src, cfg.get("aud")))

# ─────────────────────────────────────────────────────────────
def main():
    report = []
    for path, cfg in PAGES.items():
        n = apply_page(path, cfg)
        report.append("  %-42s canonical=%-32s faqs=%d" % (path, cfg.get("canonical", cfg["url"]), n))

    # noindex en demos
    for path in NOINDEX:
        src = rd(path).replace(OLD, BASE)
        src = re.sub(r'[ \t]*<meta name="robots"[^>]*>\n?', '', src)
        src = re.sub(r'[ \t]*<link rel="canonical"[^>]*>\n?', '', src)
        src = src.replace("</head>",
              '<meta name="robots" content="noindex, nofollow">\n'
              '<link rel="canonical" href="%s/turnos/landing/">\n</head>' % BASE, 1)
        wr(path, src)
        report.append("  %-42s noindex, nofollow" % path)

    # noindex en las piezas de ads
    ads = subprocess.run(["git","ls-files","turnos/ads/*.html"], cwd=ROOT,
                         capture_output=True, text=True).stdout.split()
    for path in ads:
        src = rd(path)
        if 'name="robots"' in src: continue
        if "</head>" in src:
            src = src.replace("</head>", '<meta name="robots" content="noindex, nofollow">\n</head>', 1)
            wr(path, src)
    report.append("  %-42s noindex, nofollow (%d archivos)" % ("turnos/ads/*.html", len(ads)))

    # ── sitemap.xml ──
    entries = []
    for path, cfg in PAGES.items():
        if not cfg.get("prio"): continue
        entries.append((BASE + cfg["url"], gitdate(path), cfg["prio"],
                        "weekly" if cfg["prio"] == "1.0" else "monthly"))
    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<!-- Sitemap de las landings de Imán. Generado desde la config de SEO.md. -->',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, mod, prio, freq in entries:
        xml += ['  <url>', '    <loc>%s</loc>' % loc, '    <lastmod>%s</lastmod>' % mod,
                '    <changefreq>%s</changefreq>' % freq, '    <priority>%s</priority>' % prio, '  </url>']
    xml.append('</urlset>')
    wr("sitemap.xml", "\n".join(xml) + "\n")
    report.append("  sitemap.xml — %d URLs" % len(entries))

    # ── llms-full.txt ──
    out = ["# Imán — contenido completo de las landings",
           "",
           "> Volcado en texto plano de todas las páginas públicas de https://iman.ar/, pensado para",
           "> motores de respuesta e IA. El índice corto está en https://iman.ar/llms.txt",
           "",
           "Última actualización: %s · Idioma: es-AR · País: Argentina" % datetime.date.today().isoformat(),
           ""]
    for path, cfg in PAGES.items():
        if cfg.get("canonical"): continue   # duplicados canonicalizados
        src = rd(path)
        t = cfg.get("title") or title_of(src)
        d = cfg.get("desc") or meta(src, "description") or ""
        out += ["", "---", "", "## %s" % t, "", "URL: %s%s" % (BASE, cfg["url"]), "", d, ""]
        body = re.search(r'<body.*?</body>', src, re.S)
        body = drop_other_aud(body.group(0) if body else src, cfg.get("aud"))
        body = re.sub(r'<(script|style|svg|nav|footer)[^>]*>.*?</\1>', ' ', body, flags=re.S)
        heads = [txt(h) for h in re.findall(r'<h[23][^>]*>(.*?)</h[23]>', body, re.S)]
        heads = [h for h in heads if h and len(h) > 3]
        if heads:
            out += ["### Secciones de la página", ""] + ["- %s" % h for h in dict.fromkeys(heads)] + [""]
        qa = faqs(src, cfg.get("aud"))
        if qa:
            out += ["### Preguntas frecuentes", ""]
            for q, a in qa:
                out += ["**%s**" % q, "", a, ""]
    wr("llms-full.txt", "\n".join(out).rstrip() + "\n")
    report.append("  llms-full.txt")

    print("\n".join(report))

main()

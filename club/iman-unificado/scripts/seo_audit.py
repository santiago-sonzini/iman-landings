#!/usr/bin/env python3
"""Offline discovery/content audit. No external requests, publishing or dependencies."""
import argparse
from collections import defaultdict, deque
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


def normalized(text):
    return ' '.join(text.split())


class Document(HTMLParser):
    def __init__(self, raw):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.title = []; self.h1 = []; self.main = []; self.paragraphs = []
        self.links = []; self.canon = []; self.meta = {}; self.images = []; self.frames = []
        self.schema = []; self.schema_errors = []; self.schema_buffer = None
        self.paragraph = None; self.lang = ''; self.has_main = False
        self.feed(raw)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        inherited = self.stack[-1][1] if self.stack else False
        skip = inherited or tag in {'script', 'style', 'nav', 'footer', 'form', 'noscript', 'svg'} or a.get('id') in {'contacto', 'newsletter'} or 'hidden' in a
        if tag == 'html': self.lang = a.get('lang', '')
        if tag == 'main': self.has_main = True
        if tag == 'meta': self.meta[(a.get('name') or a.get('property') or '').lower()] = a.get('content', '')
        if tag == 'link' and 'canonical' in a.get('rel', '').split(): self.canon.append(a.get('href', ''))
        if tag == 'a' and 'href' in a and a.get('rel') != 'nofollow': self.links.append(a['href'])
        if tag == 'img': self.images.append(a)
        if tag == 'iframe': self.frames.append(a)
        if tag == 'script' and a.get('type') == 'application/ld+json': self.schema_buffer = ''
        if tag == 'p' and not skip and any(t == 'main' for t, _ in self.stack): self.paragraph = []
        if tag not in VOID: self.stack.append((tag, skip))

    def handle_data(self, data):
        if self.schema_buffer is not None: self.schema_buffer += data
        tags = [t for t, _ in self.stack]
        if 'title' in tags: self.title.append(data)
        if self.stack and not self.stack[-1][1]:
            if 'h1' in tags: self.h1.append(data)
            if 'main' in tags: self.main.append(data)
            if self.paragraph is not None: self.paragraph.append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self.schema_buffer is not None:
            try: self.schema.append(json.loads(self.schema_buffer))
            except json.JSONDecodeError as exc: self.schema_errors.append(str(exc))
            self.schema_buffer = None
        if tag == 'p' and self.paragraph is not None:
            text = normalized(' '.join(self.paragraph))
            if text: self.paragraphs.append(text)
            self.paragraph = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    @property
    def noindex(self):
        return any('noindex' in self.meta.get(key, '').lower() for key in ('robots', 'googlebot'))

    def types(self):
        found = set()
        def walk(value):
            if isinstance(value, dict):
                types = value.get('@type', [])
                found.update([types] if isinstance(types, str) else types)
                for child in value.values(): walk(child)
            elif isinstance(value, list):
                for child in value: walk(child)
        for item in self.schema: walk(item)
        return sorted(found)


def route(file, public):
    name = '/' + file.relative_to(public).as_posix()
    return name[:-10] if name.endswith('index.html') else name


def audit(public, site):
    findings = []
    def add(level, code, paths, message):
        findings.append({'severity': level, 'code': code, 'paths': paths, 'message': message})
    docs = {route(f, public): Document(f.read_text(encoding='utf-8')) for f in sorted(public.rglob('*.html'))}
    if not docs: add('error', 'empty_site', [], 'No se encontraron páginas HTML.')
    try:
        sitemap = [node.text for node in ET.parse(public / 'sitemap.xml').iter() if node.tag.endswith('}loc') or node.tag == 'loc']
    except (OSError, ET.ParseError) as exc:
        sitemap = []; add('error', 'sitemap_unreadable', [], str(exc))
    site = site.rstrip('/')
    expected_host = urlsplit(site).netloc
    sitemap_routes = set()
    for loc in sitemap:
        u = urlsplit(loc)
        if u.scheme != 'https' or u.netloc != expected_host or u.query or u.fragment:
            add('error', 'sitemap_url', [loc], 'URL de sitemap fuera del origen canónico o con parámetros.')
        else: sitemap_routes.add(unquote(u.path))
    if len(sitemap) != len(set(sitemap)): add('error', 'sitemap_duplicate', [], 'El sitemap repite URLs.')
    robot = RobotFileParser()
    robots_file = public / 'robots.txt'
    if robots_file.exists(): robot.parse(robots_file.read_text().splitlines())
    else: robot.parse([]); add('warning', 'robots_missing', [], 'Falta robots.txt local.')
    redirects = {}
    redir_file = public / '_redirects'
    if redir_file.exists():
        for line in redir_file.read_text().splitlines():
            fields = line.split()
            if len(fields) >= 3 and fields[2] in {'301', '302', '307', '308'} and '*' not in fields[0]: redirects[fields[0]] = fields[1]
    def target(base, href):
        u = urlsplit(urljoin(site + base, href))
        if u.netloc != expected_host or u.scheme not in {'http', 'https'}: return None
        path = unquote(u.path)
        visited = set()
        while path in redirects and path not in visited:
            visited.add(path); dest = urlsplit(urljoin(site + path, redirects[path]))
            if dest.netloc != expected_host: return None
            path = unquote(dest.path)
        if path in docs: return path
        if path + '/' in docs: return path + '/'
        return None
    graph = {path: set(filter(None, (target(path, href) for href in d.links))) - {path} for path, d in docs.items()}
    distance = {'/': 0}; queue = deque(['/'])
    while queue:
        current = queue.popleft()
        for dest in sorted(graph.get(current, ())):
            if dest not in distance: distance[dest] = distance[current] + 1; queue.append(dest)
    indexable = {p: d for p, d in docs.items() if not d.noindex}
    for path in sorted(sitemap_routes):
        d = docs.get(path)
        if not d: add('error', 'sitemap_missing_file', [path], 'No existe HTML local para la URL del sitemap.'); continue
        if d.noindex: add('error', 'sitemap_noindex', [path], 'Una página noindex figura en el sitemap.')
        if not robot.can_fetch('Googlebot', site + path): add('error', 'sitemap_blocked', [path], 'robots.txt bloquea esta URL del sitemap a Googlebot.')
        if path not in distance: add('warning', 'orphan', [path], 'Sin recorrido por enlaces HTML desde inicio; el sitemap solo no reemplaza la navegación.')
        elif distance[path] > 3: add('warning', 'deep_path', [path], f'A {distance[path]} clics HTML de inicio. Revisar acceso si es una prioridad comercial.')
    for path, d in indexable.items():
        if path not in sitemap_routes: add('warning', 'outside_sitemap', [path], 'HTML sin noindex fuera del sitemap; confirmar si debe ser público/indexable.')
        if not d.has_main: add('warning', 'main_missing', [path], 'No se identificó el contenido principal con <main>.')
        if not d.lang.lower().startswith('es'): add('warning', 'language', [path], 'Falta lang español en el documento.')
        if not normalized(' '.join(d.title)): add('error', 'title_empty', [path], 'Título vacío.')
        if len(d.canon) != 1 or d.canon[0] != site + path: add('error', 'canonical', [path], 'Canonical ausente, duplicado o distinto de esta URL canónica.')
        if d.meta.get('og:url') != site + path: add('warning', 'og_url', [path], 'Open Graph no identifica la misma URL canónica.')
        for error in d.schema_errors: add('error', 'schema_parse', [path], error)
        if path.startswith('/recursos/') and path != '/recursos/' and not {'Article', 'BlogPosting'} & set(d.types()):
            add('notice', 'article_schema', [path], 'Guía sin Article/BlogPosting; considerar autor y fechas reales, sin prometer resultado enriquecido.')
        if any('alt' not in a for a in d.images): add('warning', 'image_alt', [path], 'Hay imágenes sin atributo alt. Los decorativos pueden tener alt vacío.')
        if any(not a.get('title') for a in d.frames): add('warning', 'iframe_title', [path], 'Hay demos incrustadas sin título accesible.')
    for field, value in [('title', lambda d: normalized(' '.join(d.title)).casefold()), ('description', lambda d: normalized(d.meta.get('description', '')).casefold()), ('h1', lambda d: normalized(' '.join(d.h1)).casefold())]:
        groups = defaultdict(list)
        for path, d in indexable.items():
            if value(d): groups[value(d)].append(path)
        for paths in groups.values():
            if len(paths) > 1: add('warning', field + '_duplicate', paths, f'{field} idéntico entre páginas; revisar si responden una intención distinta.')
    # Remove repeated site-wide paragraphs before comparing useful main content.
    counts = defaultdict(int)
    for d in indexable.values():
        for paragraph in set(d.paragraphs): counts[paragraph] += 1
    shingles = {}
    for path, d in indexable.items():
        words = re.findall(r'\w+', ' '.join(p for p in d.paragraphs if counts[p] < 3).casefold())
        if len(words) >= 60: shingles[path] = {tuple(words[i:i+5]) for i in range(len(words)-4)}
    paths = sorted(shingles)
    for i, left in enumerate(paths):
        for right in paths[i+1:]:
            a, b = shingles[left], shingles[right]
            ratio = len(a & b) / len(a | b)
            if ratio >= .65: add('warning', 'similar_content', [left, right], f'{ratio:.0%} de similitud por secuencias de 5 palabras; revisión editorial, no diagnóstico de penalización.')
    findings.sort(key=lambda x: ({'error':0, 'warning':1, 'notice':2}[x['severity']], x['code'], x['paths']))
    return {'generated_at': datetime.now(timezone.utc).isoformat(), 'scope': 'HTML local; no verifica HTTP, rendimiento, indexación ni ranking reales', 'site': site, 'public': str(public), 'counts': {'html':len(docs), 'indexable_html':len(indexable), 'sitemap_urls':len(sitemap), **{level:sum(f['severity']==level for f in findings) for level in ['error','warning','notice']}}, 'findings': findings, 'pages': [{'path':p, 'title':normalized(' '.join(d.title)), 'noindex':d.noindex, 'in_sitemap':p in sitemap_routes, 'click_depth':distance.get(p), 'incoming_pages':sum(p in links for links in graph.values()), 'schema_types':d.types()} for p,d in sorted(docs.items())]}


def markdown(report):
    c = report['counts']
    lines = ['# Auditoría SEO local de IMAN', '', report['scope'] + '.', '', f"Generada: {report['generated_at']}", '', f"{c['html']} HTML · {c['sitemap_urls']} URLs en sitemap · {c['error']} errores · {c['warning']} advertencias · {c['notice']} observaciones.", '', '## Hallazgos', '']
    for f in report['findings']:
        lines.append(f"- **{f['severity']} · {f['code']}** — {', '.join(f['paths']) or 'sitio'}: {f['message']}")
    if not report['findings']: lines.append('Sin hallazgos en los controles implementados.')
    lines += ['', '## Cobertura de URLs', '', '| URL | Sitemap | Clics desde inicio | Páginas que enlazan |', '| --- | --- | --- | --- |']
    for p in report['pages']:
        if p['noindex']: continue
        lines.append(f"| {p['path']} | {'Sí' if p['in_sitemap'] else 'No'} | {p['click_depth'] if p['click_depth'] is not None else 'Sin recorrido'} | {p['incoming_pages']} |")
    lines += ['', '## Verificaciones que requieren el sitio publicado', '', 'HTTPS y redirecciones, encabezados robots efectivos, URLs indexadas, consultas y clics en Search Console, entrega del formulario, eventos con consentimiento y métricas móviles. Este informe no los certifica.', '', 'Las advertencias de similitud y profundidad son señales para revisar. No son factores mágicos ni reglas de penalización. No se evalúa calidad por cantidad de palabras.', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--public', type=Path, default=ROOT/'public')
    parser.add_argument('--out', type=Path, default=ROOT/'docs/seo')
    parser.add_argument('--site-url', default='https://www.iman.ar')
    args = parser.parse_args()
    report = audit(args.public.resolve(), args.site_url)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out/'audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    (args.out/'audit.md').write_text(markdown(report))
    print(json.dumps(report['counts'], ensure_ascii=False))
    print(f"Informe: {args.out/'audit.md'}")
    raise SystemExit(1 if report['counts']['error'] else 0)


if __name__ == '__main__': main()

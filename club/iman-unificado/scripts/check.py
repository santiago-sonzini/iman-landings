from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re, xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
class Document(HTMLParser):
    def __init__(self):
        super().__init__();self.h1=0;self.ids=[];self.links=[];self.canon=[];self.ld=[];self.schema=False;self.buf='';self.descriptions=0
    def handle_starttag(self,t,a):
        a=dict(a)
        if t=='h1':self.h1+=1
        if 'id' in a:self.ids.append(a['id'])
        if t in ['a','link'] and 'href' in a:self.links.append(a['href'])
        if t in ['script','img'] and 'src' in a:self.links.append(a['src'])
        if t=='link' and a.get('rel')=='canonical':self.canon.append(a['href'])
        if t=='meta' and a.get('name')=='description':self.descriptions+=1
        if t=='script' and a.get('type')=='application/ld+json':self.schema=True;self.buf=''
    def handle_data(self,s):
        if self.schema:self.buf+=s
    def handle_endtag(self,t):
        if t=='script' and self.schema:self.ld.append(json.loads(self.buf));self.schema=False

pages=json.loads((ROOT/'docs/pages.json').read_text())
redirects={x.split()[0]:x.split()[1] for x in (PUBLIC/'_redirects').read_text().splitlines()}
errors=[]; docs={}
for page in pages:
    path=page['path'];raw=(PUBLIC/page['file']).read_text();d=Document();d.feed(raw);docs[path]=d
    if d.h1!=1:errors.append(f'{path}: {d.h1} h1')
    if len(d.canon)!=1 or d.canon[0]!='https://www.iman.ar'+path:errors.append(f'{path}: canonical')
    if d.descriptions!=1:errors.append(f'{path}: description')
    if len(d.ids)!=len(set(d.ids)):errors.append(f'{path}: duplicate id')
    if not d.ld:errors.append(f'{path}: missing schema')
    if re.search('hermes|5493534797679|IMAN Club',raw,re.I):errors.append(f'{path}: stale brand or contact')
    for href in d.links:
        u=urlsplit(href)
        if u.scheme or u.netloc:continue
        target=u.path or path
        if target in redirects:target=urlsplit(redirects[target]).path
        f=PUBLIC/target.lstrip('/')
        if f.is_dir():f=f/'index.html'
        if not f.is_file():errors.append(f'{path}: broken {href}')
        elif u.fragment and f.suffix=='.html':
            target_doc=Document();target_doc.feed(f.read_text())
            if unquote(u.fragment) not in target_doc.ids:errors.append(f'{path}: missing anchor {href}')
    faq=next((s for s in d.ld[0]['@graph'] if s['@type']=='FAQPage'),None)
    if faq:
        for q in faq['mainEntity']:
            if q['name'] not in raw:errors.append(f'{path}: FAQ not visible')
sitemap=ET.parse(PUBLIC/'sitemap.xml')
assert len(sitemap.getroot())==len(pages)
assert 'noindex,follow' in (PUBLIC/'automatizaciones/compras-demo/index.html').read_text()
assert (PUBLIC/'assets/og.png').stat().st_size>1000
assert not list(PUBLIC.rglob('.env*'))
report={'pages':len(pages),'errors':errors,'checks':['single h1','unique canonical','description','JSON-LD parse','visible FAQ questions','internal files and anchors','legacy contact/brand','sitemap','demo noindex','Open Graph image','no env files']}
(ROOT/'docs/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))

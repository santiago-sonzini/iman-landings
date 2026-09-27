"""Validate IMAN editorial data and expose published articles to the static build.

No network calls, scheduler or publishing side effects. Drafts are validated but
excluded by default. `known_paths` should contain the current site's routes; the
previous build manifest is used when the caller does not provide them.
"""
from __future__ import annotations

import argparse
from datetime import date, datetime, timezone
from email.utils import format_datetime
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONTENT = ROOT / 'content' / 'articles.json'
SERVICES = {'IMAN Fidelización', 'IMAN Comercios', 'IMAN Automatizaciones', 'IMAN Turnos'}
ALLOWED_TAGS = {'h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote',
                'table', 'caption', 'thead', 'tbody', 'tr', 'th', 'td', 'br',
                'figure', 'figcaption', 'img', 'div', 'span'}
VOID_TAGS = {'br', 'img'}
ALLOWED_ATTRS = {'id', 'class', 'href', 'title', 'scope', 'colspan', 'rowspan',
                 'src', 'alt', 'width', 'height', 'loading'}


class ContentValidationError(ValueError):
    """The editorial source cannot be safely included in a build."""


def _route(value: str) -> str:
    path = urlsplit(value).path
    return path if path == '/' else path.rstrip('/') + '/'


def _https_url(value: str) -> bool:
    try:
        parsed = urlsplit(value)
        return (parsed.scheme == 'https' and bool(parsed.hostname)
                and not parsed.username and not parsed.password
                and not any(ch.isspace() for ch in value))
    except ValueError:
        return False


class _Fragment(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.errors, self.stack, self.text, self.links, self.ids, self.images = [], [], [], [], set(), []
        self.headings = 0

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED_TAGS:
            self.errors.append(f'HTML tag not allowed: {tag}')
        if tag not in VOID_TAGS:
            self.stack.append(tag)
        if tag == 'h2':
            self.headings += 1
        names = [name for name, _ in attrs]
        if len(names) != len(set(names)):
            self.errors.append(f'duplicate attributes on {tag}')
        values = dict(attrs)
        for name, value in attrs:
            if name not in ALLOWED_ATTRS:
                self.errors.append(f'HTML attribute not allowed: {name}')
            if value is None or any(ord(char) < 32 for char in value):
                self.errors.append(f'invalid HTML attribute: {name}')
        if 'id' in values:
            identity = values['id'] or ''
            if not re.fullmatch(r'[a-z][a-z0-9-]*', identity) or identity in self.ids:
                self.errors.append(f'invalid or duplicate element id: {identity}')
            self.ids.add(identity)
        if tag == 'a':
            href = values.get('href', '')
            if not href or (not href.startswith(('/', '#')) and not _https_url(href)) or href.startswith('//'):
                self.errors.append(f'unsafe or missing link: {href}')
            else:
                self.links.append(href)
        if tag == 'img':
            src = values.get('src', '')
            if not src.startswith('/assets/') or '..' in src or not values.get('alt', '').strip():
                self.errors.append('images need a local /assets/ source and meaningful alt text')
            else:
                self.images.append(src)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in VOID_TAGS or not self.stack or self.stack[-1] != tag:
            self.errors.append(f'unbalanced closing tag: {tag}')
        else:
            self.stack.pop()

    def handle_data(self, value):
        self.text.append(value)

    def handle_decl(self, decl):
        self.errors.append('HTML declarations are not allowed in article fragments')


def load_articles(content_path=None, *, known_paths=None, include_drafts=False, today=None):
    """Return independent, validated article dictionaries; published only by default.

    Adds `path`, `wordCount` and `readingMinutes`. `today` accepts a date or ISO
    date string for deterministic validation. All records require metadata;
    draft bodies may be empty while an outline is being prepared.
    """
    source = Path(content_path) if content_path else DEFAULT_CONTENT
    try:
        data = json.loads(source.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as exc:
        raise ContentValidationError(f'Cannot read editorial source {source}: {exc}') from exc
    if not isinstance(data, dict) or data.get('version') != 1 or not isinstance(data.get('articles'), list):
        raise ContentValidationError('Expected {"version": 1, "articles": [...]}')
    if today is None:
        today = date.today()
    elif isinstance(today, str):
        today = date.fromisoformat(today)
    if known_paths is None:
        manifest = ROOT / 'docs' / 'pages.json'
        known_paths = {item['path'] for item in json.loads(manifest.read_text())} if manifest.exists() else set()
        # Public noindex examples remain valid link targets even though the
        # indexable-page manifest intentionally excludes them.
        known_paths |= {'/' + str(path.parent.relative_to(ROOT / 'public')).strip('./') + '/'
                        for path in (ROOT / 'public').rglob('index.html')
                        if path.parent != ROOT / 'public'}
        if (ROOT / 'public' / 'index.html').is_file():
            known_paths.add('/')
    routes = {_route(path) for path in known_paths}
    article_routes = {
        f"/recursos/{item.get('slug')}/" for item in data['articles']
        if isinstance(item, dict) and item.get('status') == 'published'
    }
    routes |= article_routes
    errors, result, slugs, titles = [], [], set(), set()
    for index, raw in enumerate(data['articles']):
        prefix = f'article[{index}]'
        if not isinstance(raw, dict):
            errors.append(f'{prefix}: must be an object')
            continue
        article = dict(raw)
        local = []
        required = ['status', 'slug', 'title', 'description', 'category', 'contactService',
                    'datePublished', 'dateModified', 'html', 'relatedpath']
        for key in required:
            if not isinstance(article.get(key), str) or (key != 'html' and not article[key].strip()):
                local.append(f'missing or invalid {key}')
        if local:
            errors.extend(f'{prefix}: {error}' for error in local)
            continue
        prefix = article['slug']
        if article['status'] not in {'published', 'draft'}:
            local.append('status must be published or draft')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', article['slug']):
            local.append('slug must use lowercase letters, digits and single hyphens')
        if article['slug'] in slugs:
            local.append('duplicate slug')
        slugs.add(article['slug'])
        title_key = re.sub(r'\W+', ' ', unicodedata.normalize('NFKC', article['title']).casefold()).strip()
        if title_key in titles:
            local.append('duplicate title')
        titles.add(title_key)
        if not 15 <= len(article['title']) <= 150 or '<' in article['title']:
            local.append('title must be plain text between 15 and 150 characters')
        if not 60 <= len(article['description']) <= 200 or '<' in article['description']:
            local.append('description must be plain text between 60 and 200 characters')
        if article['contactService'] not in SERVICES:
            local.append('unknown contactService')
        try:
            if not all(re.fullmatch(r'\d{4}-\d{2}-\d{2}', article[key]) for key in ['datePublished', 'dateModified']):
                raise ValueError('ISO date required')
            published = date.fromisoformat(article['datePublished'])
            modified = date.fromisoformat(article['dateModified'])
            if modified < published:
                local.append('dateModified precedes datePublished')
            if article['status'] == 'published' and (published > today or modified > today):
                local.append('published articles cannot have future dates')
        except ValueError:
            local.append('dates must be valid ISO YYYY-MM-DD dates')
        sources = article.get('sources')
        if not isinstance(sources, list):
            local.append('sources must be a list, even for original editorial guidance')
            sources = []
        source_urls = set()
        for source_ref in sources:
            if (not isinstance(source_ref, dict) or not isinstance(source_ref.get('title'), str)
                    or not source_ref['title'].strip() or not isinstance(source_ref.get('url'), str)
                    or not _https_url(source_ref['url'])):
                local.append('each source requires a title and an HTTPS URL')
            else:
                source_urls.add(source_ref['url'])
        fragment = _Fragment()
        fragment.feed(article['html'])
        fragment.close()
        local.extend(fragment.errors)
        if fragment.stack:
            local.append('unclosed HTML tags: ' + ', '.join(fragment.stack))
        plain_text = ' '.join(fragment.text)
        words = len(re.findall(r'\b[\wÀ-ÿ]+\b', plain_text))
        if article['status'] == 'published' and (words < 250 or fragment.headings < 2):
            local.append('published article needs substantial body text and at least two h2 headings')
        links = fragment.links + [article['relatedpath']]
        if not article['relatedpath'].startswith('/') or article['relatedpath'].startswith('//'):
            local.append('relatedpath must be an internal route')
        for href in links:
            if href.startswith('#') and href[1:] not in fragment.ids:
                local.append(f'unknown article anchor: {href}')
            elif href.startswith('/') and _route(href) not in routes:
                local.append(f'unknown internal route: {href}')
        for source_url in source_urls:
            if source_url not in fragment.links:
                local.append(f'source must be linked near the supported statement: {source_url}')
        for image in fragment.images:
            if not (ROOT / 'public' / image.lstrip('/')).is_file() and not (ROOT / image.lstrip('/')).is_file():
                local.append(f'missing article image: {image}')
        errors.extend(f'{prefix}: {error}' for error in local)
        article.update(path=f"/recursos/{article['slug']}/", wordCount=words, readingMinutes=max(1, (words + 199) // 200))
        result.append(article)
    if errors:
        raise ContentValidationError('\n'.join(errors))
    return [article for article in result if include_drafts or article['status'] == 'published']


def build_rss(articles, site_url='https://www.iman.ar'):
    """Produce RSS 2.0 for validated published records; no draft content leaks."""
    if not _https_url(site_url):
        raise ContentValidationError('RSS site_url must be HTTPS')
    site_url = site_url.rstrip('/')
    rss = ET.Element('rss', version='2.0')
    channel = ET.SubElement(rss, 'channel')
    for name, value in [('title', 'Ideas para tu negocio | IMAN'), ('link', site_url + '/recursos/'),
                        ('description', 'Guías de fidelización, catálogos y automatización para negocios.'), ('language', 'es-AR')]:
        ET.SubElement(channel, name).text = value
    published = sorted((article for article in articles if article['status'] == 'published'), key=lambda item: (item['datePublished'], item['slug']), reverse=True)
    for article in published:
        item = ET.SubElement(channel, 'item')
        url = site_url + article['path']
        for name, value in [('title', article['title']), ('link', url), ('description', article['description']), ('category', article['category'])]:
            ET.SubElement(item, name).text = value
        ET.SubElement(item, 'guid', isPermaLink='true').text = url
        ET.SubElement(item, 'pubDate').text = format_datetime(datetime.fromisoformat(article['datePublished']).replace(tzinfo=timezone.utc), usegmt=True)
    if published:
        latest = max(article['dateModified'] for article in published)
        ET.SubElement(channel, 'lastBuildDate').text = format_datetime(datetime.fromisoformat(latest).replace(tzinfo=timezone.utc), usegmt=True)
    ET.indent(rss, space='  ')
    return ET.tostring(rss, encoding='unicode', xml_declaration=True) + '\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=DEFAULT_CONTENT)
    parser.add_argument('--include-drafts', action='store_true')
    parser.add_argument('--rss', type=Path, help='Optionally write a feed after successful validation')
    args = parser.parse_args()
    try:
        articles = load_articles(args.source, include_drafts=args.include_drafts)
        if args.rss:
            args.rss.write_text(build_rss(articles), encoding='utf-8')
        print(json.dumps({'validated': len(articles), 'articles': [{key: article[key] for key in ['path', 'status', 'wordCount', 'readingMinutes']} for article in articles]}, ensure_ascii=False, indent=2))
    except ContentValidationError as exc:
        parser.exit(1, str(exc) + '\n')

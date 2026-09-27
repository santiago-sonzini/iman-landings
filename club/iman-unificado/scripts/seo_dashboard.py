#!/usr/bin/env python3
"""Build a standalone, offline IMAN SEO dashboard. Never publishes or calls APIs."""
import argparse
import csv
from datetime import datetime, timezone
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HTML = r'''<!doctype html>
<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; img-src data:; base-uri 'none'; form-action 'none'"><title>IMAN · Panel SEO local</title>
<style>
:root{--ink:#171726;--muted:#616176;--violet:#4f46f5;--line:#e4e4ef;--surface:#f4f4fc;--white:#fff}*{box-sizing:border-box}body{margin:0;background:var(--surface);color:var(--ink);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:1280px;margin:auto;padding:38px 28px 70px}header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:34px}.brand{font-size:30px;font-weight:850;letter-spacing:-1.8px;color:var(--violet)}.eyebrow{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--violet);font-weight:750}h1{font-size:clamp(34px,5vw,57px);letter-spacing:-2px;line-height:1.06;margin:14px 0}h2{font-size:23px;letter-spacing:-.6px;margin:0 0 8px}h3{font-size:17px;margin:0 0 8px}p{margin:8px 0;color:var(--muted)}a{color:var(--violet)}button,.button{cursor:pointer;display:inline-block;padding:11px 17px;border:1px solid var(--line);border-radius:9px;background:white;color:var(--ink);font-family:inherit;font-size:14px;font-weight:650;line-height:1.25;text-decoration:none}button.primary{background:var(--violet);color:white;border-color:var(--violet)}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #252099;outline-offset:3px}.pill{display:inline-block;padding:5px 10px;border-radius:99px;background:#e9e7ff;color:#352bb4;font-size:12px;font-weight:700}.card{background:var(--white);border:1px solid var(--line);border-radius:17px;padding:24px;margin-bottom:22px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.metric{padding:20px;border:1px solid var(--line);border-radius:13px;background:#fff}.metric strong{font-size:31px;letter-spacing:-1px;display:block;line-height:1.3;margin:7px 0}.metric span{color:var(--muted);font-size:13px}.row{display:flex;align-items:center;flex-wrap:wrap;gap:12px}.space{justify-content:space-between}.subtle{font-size:13px;color:var(--muted)}.empty{padding:24px;border:1px dashed #cac6eb;border-radius:12px;background:#faf9ff}.status{min-height:24px;color:#343158;font-size:13px;margin-top:10px}.error{color:#a62a37}.table-wrap{overflow:auto;margin-top:20px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:13px 12px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}th{font-size:11px;letter-spacing:.055em;text-transform:uppercase;color:var(--muted);background:#f8f8fd}td:first-child{min-width:200px}td.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}code{font-size:12px;overflow-wrap:anywhere}input[type=search],select{border:1px solid #cbcbdb;background:#fff;border-radius:8px;padding:10px 12px;font:inherit;max-width:100%}input[type=file]{max-width:100%;font:inherit;font-size:13px}.two{display:grid;grid-template-columns:1.2fr 1fr;gap:22px}.timeline{list-style:none;margin:15px 0 0;padding:0}.timeline li{border-left:2px solid #d8d4fc;padding:0 0 20px 18px}.timeline strong{display:block}.timeline span{font-size:12px;color:var(--violet);font-weight:700}.muted-link{font-size:13px}.good{color:#27624a}.warning{color:#835f17}.notice{background:#f0efff;padding:13px 16px;border-radius:10px;margin-top:16px;font-size:13px}.dim{color:var(--muted)}footer{font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:22px}.hidden{display:none}@media(max-width:760px){main{padding:24px 16px 48px}header{display:block}header .pill{margin-top:15px}.grid{grid-template-columns:repeat(2,1fr)}.two{grid-template-columns:1fr}.card{padding:19px}h1{letter-spacing:-1.3px}.metric strong{font-size:27px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style></head><body><main>
<header><div><div class="brand">IMAN.</div><p class="eyebrow">Adquisición · Contenido · Control</p><h1>Del contenido<br>a la consulta.</h1><p>Tu auditoría, tus prioridades y los datos que realmente tenés.</p></div><div><span class="pill">Panel local · sin conexión a APIs</span><p id="generated" class="subtle"></p></div></header>
<section class="card" aria-labelledby="import-title"><div class="row space"><div><h2 id="import-title">Search Console</h2><p id="connection">Consultá el estado de verificación y los datos importados en este panel local.</p><p id="verification-date" class="subtle"></p></div><button id="export" type="button">Descargar informe JSON</button></div><p id="data-context" class="notice hidden"></p><div class="notice">Los CSV se procesan en este archivo, sin subirlos a ningún servidor. Importar datos no verifica la propiedad ni conecta una cuenta. La importación en pantalla se borra al recargar; el JSON permite conservar el informe.</div><div class="row" style="margin-top:18px"><label for="import-kind">Tipo</label><select id="import-kind"><option value="auto">Detectar columnas</option><option value="queries">Consultas</option><option value="pages">Páginas</option></select><label for="csv">Importar CSV de rendimiento</label><input id="csv" type="file" accept=".csv,text/csv" multiple><button id="clear" type="button">Quitar datos</button></div><p class="subtle">Columnas: consulta/query o página/page/URL; clics/clicks; impresiones/impressions; CTR y posición/position opcionales. Acepta comas, punto y coma, tabuladores, BOM y decimales locales. Cada importación reemplaza la vista del mismo tipo; no acumula períodos.</p><p id="import-status" class="status" role="status" aria-live="polite"></p></section>
<section aria-label="Métricas de la exportación"><div class="row space" style="margin:0 0 14px"><h2>Rendimiento observado</h2><div><label for="dataset">Vista </label><select id="dataset"><option value="queries">Consultas</option><option value="pages">Páginas</option></select></div></div><div class="grid" id="metrics"></div><p id="metric-note" class="subtle" style="margin:12px 0 25px"></p></section>
<section class="card" aria-labelledby="priorities-title"><div class="row space"><div><h2 id="priorities-title">Dónde revisar primero</h2><p>Impresiones de mayor a menor; a igualdad, CTR de menor a mayor. Es una lista de revisión, no una predicción de crecimiento.</p></div><label>Filtrar <input id="search" type="search" placeholder="Consulta o URL"></label></div><div id="performance"></div></section>
<div class="two"><section class="card" aria-labelledby="audit-title"><h2 id="audit-title">Salud del sitio local</h2><p id="audit-summary"></p><div id="audit-findings"></div><p class="subtle">La auditoría del HTML no confirma HTTPS, indexación, rendimiento móvil, correos ni conversiones en producción.</p><a class="muted-link" href="audit.md">Abrir auditoría completa</a></section><section class="card" aria-labelledby="calendar-title"><h2 id="calendar-title">Próximos 30 días</h2><p>Seguimiento diario en Codex a las 09:00: IMAN · SEO y conversión. El panel local no publica contenido ni se conecta a la API. La tarea de Codex aplica las validaciones y puede publicar hasta una guía por ejecución, sin cumplir una cuota.</p><ol class="timeline"><li><span>Días 1–3</span><strong>Verificar y medir</strong>Dominio, sitemap, formulario y línea base.</li><li><span>Días 4–14</span><strong>Resolver las preguntas de compra</strong>Wallet y email; pedidos; comparación de proveedores.</li><li><span>Días 15–23</span><strong>Profundizar con evidencia propia</strong>Mejorar guías y documentar una demo o caso autorizado.</li><li><span>Días 24–30</span><strong>Conectar y revisar</strong>Enlaces, consultas calificadas y siguiente prioridad.</li></ol><a class="muted-link" href="plan-editorial.md">Abrir briefs y calendario</a></section></div>
<section class="card" aria-labelledby="content-title"><h2 id="content-title">Contenido preparado</h2><p>Estado del archivo editorial y presencia en la compilación auditada. No certifica publicación remota.</p><div id="articles" class="table-wrap"></div></section>
<section class="card" aria-labelledby="backlog-title"><h2 id="backlog-title">Mapa de oportunidades</h2><p>Hipótesis basadas en los servicios de IMAN. Sin volumen, dificultad ni posición inventados.</p><div id="backlog" class="table-wrap"></div><a class="muted-link" href="keyword-map.csv">Abrir mapa CSV</a></section>
<footer>Este panel no hace solicitudes de red ni envíos. No garantiza ranking ni ventas. Los totales corresponden a las filas importadas: consultas y páginas son vistas distintas, nunca se suman entre sí. <a href="medicion.md">Criterios de medición</a>.</footer>
</main><script>
const initial = __DATA__;

function norm(value){return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');}
function splitCSV(text,delimiter){
  const rows=[];let row=[],cell='',quoted=false;
  text=String(text).replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||cell===''){quoted=!quoted;}else{cell+=c;}}
    else if(c===delimiter&&!quoted){row.push(cell);cell='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(quoted)throw new Error('CSV incompleto: quedó una comilla abierta.');
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
function parseCSV(text){
  const candidates=[',',';','\t'].map(delimiter=>({delimiter,header:splitCSV(text.split(/\r?\n/)[0],delimiter)[0]||[]}));
  candidates.sort((a,b)=>b.header.length-a.header.length);
  return splitCSV(text,candidates[0].delimiter);
}
function number(value,integer=false){
  let s=String(value??'').trim().replace(/[\s\u00a0\u202f]/g,'');
  if(!s||s==='-'||s==='—')return null;
  if(integer){if(!/^\d+(?:[.,]\d{3})*$/.test(s))return /^\d+$/.test(s)?Number(s):null;s=s.replace(/[.,]/g,'');}
  else{if(s.includes(',')&&s.includes('.')){const decimal=s.lastIndexOf(',')>s.lastIndexOf('.')?',':'.';s=s.replace(decimal===','?/\./g:/,/g,'').replace(',','.');}else s=s.replace(',','.');}
  if(!/^\d+(\.\d+)?$/.test(s))return null;const n=Number(s);return Number.isFinite(n)?n:null;
}
function ingest(text,kind='auto',name='CSV importado'){
  const matrix=parseCSV(text);if(matrix.length<2)throw new Error('El CSV no tiene filas de datos.');
  const headers=matrix[0].map(norm);
  const find=aliases=>headers.findIndex(h=>aliases.includes(h));
  const qi=find(['consulta','consultas','consultas principales','query','queries','top queries']);
  const pi=find(['pagina','paginas','paginas principales','page','pages','top pages','url','page url']);
  const ci=find(['clics','clicks']);const ii=find(['impresiones','impressions']);const pos=find(['posicion','posicion media','position','average position']);const ctr=find(['ctr','ctr medio','average ctr']);
  if(kind==='auto')kind=qi>=0?'queries':pi>=0?'pages':'';
  const key=kind==='queries'?qi:kind==='pages'?pi:-1;
  if(key<0||ci<0||ii<0)throw new Error('Faltan columnas reconocibles: consulta o página, clics e impresiones.');
  const groups=new Map();let rejected=0,ctrDifferences=0;
  for(const line of matrix.slice(1)){
    const label=(line[key]||'').trim(),clicks=number(line[ci],true),impressions=number(line[ii],true),rawPosition=pos>=0?number(line[pos]):null,position=rawPosition===0&&impressions===0?null:rawPosition;
    if(!label||clicks===null||impressions===null||clicks>impressions||(!impressions&&clicks)||position!==null&&position<1){rejected++;continue;}
    if(ctr>=0&&impressions){const raw=String(line[ctr]||''),parsed=number(raw.replace('%',''));const rate=parsed===null?null:raw.includes('%')?parsed/100:parsed>1?parsed/100:parsed;if(rate!==null&&Math.abs(rate-clicks/impressions)>.005)ctrDifferences++;}
    const old=groups.get(label)||{label,clicks:0,impressions:0,positionWeight:0,positionImpressions:0};
    old.clicks+=clicks;old.impressions+=impressions;if(position!==null){old.positionWeight+=position*impressions;old.positionImpressions+=impressions;}groups.set(label,old);
  }
  const rows=[...groups.values()].map(r=>({label:r.label,clicks:r.clicks,impressions:r.impressions,ctr:r.impressions?r.clicks/r.impressions:null,position:r.positionImpressions?r.positionWeight/r.positionImpressions:null,positionImpressions:r.positionImpressions}));
  if(!rows.length)throw new Error('No quedaron filas válidas. Revisá separadores y números enteros de clics e impresiones.');
  return {kind,name,importedAt:new Date().toISOString(),rows,rejected,ctrDifferences,warning:qi>=0&&pi>=0?'El CSV contiene consultas y páginas: se agrupa por la dimensión elegida.':''};
}
function totals(data){
  if(!data)return null;const rows=data.rows;const clicks=rows.reduce((n,r)=>n+r.clicks,0),impressions=rows.reduce((n,r)=>n+r.impressions,0),weight=rows.reduce((n,r)=>n+(r.positionImpressions||0),0);
  return {clicks,impressions,ctr:impressions?clicks/impressions:null,position:weight?rows.reduce((n,r)=>n+(r.position||0)*(r.positionImpressions||0),0)/weight:null};
}
function connectionStatus(status,hasData){
  const property=status?.verification==='verified'?'Propiedad verificada: '+status.property+'.':'Propiedad pendiente de verificación.';
  return property+' Panel local sin conexión a la API de Search Console. '+(hasData?'Datos importados mediante CSV.':'Sin métricas importadas.');
}
globalThis.ImanSEO={parseCSV,ingest,totals,connectionStatus};

if(typeof document!=='undefined'){
  const state={queries:null,pages:null};
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>n==null?'—':new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(n);
  const pct=n=>n==null?'—':new Intl.NumberFormat('es-AR',{style:'percent',maximumFractionDigits:2}).format(n);
  const dec=n=>n==null?'—':new Intl.NumberFormat('es-AR',{maximumFractionDigits:2}).format(n);
  const stamp=value=>value?new Date(value).toLocaleString('es-AR'):'Sin fecha';
  const table=(heads,rows)=>'<table><thead><tr>'+heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>';
  const cell=(value,numeric=false)=>'<td'+(numeric?' class="num"':'')+'>'+esc(value)+'</td>';
  const status=(text,error=false)=>{$('import-status').textContent=text;$('import-status').classList.toggle('error',error);};
  function render(){
    const kind=$('dataset').value,data=state[kind],t=totals(data);
    $('connection').textContent=connectionStatus(initial.searchConsoleStatus,Boolean(state.queries||state.pages));
    $('verification-date').textContent=initial.searchConsoleStatus?.verification==='verified'?'Verificación confirmada: '+stamp(initial.searchConsoleStatus.verified_at)+'.':'';
    $('metrics').innerHTML=[['Clics',t?fmt(t.clicks):'—'],['Impresiones',t?fmt(t.impressions):'—'],['CTR calculado',t?pct(t.ctr):'—'],['Posición media ponderada',t?dec(t.position):'—']].map(([label,value])=>'<div class="metric"><span>'+label+'</span><strong>'+value+'</strong><span>'+(data?'Filas de esta exportación':'Sin datos importados')+'</span></div>').join('');
    $('metric-note').textContent=data?`${data.name} · ${data.rows.length} filas agrupadas · importado ${stamp(data.importedAt)}. CTR = clics / impresiones. Posición ponderada por impresiones disponibles. El total de consultas puede excluir consultas anónimas; no equivale al total de la propiedad.`:'Importá consultas o páginas para ver métricas reales. No se mezclan dimensiones ni períodos automáticamente.';
    if(!data){$('performance').innerHTML='<div class="empty" style="margin-top:20px"><h3>Todavía no hay una línea base.</h3><p>Exportá Consultas o Páginas desde Rendimiento en Search Console e importá el CSV. Usá un período definido y mantenelo igual al comparar.</p></div>';return;}
    const term=norm($('search').value);const rows=data.rows.filter(r=>norm(r.label).includes(term)).sort((a,b)=>b.impressions-a.impressions||(a.ctr??0)-(b.ctr??0));
    $('performance').innerHTML='<div class="table-wrap">'+table([kind==='queries'?'Consulta':'Página','Clics','Impresiones','CTR','Posición','Revisión sugerida'],rows.slice(0,250).map(r=>'<tr>'+cell(r.label)+cell(fmt(r.clicks),true)+cell(fmt(r.impressions),true)+cell(pct(r.ctr),true)+cell(dec(r.position),true)+cell(!r.impressions?'Sin impresiones en este período':r.position!==null&&r.position>20?'Revisar intención, contenido y descubrimiento':!r.clicks?'Revisar si título y respuesta coinciden con la consulta':'Contrastar relevancia y consultas calificadas')+'</tr>'))+'</div><p class="subtle">'+rows.length+' filas coinciden; se muestran hasta 250. El orden ayuda a revisar oportunidades, sin asumir un CTR ideal para cada posición.</p>';
  }
  $('generated').textContent='Compilado '+stamp(initial.generatedAt);
  if(initial.dataNote){$('data-context').textContent=initial.dataNote;$('data-context').classList.remove('hidden');}
  const audit=initial.audit,c=audit.counts||{};
  $('audit-summary').textContent=audit.generated_at?`${c.html??'—'} HTML · ${c.sitemap_urls??'—'} URLs en sitemap · ${c.error??'—'} errores · ${c.warning??'—'} advertencias. Revisado ${stamp(audit.generated_at)}.`:'Sin auditoría. Ejecutá scripts/seo_audit.py y volvé a generar este panel.';
  $('audit-findings').innerHTML=(audit.findings||[]).length?'<ul>'+(audit.findings||[]).map(f=>'<li><strong>'+esc(f.severity)+' · '+esc(f.code)+'</strong><br>'+esc(f.paths.join(', '))+': '+esc(f.message)+'</li>').join('')+'</ul>':audit.generated_at?'<p class="good">Sin hallazgos en los controles locales ejecutados.</p>':'';
  const built=new Set((audit.pages||[]).filter(p=>!p.noindex).map(p=>p.path));
  $('articles').innerHTML=initial.articles.length?table(['Artículo','Estado editorial','Compilación auditada','Última revisión'],initial.articles.map(a=>{const path=a.path||'/recursos/'+a.slug+'/';return '<tr>'+cell(a.title)+cell(a.status==='published'?'Marcado para publicar':a.status)+cell(built.has(path)?'Incluido en HTML local':'No incluido en la auditoría actual')+cell(a.dateModified||a.datePublished||'Sin fecha')+'</tr>';})):'<p class="empty">No hay artículos estructurados en el archivo editorial.</p>';
  $('backlog').innerHTML=table(['Prioridad','Consulta / intención','URL prevista','Estado','Evidencia y siguiente paso'],initial.keywords.sort((a,b)=>Number(a.prioridad)-Number(b.prioridad)).map(k=>'<tr>'+cell(k.prioridad)+cell(k.consulta_principal+' · '+k.intencion)+cell(k.url_destino)+cell(k.estado)+cell(k.prueba_necesaria+' → '+k.accion)+'</tr>'));
  const initialMessages=[];let initialErrors=false;for(const source of initial.csv){try{const result=ingest(source.text,source.kind,source.name);state[result.kind]=result;initialMessages.push(`${source.name}: ${result.rows.length} filas, ${result.rejected} descartadas, ${result.ctrDifferences} CTR con diferencias. ${result.warning}`);}catch(error){initialErrors=true;initialMessages.push(source.name+': '+error.message);}}if(initialMessages.length)status(initialMessages.join(' '),initialErrors);
  if(!state.queries&&state.pages)$('dataset').value='pages';
  $('csv').addEventListener('change',async event=>{
    const messages=[];let errors=false;
    for(const file of event.target.files){try{if(file.size>8*1024*1024)throw new Error('Límite local: 8 MB por CSV.');const result=ingest(await file.text(),$('import-kind').value,file.name);state[result.kind]=result;$('dataset').value=result.kind;messages.push(`${file.name}: ${result.rows.length} filas, ${result.rejected} descartadas${result.ctrDifferences?', '+result.ctrDifferences+' CTR distintos del cálculo por clics/impresiones':''}. ${result.warning}`);}catch(error){errors=true;messages.push(file.name+': '+error.message);}}
    status(messages.join(' '),errors);event.target.value='';render();
  });
  $('dataset').addEventListener('change',render);$('search').addEventListener('input',render);
  $('clear').addEventListener('click',()=>{state.queries=null;state.pages=null;status('Datos quitados de esta sesión.');render();});
  $('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({...initial,csv:undefined,searchConsole:state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='iman-seo-informe.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  render();
}
</script></body></html>'''


def load_json(path, default):
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else default


def load_search_console_status(path):
    status = load_json(path, {'verification':'pending', 'property':None, 'verified_at':None, 'evidence':None})
    if not isinstance(status, dict) or status.get('verification') not in {'pending', 'verified'}:
        raise ValueError('verification debe ser pending o verified')
    if status['verification'] == 'verified':
        for key in ['property', 'verified_at', 'evidence']:
            if not isinstance(status.get(key), str) or not status[key].strip():
                raise ValueError(f'El estado verified requiere {key} con evidencia confirmada')
        if datetime.fromisoformat(status['verified_at'].replace('Z', '+00:00')).utcoffset() is None:
            raise ValueError('verified_at debe incluir zona horaria')
    return {key:status.get(key) for key in ['verification','property','verified_at','evidence']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=ROOT/'docs/seo/dashboard.html')
    parser.add_argument('--queries', type=Path, help='Exportación CSV de Consultas, español o inglés')
    parser.add_argument('--pages', type=Path, help='Exportación CSV de Páginas, español o inglés')
    parser.add_argument('--search-console-status', type=Path, default=ROOT/'docs/seo/search-console-status.json', help='Estado de propiedad respaldado por evidencia; no contiene métricas')
    parser.add_argument('--data-note', default='', help='Contexto del período importado, visible en el panel; no crea métricas')
    args = parser.parse_args()
    try:
        search_status = load_search_console_status(args.search_console_status)
    except (ValueError, OSError) as error:
        parser.error(f'Estado de Search Console inválido: {error}')
    audit = load_json(ROOT/'docs/seo/audit.json', {})
    articles = load_json(ROOT/'content/articles.json', [])
    if isinstance(articles, dict): articles = articles.get('articles', [])
    # Do not embed full article HTML or unrelated editorial metadata.
    articles = [{k:a.get(k) for k in ['slug','path','title','status','datePublished','dateModified']} for a in articles]
    with (ROOT/'docs/seo/keyword-map.csv').open(encoding='utf-8-sig', newline='') as file:
        keywords = list(csv.DictReader(file))
    imports = []
    for kind, path in [('queries', args.queries), ('pages', args.pages)]:
        if path:
            if path.stat().st_size > 8*1024*1024: parser.error(f'{path.name}: CSV supera 8 MB')
            imports.append({'kind':kind, 'name':path.name, 'text':path.read_text(encoding='utf-8-sig')})
    data = {'generatedAt':datetime.now(timezone.utc).isoformat(), 'audit':audit, 'articles':articles, 'keywords':keywords, 'csv':imports, 'searchConsoleStatus':search_status, 'dataNote':args.data_note}
    safe_json = json.dumps(data, ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(HTML.replace('__DATA__', safe_json), encoding='utf-8')
    print(f'Panel local: {args.out}')
    print(f'{len(keywords)} prioridades · {len(articles)} artículos · {len(imports)} CSV incorporados. Sin solicitudes de red.')


if __name__ == '__main__': main()

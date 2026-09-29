// Local-only integration preview: same contact handler, SQLite persistence, captured mail.
// No network email transport or production credentials. Never bundled into public/.
import http from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {createContactHandler} from './contact.mjs';
import {escapeHTML as E} from './email.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const port=Number(process.env.IMAN_PREVIEW_PORT||8791), origin=`http://127.0.0.1:${port}`;
const mailbox=path.resolve(root,'../../tmp/editorial-mailbox');await mkdir(mailbox,{recursive:true});
const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
const db={prepare(sql){let values=[];const stmt={bind(...v){values=v;return stmt},async first(){return sqlite.prepare(sql).get(...values)||null},async run(){const r=sqlite.prepare(sql).run(...values);return {meta:{changes:Number(r.changes)}}}};return stmt},batch:items=>Promise.all(items.map(x=>x.run()))};
let scenario='success';let emails=[];let sends=0;
const handle=createContactHandler({sendMail:async message=>{sends++;await new Promise(resolve=>setTimeout(resolve,300));if(scenario==='failure'||(scenario==='partial'&&message.to!=='team@example.test'))throw Object.assign(new Error('test-only'),{code:'E_RECIPIENT_NOT_ALLOWED'});const id=emails.length;emails.push(message);await writeFile(path.join(mailbox,`email-${id}.html`),message.html);await writeFile(path.join(mailbox,`email-${id}.txt`),message.text);return {messageId:'local-'+id};}});
const env={CONTACT_DB:db,CONTACT_HASH_SECRET:'local-preview-not-a-secret-never-production',FROM_EMAIL:'hola@iman.ar',CONTACT_EMAIL:'team@example.test',EMAIL:{send(){}}};
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
const redirects=()=>new Map(readFileSync(path.join(root,'_redirects'),'utf8').trim().split('\n').map(line=>line.split(' ').slice(0,2)));
const banner='<aside class="preview-note" style="padding:5px 24px;font:10px/1.5 monospace;color:#aeb6aa;background:#202020;text-align:center">VISTA PREVIA LOCAL · Los envíos quedan en el <a href="/__preview/" style="color:#75cedd">buzón de prueba</a>. No se envían emails reales.</aside>';
http.createServer(async(req,res)=>{
  res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Cache-Control','no-store');
  try{
    const url=new URL(req.url,origin);
    if(url.pathname.startsWith('/__preview/')){
      if(req.method==='POST'&&url.pathname==='/__preview/scenario'){
        let body='';for await(const chunk of req)body+=chunk;
        const data=JSON.parse(body);if(!['success','failure','partial','unavailable','timeout'].includes(data.scenario)){res.writeHead(400);res.end();return;}
        scenario=data.scenario;if(data.reset){emails=[];sends=0;sqlite.exec('DELETE FROM contact_requests; DELETE FROM contact_rate_limits;');}
        res.setHeader('Content-Type','application/json');res.end(JSON.stringify({scenario}));return;
      }
      if(url.pathname==='/__preview/status'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({scenario,sends,emails:emails.map(({to,subject,text},id)=>({id,to,subject,text}))}));return;}
      const match=url.pathname.match(/^\/__preview\/mail\/(\d+)(\.txt)?$/);
      if(match&&emails[+match[1]]){res.setHeader('Content-Type',match[2]?'text/plain; charset=utf-8':'text/html; charset=utf-8');res.end(match[2]?emails[+match[1]].text:emails[+match[1]].html);return;}
      res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/editorial.css"><title>Buzón local de prueba | IMAN</title><main style="padding:40px"><p class="eyebrow">SOLO LOCAL / SIN ENVÍOS EXTERNOS</p><h1 style="font-size:70px;margin:24px 0">Buzón de prueba</h1><p>Escenario: ${scenario}. Mensajes capturados: ${emails.length}.</p><ul>${emails.map((mail,id)=>`<li><a href="/__preview/mail/${id}">${E(mail.subject)} — ${E(mail.to)}</a> · <a href="/__preview/mail/${id}.txt">Texto plano</a></li>`).join('')}</ul><a href="/">Volver a la experiencia</a></main></html>`);return;
    }
    if(url.pathname==='/api/contacto'){
      const chunks=[];for await(const chunk of req)chunks.push(chunk);
      if(scenario==='timeout'){req.socket.destroy();return;}
      const headers=new Headers(req.headers);headers.set('CF-Connecting-IP','127.0.0.1');
      const request=new Request(url,{method:req.method,headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});
      const response=await handle(request,scenario==='unavailable'?{}:env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:'Esta integración no se conecta a producción desde la vista previa.'}));return;}
    if(url.pathname==='/robots.txt'){res.setHeader('Content-Type','text/plain');res.end('User-agent: *\nDisallow: /\n');return;}
    const redirect=redirects().get(url.pathname);if(redirect){res.writeHead(301,{Location:redirect});res.end();return;}
    let pathname=decodeURIComponent(url.pathname);let file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
    let code=200;
    try{const s=await stat(file);if(s.isDirectory()){if(!pathname.endsWith('/')){res.writeHead(308,{Location:pathname+'/'+url.search});res.end();return;}file=path.join(file,'index.html');}await stat(file);}catch{file=path.join(root,'404.html');code=404;}
    let data=await readFile(file);
    if(file.endsWith('.html')){
      let html=data.toString().replace(/(<body[^>]*>)/,'$1'+banner);
      // Local browser fixtures exercise blocked clipboard, no-JS and reduced-motion paths.
      if(url.searchParams.get('test')==='clipboard') html=html.replace('<head>','<head><script>Object.defineProperty(navigator,"clipboard",{value:{writeText:()=>Promise.reject(new Error("Local test: denied"))}});</script>');
      if(url.searchParams.get('test')==='nojs')html=html.replace(/<script[^>]*src=[^>]*><\/script>/g,'');
      if(url.searchParams.get('test')==='reduced'){
        const css=await readFile(path.join(root,'assets/editorial.css'),'utf8');
        const rules=css.match(/@media\(prefers-reduced-motion:reduce\)\{([^\n]+)/)?.[1]?.slice(0,-1)||'';
        html=html.replace('<head>','<head><style>'+rules+'</style><script>const nativeMatch=window.matchMedia.bind(window);window.matchMedia=(q)=>q.includes("prefers-reduced-motion")?{matches:true,addEventListener(){}}:nativeMatch(q);</script>');
      }
      data=Buffer.from(html);
    }
    res.writeHead(code,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
  }catch(error){console.error('preview_request_failed');res.writeHead(500);res.end('Local preview error');}
}).listen(port,'127.0.0.1',()=>console.log(`IMAN preview ${origin} — local captured mail only`));

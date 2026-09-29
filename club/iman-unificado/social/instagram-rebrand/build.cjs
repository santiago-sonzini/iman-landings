const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const assets = path.resolve(root, '../../experience/assets');
const fontDisplay = fs.readFileSync(path.join(assets, 'playfair-display-sc.ttf')).toString('base64');
const fontBody = fs.readFileSync(path.join(assets, 'libre-baskerville-regular.ttf')).toString('base64');
const fontItalic = fs.readFileSync(path.join(assets, 'libre-baskerville-italic.ttf')).toString('base64');
const statue = fs.readFileSync(path.join(root, 'greek-ascii.png')).toString('base64');

const posts = [
  {
    id: '01-automatizaciones', label: 'WHATSAPP + IA', path: 'iman.ar/automatizaciones/',
    caption: 'Tu negocio, en movimiento.\n\nAtención y seguimiento por WhatsApp con IA, sin perder tu voz ni el control de tu equipo.\n\niman.ar/automatizaciones/\n\n#IMAN #Automatizacion #WhatsAppBusiness #IA #NegociosArgentina',
    slides: [
      { title: ['Tu negocio,', 'en movimiento.'], note: 'Tecnología que trabaja con vos.', cover: true, sculpture: true },
      { title: ['Tu WhatsApp,', 'en automático.'], note: 'Atendé, ordená y seguí cada consulta con IA.' },
      { title: ['La IA acompaña.', 'Tu equipo decide.'], note: 'Respuestas y seguimiento sin perder tu voz.' },
      { title: ['Hagamos lugar', 'para lo importante.'], note: 'Contanos qué querés automatizar.', cta: true },
    ],
  },
  {
    id: '02-fidelizacion', label: 'FIDELIZACIÓN', path: 'iman.ar/fidelizacion/',
    caption: 'Aumentá tus ventas sin invertir en publicidad.\n\nLa próxima oportunidad puede estar en alguien que ya te eligió. Fidelización y email marketing para que tus clientes vuelvan.\n\niman.ar/fidelizacion/\n\n#IMAN #Fidelizacion #EmailMarketing #PymesArgentina',
    slides: [
      { title: ['Aumentá tus ventas', 'sin invertir en', 'publicidad.'], note: 'Un vínculo bien cuidado también vende.', cover: true },
      { title: ['Ya te conocen.', 'Volvé a conectar.'], note: 'La siguiente venta no siempre empieza de cero.' },
      { title: ['El mensaje justo.', 'En el momento justo.'], note: 'Email y fidelización con intención, no ruido.' },
      { title: ['Hacé que', 'vuelvan.'], note: 'Diseñemos una estrategia para tu negocio.', cta: true },
    ],
  },
  {
    id: '03-mayoristas', label: 'CATÁLOGOS + ERP', path: 'iman.ar/comercios/',
    caption: 'Catálogo y gestión. Todo conectado.\n\nProductos, precios, pedidos y ERP en un flujo más claro para mayoristas. Menos carga manual para crecer.\n\nConocé la propuesta en iman.ar/comercios/\n\n#IMAN #Mayoristas #CatalogoDigital #ERP #Automatizacion',
    slides: [
      { title: ['Catálogo y gestión.', 'Todo conectado.'], note: 'Tu operación también puede fluir.', cover: true },
      { title: ['Un pedido entra.', 'Todo se ordena.'], note: 'Productos, precios y stock en una misma lógica.' },
      { title: ['Menos carga.', 'Más movimiento.'], note: 'Automatización real para equipos mayoristas.' },
      { title: ['Ordená hoy.', 'Crecé mañana.'], note: 'Contanos cómo funciona tu mayorista.', cta: true },
    ],
  },
];

function ornament() {
  return `<div class="rosette" aria-hidden="true"><div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div><div class="spoke s1"></div><div class="spoke s2"></div><div class="spoke s3"></div><div class="spoke s4"></div><span class="ascii">··· ✦ ···<br>· : * : ·<br>··· ✦ ···</span></div>`;
}

function html(post, slide, index) {
  const isLong = slide.title.join(' ').length > 37;
  return `<!doctype html><html lang="es"><meta charset="utf-8"><style>
    @font-face{font-family:Playfair;src:url(data:font/ttf;base64,${fontDisplay})}
    @font-face{font-family:Libre;src:url(data:font/ttf;base64,${fontBody})}
    @font-face{font-family:Libre;src:url(data:font/ttf;base64,${fontItalic});font-style:italic}
    *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden;background:#11141b}
    body{color:#eef0f4;font-family:Libre,Georgia,serif;-webkit-font-smoothing:antialiased}
    .page{position:relative;width:1080px;height:1350px;overflow:hidden;background:#11141b}
    .page::after{content:'';position:absolute;inset:0;pointer-events:none;opacity:.065;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath fill='%23fff' filter='url(%23n)' opacity='.5' d='M0 0h180v180H0z'/%3E%3C/svg%3E")}
    .statue{position:absolute;right:0;top:0;width:1080px;height:1350px;object-fit:cover;opacity:.78}
    .shade{position:absolute;inset:0;background:linear-gradient(90deg,#11141bf2 0%,#11141bbf 43%,#11141b12 80%)}
    .line-top,.line-bottom{position:absolute;left:75px;right:75px;height:1px;background:#94a4bc7a}
    .line-top{top:168px}.line-bottom{bottom:104px}
    .masthead{position:absolute;top:68px;left:75px;right:75px;display:flex;align-items:baseline;justify-content:space-between;z-index:2}
    .brand{font:60px/1 Playfair,Georgia,serif;letter-spacing:-.06em}
    .label{font:22px/1.4 Libre,Georgia,serif;letter-spacing:.1em;color:#aebbd0;text-transform:uppercase}
    .index{position:absolute;top:210px;left:75px;color:#94a4bc;font:23px/1.4 'Courier New',monospace;letter-spacing:.16em;z-index:2}
    .content{position:absolute;z-index:2;left:75px;right:75px;top:50%;transform:translateY(-50%);text-align:center}
    .cover .content{text-align:left;top:54%}.cover.sculpture .content{right:230px;top:52%}
    h1{margin:0;font:normal ${isLong?'79':'96'}px/1.12 Playfair,Georgia,serif;letter-spacing:-.055em;text-wrap:balance}
    h1 span{display:block}h1 span:last-child{font-style:normal}
    .cover h1{font-size:${isLong?'82':'104'}px;line-height:1.1}
    .note{margin:48px auto 0;max-width:760px;color:#b8c3d3;font:30px/1.58 Libre,Georgia,serif;text-wrap:balance}
    .cover .note{margin-left:0;max-width:610px}.cover.sculpture .note{max-width:540px}
    .footer{position:absolute;bottom:54px;left:75px;right:75px;display:flex;justify-content:space-between;align-items:center;color:#aebbd0;font:19px/1.4 'Courier New',monospace;letter-spacing:.12em;text-transform:uppercase;z-index:2}
    .url{font-family:Libre,Georgia,serif;letter-spacing:0;text-transform:none;font-size:23px}
    .cta-box{display:inline-flex;justify-content:center;align-items:center;margin-top:62px;min-width:350px;min-height:82px;padding:20px 32px;border:1px solid #94a4bc;color:#eef0f4;font:23px Libre,Georgia,serif}
    .rosette{position:absolute;width:710px;height:710px;right:-230px;top:315px;opacity:.38;z-index:1}
    .cover:not(.sculpture) .rosette{opacity:.62}.ring{position:absolute;border:1px solid #94a4bc;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%)}
    .r1{width:360px;height:360px}.r2{width:560px;height:560px}.r3{width:710px;height:710px}
    .spoke{position:absolute;left:50%;top:0;height:710px;width:1px;background:#94a4bc}.s2{transform:rotate(45deg)}.s3{transform:rotate(90deg)}.s4{transform:rotate(135deg)}
    .ascii{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;color:#94a4bc;font:35px/2 'Courier New',monospace;white-space:nowrap}
    .cta .rosette{right:-175px;top:320px;opacity:.22}.ad .content{top:51%}.ad.sculpture .content{right:170px}.ad .cta-box{margin-top:50px}
  </style><main class="page ${slide.cover?'cover':''} ${slide.sculpture?'sculpture':''} ${slide.cta?'cta':''}">
  ${slide.sculpture?`<img class="statue" src="data:image/png;base64,${statue}"><div class="shade"></div>`:ornament()}
  <div class="masthead"><div class="brand">IMÁN</div><div class="label">${post.label}</div></div><div class="line-top"></div>
  ${slide.ad?'':`<div class="index">${String(index+1).padStart(2,'0')} / 04</div>`}
  <div class="content"><h1>${slide.title.map(t=>`<span>${t}</span>`).join('')}</h1><p class="note">${slide.note}</p>${slide.cta?'<div class="cta-box">Hablemos</div>':''}</div>
  <div class="line-bottom"></div><div class="footer"><span>ESTUDIO IMÁN</span><span class="url">${slide.cta?post.path:'iman.ar'}</span></div>
  </main></html>`;
}

(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
  for(const post of posts){
    const dir=path.join(root,post.id);fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,'caption.txt'),post.caption+'\n');
    for(let i=0;i<post.slides.length;i++){
      await page.setContent(html(post,post.slides[i],i));
      await page.evaluate(()=>document.fonts.ready);
      const file=path.join(dir,`${String(i+1).padStart(2,'0')}.png`);
      await page.screenshot({path:file});console.log(file);
    }
  }
  const adDir=path.join(root,'ads');fs.mkdirSync(adDir,{recursive:true});
  await page.setContent(html(
    {label:'TECNOLOGÍA PARA NEGOCIOS',path:'iman.ar'},
    {title:['Se buscan negocios','que quieran avanzar.'],note:'Automatización, fidelización y sistemas para crecer.',cover:true,sculpture:true,cta:true,ad:true},0));
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(adDir,'02-se-buscan.png')});
  fs.copyFileSync(path.join(root,'02-fidelizacion','01.png'),path.join(adDir,'01-fidelizacion.png'));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

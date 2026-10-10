// Render the native V1 layouts without redrawing the original logo.
// Requires Playwright with Chromium: node scripts/render-brand-previews.cjs
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'variants/assets');
const data = (name, type) => `data:${type};base64,${fs.readFileSync(path.join(assets, name)).toString('base64')}`;
const logo = data('logo-v1.png', 'image/png');
const font = data('fonts/inter-latin.woff2', 'font/woff2');
const mono = data('fonts/geist-mono-latin.woff2', 'font/woff2');
const styles = `
  @font-face{font-family:Inter;src:url('${font}');font-weight:300 900}
  @font-face{font-family:Mono;src:url('${mono}');font-weight:400 600}
  *{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
  body{background:#121212;color:#f2f2f4;font-family:Inter,Arial,sans-serif;padding:58px 72px}
  header{height:117px;display:flex;align-items:flex-start;justify-content:space-between}
  .logo{display:block;width:230px;height:auto}
  .note{font:400 12px/1.7 Mono,monospace;color:#a9adb4;letter-spacing:.09em;padding-top:31px}
  h1{font-size:92px;font-weight:450;line-height:1.04;letter-spacing:-.07em;margin:35px 0 0}
  .accent{background:linear-gradient(108deg,#82c7d6 0%,#a5c4dd 24%,#b9a3ee 52%,#d7b9d1 75%,#e6c5a6 100%);background-clip:text;-webkit-background-clip:text;color:transparent}
  p{font-size:22px;line-height:1.6;color:#a9adb4;margin:26px 0 0;letter-spacing:-.02em}
  footer{position:absolute;bottom:47px;left:72px;right:72px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #2a2b30;padding-top:22px;color:#979ba3;font:400 12px/1.7 Mono,monospace;letter-spacing:.05em}
  .product{font-size:78px;line-height:1;letter-spacing:-.065em;font-weight:450;margin-top:6px}
  .endorsement{display:flex;align-items:center;gap:14px;color:#a9adb4;font:400 12px/1.7 Mono,monospace;letter-spacing:.05em;padding-top:12px}
  .endorsement img{width:110px;height:auto}.gauss h1{font-size:78px;margin-top:38px}
`;
const layouts = [
  ['share-site-v1.png', `<header><img class="logo" src="${logo}" alt="IMÁN"><span class="note">TECNOLOGÍA PARA TU NEGOCIO</span></header><h1>Vendé más.<br><span class="accent">Ganá tiempo.</span></h1><p>WhatsApp e IA · Fidelización · Catálogos y ERP</p><footer><span>Hecho a tu medida.</span><span>iman.ar</span></footer>`],
  ['share-gauss-v1.png', `<header><span class="product">Gauss</span><span class="endorsement">UN PRODUCTO DE <img src="${logo}" alt="IMÁN"></span></header><h1>Tus compras,<br><span class="accent">en automático.</span></h1><p>Proveedores, propuestas y negociación.<br>La decisión sigue siendo tuya.</p><footer><span>COMPRAS PARA EMPRESAS</span><span>iman.ar/gauss</span></footer>`]
];

(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
    for (const [name, body] of layouts) {
      await page.setContent(`<!doctype html><html lang="es-AR"><meta charset="utf-8"><style>${styles}</style><body class="${name.includes('gauss')?'gauss':''}">${body}</body></html>`);
      await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map(img => img.decode())]));
      await page.screenshot({path:path.join(assets,name)});
      process.stdout.write(`${name}: 1200 × 630\n`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });

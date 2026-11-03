import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

export const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(new URL('../../../../examples/inventory-workbench/tools/package.json', import.meta.url));
export const { chromium } = require('playwright');
export const AxeBuilder = require('@axe-core/playwright').default;
export async function serve() {
  const server = createServer(async (request, response) => {
    try {
      let name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let file = path.resolve(root, '.' + name);
      if (file !== path.resolve(root) && !file.startsWith(root)) throw new Error('Outside run');
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const mime = { '.html':'text/html', '.json':'application/json', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png' }[path.extname(file)] || 'application/octet-stream';
      response.writeHead(200, { 'Content-Type':mime, 'Cache-Control':'no-store' });
      response.end(await readFile(file));
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, url:`http://127.0.0.1:${server.address().port}` };
}
export async function geometry(page) {
  return page.evaluate(() => {
    const active=document.activeElement;const rect=active?.getBoundingClientRect();const style=active?getComputedStyle(active):null;
    return { width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,scrollY,scrollX,
      focus:{tag:active?.tagName,id:active?.id,text:active?.textContent?.slice(0,120),top:rect?.top,bottom:rect?.bottom,outlineStyle:style?.outlineStyle,outlineWidth:style?.outlineWidth,boxShadow:style?.boxShadow},
      live:[...document.querySelectorAll('[role="alert"],[role="status"],[aria-live]')].map(e=>{const r=e.getBoundingClientRect();return {role:e.getAttribute('role'),ariaLive:e.getAttribute('aria-live'),text:e.textContent,top:r.top,bottom:r.bottom,inViewport:r.bottom>0&&r.top<innerHeight};}),
    };
  });
}

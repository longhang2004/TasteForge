import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const root = process.cwd();
const { chromium } = await import(pathToFileURL(path.join(root, 'examples/inventory-workbench/tools/node_modules/playwright/index.mjs')));
const { default: AxeBuilder } = await import(pathToFileURL(path.join(root, 'examples/inventory-workbench/tools/node_modules/@axe-core/playwright/dist/index.mjs')));
const run = path.join(root, 'evals/runs/2026-11-06-composition-randomizer-pilot');
const out = path.join(run, 'evidence/delivery-gallery-2026-11-08-04');
await mkdir(out);
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/favicon.ico') return res.writeHead(204).end();
  const file = path.resolve(run, '.' + pathname);
  if (!file.startsWith(run + path.sep)) return res.writeHead(403).end();
  try { res.writeHead(200, { 'content-type': ({ '.html': 'text/html', '.png': 'image/png', '.json': 'application/json', '.md': 'text/plain' })[path.extname(file)] ?? 'application/octet-stream' }).end(await readFile(file)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true });
const report = { checks: [], errors: [], externalRequests: [], harnessNote: 'Offscreen lazy images are requested eagerly only to check asset existence; no source UI or frozen capture changed. Initial lazy-load timeout retained separately.' };
try {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    await page.route('**/*', route => {
      if (route.request().url().startsWith(`http://127.0.0.1:${server.address().port}`)) return route.continue();
      report.externalRequests.push(route.request().url()); return route.abort();
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    assert.equal(await page.locator('section').count(), 4);
    const links = await page.locator('a').evaluateAll(nodes => nodes.map(a => a.getAttribute('href')));
    assert(links.every(link => existsSync(path.resolve(run, link))));
    for (const details of await page.locator('details').all()) await details.evaluate(el => { el.open = true; });
    await page.locator('img').evaluateAll(nodes => nodes.forEach(image => { image.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.images].every(image => image.complete));
    assert(await page.locator('img').evaluateAll(nodes => nodes.every(img => img.naturalWidth > 0)));
    report.geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, outside: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map(el => ({ tag: el.tagName, text: el.textContent.slice(0, 90), right: el.getBoundingClientRect().right })) }));
    await page.screenshot({ path: path.join(out, `${width}-geometry.png`) });
    assert(report.geometry.document <= width + 1);
    await page.screenshot({ path: path.join(out, `${width}.png`) });
    const axe = await new AxeBuilder({ page }).analyze();
    assert.equal(axe.violations.length, 0);
    report.checks.push({ width, sections: 4, links: links.length, captures: await page.locator('img').count(), axeViolations: 0, axeIncomplete: axe.incomplete.map(x => x.id) });
    await context.close();
  }
  assert.equal(report.errors.length, 0); assert.equal(report.externalRequests.length, 0);
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve));
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report));

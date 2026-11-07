import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.argv[2];
const fileRel = process.argv[3];
const outDir = process.argv[4];
const toolsDir = '/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules';
const pw = await import(path.join(toolsDir, 'playwright/index.mjs'));
const chromium = pw.chromium || pw.default.chromium;
fs.mkdirSync(outDir, { recursive: true });

const server = http.createServer((req, res) => {
  const t = path.join(rootDir, fileRel);
  if (!fs.existsSync(t)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  fs.createReadStream(t).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });

const probe = async (tag) => {
  const r = await page.evaluate(() => {
    const a = document.activeElement;
    const active = a ? (a.id || a.tagName) : null;
    const el = document.getElementById('pick-HC-118');
    const card = el ? el.closest('.pick') : null;
    return {
      active,
      matchesFocusVisible: el ? el.matches(':focus-visible') : null,
      cardMatchesFocusWithin: card ? card.matches(':focus-within') : null,
      inputOutline: el ? (() => { const c = getComputedStyle(el); return { w: c.outlineWidth, s: c.outlineStyle, c: c.outlineColor }; })() : null,
      cardBorder: card ? getComputedStyle(card).borderTopColor : null,
      cardBg: card ? getComputedStyle(card).backgroundColor : null,
    };
  });
  console.log(tag, JSON.stringify(r));
  return r;
};

// click-based focus
await page.locator('#pick-HC-118').check();
await page.waitForTimeout(50);
await probe('after check()');

// keyboard traversal from the top of the document
await page.evaluate(() => { window.scrollTo(0, 0); document.body.setAttribute('tabindex', '-1'); document.body.focus(); document.body.removeAttribute('tabindex'); });
const order = [];
for (let i = 0; i < 6; i++) {
  await page.keyboard.press('Tab');
  order.push(await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName + ':' + document.activeElement.textContent.trim().slice(0, 20))));
}
console.log('tab order', JSON.stringify(order));
await page.evaluate(() => document.getElementById('pick-HC-118').focus());
await page.keyboard.press('Shift+Tab');
await page.keyboard.press('Tab');
await page.waitForTimeout(50);
const kb = await probe('after keyboard Tab into radio group');

await page.screenshot({ path: path.join(outDir, 'probe-focus.png') });
fs.writeFileSync(path.join(outDir, 'probe.json'), JSON.stringify({ kb }, null, 2));
await browser.close();
server.close();

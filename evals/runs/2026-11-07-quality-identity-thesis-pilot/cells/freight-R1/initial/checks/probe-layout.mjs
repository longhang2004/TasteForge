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
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  fs.createReadStream(t).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const browser = await chromium.launch();
const report = {};

for (const w of [320, 390, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
  await page.waitForTimeout(120);

  const geom = await page.evaluate(() => {
    const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), w: Math.round(b.width), h: Math.round(b.height), right: Math.round(b.right) }; };
    const clipped = [];
    document.querySelectorAll('*').forEach((e) => {
      if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible' && e.clientWidth > 0) {
        clipped.push({ tag: e.tagName, id: e.id, cls: e.className && e.className.toString().slice(0, 40), sw: e.scrollWidth, cw: e.clientWidth });
      }
    });
    const tiny = [];
    document.querySelectorAll('button, input, textarea, .pick, .opt').forEach((e) => {
      const b = e.getBoundingClientRect();
      if (b.height > 0 && b.height < 24) tiny.push({ id: e.id, cls: e.className && e.className.toString().slice(0, 30), h: Math.round(b.height) });
    });
    return {
      doc: document.documentElement.scrollWidth,
      inner: window.innerWidth,
      nav: r('nav, .steps'),
      picker: r('#picker'),
      card: r('#form .stack > section.card'),
      strip_row0: r('#strip .srow'),
      strip_track0: r('#strip .srow .track'),
      strip_val0: r('#strip .srow__val'),
      note: r('#note'),
      review_btn: r('#btn-review'),
      clipped,
      tiny,
    };
  });
  report[`evidence-${w}`] = geom;

  // interactions at this width
  await page.locator('#pick-HC-114').check();
  await page.locator('#d-release').check();
  const block = await page.evaluate(() => {
    const el = document.getElementById('release-block');
    const b = el.getBoundingClientRect();
    return { hidden: el.hidden, h: Math.round(b.height), text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 200), doc: document.documentElement.scrollWidth, inner: window.innerWidth };
  });
  report[`blocked-${w}`] = block;
  await page.screenshot({ path: path.join(outDir, `probe-blocked-${w}.png`) });

  await page.locator('#d-hold').check();
  await page.locator('#note').fill('Short');
  await page.locator('#btn-review').click();
  await page.waitForTimeout(80);
  report[`validation-${w}`] = await page.evaluate(() => {
    const el = document.getElementById('form-error');
    const b = el.getBoundingClientRect();
    return { text: el.textContent.trim(), h: Math.round(b.height), w: Math.round(b.width), doc: document.documentElement.scrollWidth, inner: window.innerWidth };
  });
  await page.screenshot({ path: path.join(outDir, `probe-validation-${w}.png`) });
  await page.close();
}

fs.writeFileSync(path.join(outDir, 'layout-probe.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
server.close();

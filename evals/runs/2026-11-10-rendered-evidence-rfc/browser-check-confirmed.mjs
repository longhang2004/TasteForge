import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from '/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright/index.mjs';
import AxeBuilder from '/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/@axe-core/playwright/dist/index.mjs';
import { captureCheckpoint } from '../../skills/tasteforge/scripts/check-ui.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const pageFile = path.join(root, '.tmp/rendered-evidence/view-confirmed.html');
const out = path.join(root, '.tmp/rendered-evidence/browser-round2');
await mkdir(out);
const html = await readFile(pageFile);
const sample = JSON.parse(await readFile(path.join(root, 'examples/rendered-evidence/annotations.json')));
const findings = new Map(sample.findings.map(f => [f.id, f]));
const report = { scope: 'New static evidence viewer only; no replay of pictured target apps',
  startedAt: new Date().toISOString(), htmlSha256: createHash('sha256').update(html).digest('hex'),
  cases: [], errors: [], remoteRequests: [] };
const server = createServer((req, res) => {
  if (req.url === '/') return res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html);
  if (req.url === '/favicon.ico') return res.writeHead(204).end();
  res.writeHead(404).end();
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
report.browser = browser.version();
try {
  for (const [width, dpr] of [[320, 1], [390, 1], [1440, 1], [390, 2]]) {
    const item = { width, deviceScaleFactor: dpr, checks: [], accessibility: null };
    report.cases.push(item);
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: dpr, reducedMotion: 'reduce' });
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url.startsWith('data:') || url.startsWith('blob:') || new URL(url).origin === origin) return route.continue();
      report.remoteRequests.push({ width, dpr, url }); return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(String(error)));
    const check = async (name, fn) => {
      try { await fn(); item.checks.push({ name, pass: true }); }
      catch (error) { item.checks.push({ name, pass: false, error: String(error) }); }
    };
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
    const toggle = page.getByRole('checkbox', { name: 'Show authored regions', exact: true });
    await check('one global native checkbox; two decoded retained images; no script', async () => {
      assert.equal(await toggle.count(), 1); assert(await toggle.isChecked());
      assert.equal(await page.locator('img').count(), 2);
      assert.equal(await page.locator('script').count(), 0);
    });
    await check('minimum-width access without horizontal clipping', async () => {
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    });
    await check('authored regions scale with image pixels, independently of viewer DPR', async () => {
      const regions = await page.locator('rect[data-finding]').evaluateAll(elements => elements.map(el => {
        const rect = el.getBoundingClientRect(), img = el.ownerSVGElement.parentElement.querySelector('img');
        const image = img.getBoundingClientRect(), vb = el.ownerSVGElement.viewBox.baseVal;
        return { id: el.getAttribute('data-finding'), rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          image: { x: image.x, y: image.y, width: image.width, height: image.height }, vb: [vb.width, vb.height],
          natural: [img.naturalWidth, img.naturalHeight] };
      }));
      assert.equal(regions.length, 2);
      for (const region of regions) {
        const f = findings.get(region.id); assert(f && f.rect);
        assert.deepEqual(region.vb, [320, 900]); assert.deepEqual(region.natural, [320, 900]);
        const [x, y, w, h] = f.rect;
        const expected = [region.image.x + x / 320 * region.image.width,
          region.image.y + y / 900 * region.image.height, w / 320 * region.image.width, h / 900 * region.image.height];
        for (const [i, key] of ['x', 'y', 'width', 'height'].entries())
          assert(Math.abs(region.rect[key] - expected[i]) <= 1.5, `${region.id} ${key} misaligned`);
      }
    });
    await check('source-only and judgment notes have text, not invented regions', async () => {
      assert.equal(await page.locator('rect[data-finding="source-only-reset"]').count(), 0);
      assert.equal(await page.locator('rect[data-finding="lifetime-note"]').count(), 0);
      assert.equal(await page.getByRole('heading', { name: 'The lower reset is a source fact only' }).count(), 1);
      assert.equal(await page.getByRole('heading', { name: 'Lifetime wording remains a scoped craft note' }).count(), 1);
    });
    const initial = await captureCheckpoint(page, { outputDir: out, label: `w${width}-d${dpr}-regions-on`, fullPage: dpr === 1 && width !== 320 });
    item.initial = { directory: path.relative(out, initial.directory), report: initial.report };
    await check('keyboard toggle hides and restores marks without replacing images', async () => {
      const before = await page.locator('img').evaluateAll(images => images.map(img => img.src));
      await toggle.focus(); await page.keyboard.press('Space'); assert.equal(await toggle.isChecked(), false);
      for (const rect of await page.locator('rect[data-finding]').all()) assert.equal(await rect.isVisible(), false);
      assert.deepEqual(await page.locator('img').evaluateAll(images => images.map(img => img.src)), before);
      await captureCheckpoint(page, { outputDir: out, label: `w${width}-d${dpr}-regions-off` });
      await page.keyboard.press('Space'); assert(await toggle.isChecked());
      for (const rect of await page.locator('rect[data-finding]').all()) assert(await rect.isVisible());
    });
    await check('recorded scroll and unknown metadata are inspectable via native details', async () => {
      const summary = page.locator('summary').first(); await summary.focus(); await page.keyboard.press('Enter');
      assert(await page.locator('pre').first().isVisible());
      const all = await page.locator('pre').allTextContents(); assert.equal(all.length, 2);
      const traces = all.map(text => JSON.parse(text).trace);
      assert.equal(traces[0]['Scroll Y'], 0); assert.equal(traces[1]['Scroll Y'], 562);
      for (const trace of traces) {
        assert.equal(trace['Image-time DPR'], 'unrecorded'); assert.equal(trace['Scroll X'], 'unrecorded');
        assert.equal(trace['Per-capture CSS viewport height'], 'unrecorded');
      }
    });
    const axe = await new AxeBuilder({ page }).analyze();
    item.accessibility = { violations: axe.violations, incomplete: axe.incomplete,
      passedRules: axe.passes.length, scope: 'Rendered viewer DOM; screenshot UI pixels are not audited' };
    await check('available automated accessibility scan has no reported violations', async () => assert.equal(axe.violations.length, 0));
    await context.close();
  }
} finally {
  report.finishedAt = new Date().toISOString();
  report.summary = { passed: report.cases.flatMap(c => c.checks).filter(c => c.pass).length,
    failed: report.cases.flatMap(c => c.checks).filter(c => !c.pass).length,
    axeViolations: report.cases.reduce((n, c) => n + (c.accessibility?.violations.length || 0), 0),
    axeIncomplete: report.cases.reduce((n, c) => n + (c.accessibility?.incomplete.length || 0), 0),
    pageErrors: report.errors.length, remoteRequests: report.remoteRequests.length };
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close(); await new Promise(resolve => server.close(resolve));
}
console.log(JSON.stringify(report.summary));
assert.equal(report.summary.failed, 0); assert.equal(report.summary.pageErrors, 0); assert.equal(report.summary.remoteRequests, 0);

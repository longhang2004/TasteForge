import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { runRoot, serve } from './serve.mjs';

const data = JSON.parse(await readFile(path.join(runRoot, 'viewer-data.json'), 'utf8'));
const root = path.join(runRoot, 'evidence/viewer-checks');
await mkdir(root, { recursive: true });
let attempt = 1, output;
while (true) {
  output = path.join(root, `pass-${String(attempt).padStart(2, '0')}`);
  try { await access(output); attempt++; }
  catch (error) { if (error.code !== 'ENOENT') throw error; break; }
}
await mkdir(output);
const record = { startedAtUtc: new Date().toISOString(), metadataSnapshot: data.generatedAtUtc, renderedCases: data.cases.filter(row => row.capturedAtUtc).length, checks: [], errors: [], failedResponses: [], blockedRequests: [] };
const { server, baseURL } = await serve();
const browser = await chromium.launch({ headless: true });
let page;
try {
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  page.on('pageerror', error => record.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) record.failedResponses.push({ url: response.url(), status: response.status() }); });
  await page.route('**/*', route => route.request().url().startsWith(baseURL + '/') ? route.continue() : (record.blockedRequests.push(route.request().url()), route.abort()));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelectorAll('.case').length === 2);
  const set = async values => {
    await page.evaluate(values => {
      for (const [id, value] of Object.entries(values)) document.getElementById(id).value = value;
      document.getElementById('pair').dispatchEvent(new Event('change'));
    }, values);
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.frame img')).every(image => image.complete && image.naturalWidth > 0));
    const state = await page.evaluate(() => ({ key: document.body.dataset.renderKey, width: innerWidth, scrollWidth: document.documentElement.scrollWidth, frames: Array.from(document.querySelectorAll('.frame')).map(frame => ({ images: frame.querySelectorAll('img').length, missing: frame.querySelectorAll('.missing').length })), scope: document.querySelector('#scope').value, mode: document.querySelector('#mode').value, scopeDisabled: document.querySelector('#scope').disabled, note: document.querySelector('#scope-note').textContent }));
    assert.equal(state.frames.length, 2);
    assert(state.frames.every(frame => frame.images + frame.missing === 1), 'Each condition must have a real image or explicit missing evidence');
    assert(state.scrollWidth <= state.width + 1, `Viewer overflow: ${state.scrollWidth}/${state.width}`);
    if (state.mode === 'neutral') assert(state.scope === 'full' && state.scopeDisabled && state.note.includes('font geometry'));
    else assert(state.note.includes(state.scope === 'full' ? 'below the visible viewport' : 'clipped to the stated screen height'));
    record.checks.push(state);
  };
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 320 ? 740 : width === 390 ? 844 : 1000 });
    for (const pair of data.pairs) for (const viewport of ['desktop', 'mobile', 'narrow320']) {
      await set({ pair: pair.id, viewport, scene: 'initial', mode: 'authored', scope: 'viewport' });
      await set({ pair: pair.id, viewport, scene: 'initial', mode: 'neutral', scope: 'full' });
    }
    await set({ pair: data.pairs[0].id, viewport: 'mobile', scene: 'review', mode: 'authored', scope: 'viewport' });
    await page.screenshot({ path: path.join(output, `viewer-${width}.png`), fullPage: true, animations: 'disabled' });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const pair of data.pairs) for (const scene of ['review', 'failure', 'success', 'cart', 'keyboard-focus']) for (const scope of ['viewport', 'full']) {
    await set({ pair: pair.id, viewport: 'mobile', scene, mode: 'authored', scope });
  }
  assert.equal(await page.locator('#availability article').count(), 2);
  assert.match(await page.locator('#availability').innerText(), /No UI generated; no UI quality score/);
  assert.deepEqual(record.errors, []);
  assert.deepEqual(record.failedResponses, []);
  assert.deepEqual(record.blockedRequests, []);
  record.status = 'passed';
} catch (error) {
  record.status = 'failed';
  record.failure = error.stack;
  await page?.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  record.completedAtUtc = new Date().toISOString();
  await writeFile(path.join(output, 'checks.json'), JSON.stringify(record, null, 2) + '\n');
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
console.log(JSON.stringify({ status: record.status, combinations: record.checks.length, renderedCases: record.renderedCases, evidence: path.relative(runRoot, output), failure: record.failure ?? null }));

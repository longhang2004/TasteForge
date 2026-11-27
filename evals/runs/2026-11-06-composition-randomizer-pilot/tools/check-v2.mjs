import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../../../examples/inventory-workbench/tools/node_modules/playwright/index.mjs';
import AxeBuilder from '../../../../examples/inventory-workbench/tools/node_modules/@axe-core/playwright/dist/index.mjs';

const run = fileURLToPath(new URL('../', import.meta.url));
const [cell, stage = 'initial', attempt = 'matched-v2'] = process.argv.slice(2);
assert(/^(proofdesk|cabinet)-(baseline|candidate)$/.test(cell));
assert(['initial', 'corrected'].includes(stage));
assert(/^matched-v\d+$/.test(attempt));
const source = path.join(run, 'outputs', cell, stage);
const out = path.join(run, 'evidence', cell, stage, attempt);
await mkdir(out, { recursive: true });
assert(!(await import('node:fs')).existsSync(path.join(out, 'report.json')), 'Preserve prior reports');
const report = { cell, stage, attempt, harnessSha256: createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'), startedAt: new Date().toISOString(), sourceSha256: createHash('sha256').update(await readFile(path.join(source, 'index.html'))).digest('hex'), checks: [], captures: [], axe: [], pageErrors: [], remoteRequests: [], harnessErrors: [] };
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
  const target = path.resolve(source, '.' + pathname);
  if (!target.startsWith(source + path.sep)) { response.writeHead(403).end(); return; }
  try {
    const bytes = await readFile(target);
    const mime = { '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain' }[path.extname(target)] ?? 'application/octet-stream';
    response.writeHead(200, { 'content-type': mime }).end(bytes);
  } catch { response.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
report.browser = browser.version();
try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await context.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
      report.remoteRequests.push({ width, url }); return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(3500);
    page.on('pageerror', (error) => report.pageErrors.push({ width, error: error.message }));
    const check = async (name, fn) => {
      try { await fn(); report.checks.push({ width, name, pass: true }); }
      catch (error) { report.checks.push({ width, name, pass: false, error: String(error) }); }
    };
    const control = (name) => page.getByRole('button', { name, exact: true }).or(page.getByRole('link', { name, exact: true })).first();
    const click = (name) => control(name).click();
    const liveText = () => page.locator('[role="alert"], [role="status"], [aria-live="polite"], [aria-live="assertive"]').allTextContents().then((parts) => parts.join(' '));
    const waitSuccess = () => page.waitForFunction(() => [...document.querySelectorAll('[role="alert"], [role="status"], [aria-live="polite"], [aria-live="assertive"]')].some((el) => /approved|approval (?:is )?(?:recorded|saved)|recorded locally|success/i.test(el.textContent) && !/recording|saving|pending|fail|not recorded|not approved|could not|couldn't/i.test(el.textContent)));
    const capture = async (state, axe = false) => {
      const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, scrollY, active: { tag: document.activeElement?.tagName, name: document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent?.trim().slice(0, 160) } }));
      const file = `${width}-${state}.png`;
      await page.screenshot({ path: path.join(out, file), fullPage: false });
      report.captures.push({ width, state, file, framing: 'natural viewport; no scroll/focus reset', ...geometry });
      report.checks.push({ width, name: `${state}: horizontal overflow`, pass: geometry.document <= width + 1, geometry });
      if (axe) {
        const result = await new AxeBuilder({ page }).analyze();
        report.axe.push({ width, state, violations: result.violations, incomplete: result.incomplete });
        report.checks.push({ width, name: `${state}: axe violations`, pass: result.violations.length === 0, count: result.violations.length });
      }
    };
    const option = async (label, pattern) => {
      const select = page.getByLabel(label, { exact: true });
      const options = await select.locator('option').evaluateAll((nodes) => nodes.map((el) => ({ label: el.textContent, value: el.value })));
      const match = options.find((entry) => pattern.test(entry.label));
      assert(match, `Missing ${label} option ${pattern}`);
      await select.selectOption(match.value);
    };
    const tabTo = async (locator, max = 45) => {
      for (let i = 0; i < max; i++) {
        if (await locator.count() && await locator.first().evaluate((el) => el === document.activeElement)) return;
        await page.keyboard.press('Tab');
      }
      throw new Error('Keyboard target not reached in bounded tab traversal');
    };
    try {
      await page.goto(origin + '/index.html');
      await page.waitForLoadState('networkidle');
      await capture('initial', true);
      if (cell.startsWith('proofdesk')) {
        const search = page.getByLabel('Search jobs', { exact: true });
        const copies = page.getByLabel('Copies', { exact: true });
        await check('queue empty and restore', async () => { await search.fill('zzzz-no-job'); assert.equal(await control('Open P-104').count(), 0); await capture('empty'); await search.fill('P-104'); await option('Queue status', /^Needs proof$/); });
        await click('Open P-104');
        await check('supplied proof and facts', async () => { assert(await page.locator('img[src$="proof-blue.svg"]').first().isVisible()); assert((await page.locator('body').innerText()).includes('Mưa cuối phố')); assert.equal(await copies.inputValue(), '80'); });
        await check('paper switch clamps and announces', async () => { await option('Paper', /^Kraft\b/); assert.equal(await copies.inputValue(), '60'); assert.match(await liveText(), /60/); });
        for (const value of ['', '0', '-1', '1.5', '61']) {
          await check(`invalid copies ${JSON.stringify(value)} cannot approve`, async () => {
            await copies.fill(value); await copies.blur();
            const review = control('Review proof');
            if (await review.isEnabled()) await review.click();
            const approve = control('Approve proof');
            assert(!(await approve.isVisible()) || await approve.isDisabled());
          });
        }
        await capture('invalid', true);
        await check('invalid value remains invalid through paper change', async () => { await copies.fill('0'); await option('Paper', /^Cotton White\b/); assert.equal(await copies.inputValue(), '0'); if (await control('Review proof').isEnabled()) await click('Review proof'); assert(!(await control('Approve proof').isVisible()) || await control('Approve proof').isDisabled()); });
        await copies.fill('25'); await click('Review proof');
        await check('review shows chosen fact and sheet consequence', async () => { const text = await page.locator('body').innerText(); for (const value of ['Mưa cuối phố', 'Cotton White', '25', '95']) assert(text.includes(value), value); });
        await capture('review', true);
        await click('Edit proof');
        await check('edit retains copies/paper', async () => { assert.equal(await copies.inputValue(), '25'); const selected = await page.getByLabel('Paper', { exact: true }).locator('option:checked').textContent(); assert.match(selected, /Cotton White/); });
        await click('Review proof'); await click('Approve proof');
        await control('Retry approval').waitFor({ state: 'visible' });
        await check('first failure is announced and retry offered', async () => { assert.match(await liveText(), /fail|could not|couldn't|try again|not recorded/i); assert(await control('Retry approval').isVisible()); });
        await capture('failure', true);
        await click('Retry approval'); await waitSuccess();
        await check('retry succeeds with retained proof', async () => { const text = await page.locator('body').innerText(); assert.match(await liveText(), /approv|success/i); for (const value of ['Mưa cuối phố', 'Cotton White', '25']) assert(text.includes(value), value); });
        await capture('success', true);
        await click('Edit proof'); await copies.fill('26');
        await check('edit clears stale success', async () => { assert.doesNotMatch(await liveText(), /approved locally|proof approved|successfully approved/i); });
        await click('Back to queue');
        await check('return retains queue filters', async () => { assert.equal(await search.inputValue(), 'P-104'); assert.match(await page.getByLabel('Queue status', { exact: true }).locator('option:checked').textContent(), /Needs proof/); });
        await capture('retained-return');
        await page.reload(); await page.waitForLoadState('networkidle');
        await check('keyboard approval and failure/retry', async () => { await tabTo(control('Open P-104')); await page.keyboard.press('Enter'); await tabTo(copies); await page.keyboard.press('Control+A'); await page.keyboard.type('25'); await tabTo(control('Review proof')); await page.keyboard.press('Enter'); await tabTo(control('Approve proof')); await page.keyboard.press('Enter'); await control('Retry approval').waitFor({ state: 'visible' }); await tabTo(control('Retry approval')); await page.keyboard.press('Enter'); await waitSuccess(); assert.match(await liveText(), /approv|success/i); });
        await capture('keyboard-outcome');
      } else {
        const search = page.getByLabel('Search panels', { exact: true });
        await check('combined filters, empty and reset', async () => { await option('Material', /^Aluminium$/); assert(await control('Open SC-03').isVisible()); assert(await control('Open SC-05').isVisible()); assert.equal(await page.getByRole('button', { name: /^Open SC-/ }).count() + await page.getByRole('link', { name: /^Open SC-/ }).count(), 2); await search.fill('SC-06'); assert.equal(await control('Open SC-06').count(), 0); await capture('empty', true); await click('Reset filters'); assert.equal(await search.inputValue(), ''); });
        await option('Material', /^Painted wood$/); await search.fill('Lối'); await click('Open SC-02');
        await control('Retry detail').waitFor({ state: 'visible' });
        await check('first detail failure retains chosen retry', async () => { assert(await control('Retry detail').isVisible()); assert((await page.locator('body').innerText()).includes('SC-02')); });
        await capture('failure', true); await click('Retry detail');
        await check('detail shows correct supplied artifact and facts', async () => { assert(await page.locator('img[src$="sc-02.svg"]:visible').first().isVisible()); const text = await page.locator('body').innerText(); for (const value of ['Lối qua xưởng', '1994', 'Painted wood', '420', '180', 'W2']) assert(text.includes(value), value); });
        await capture('detail', true); await click('Pin SC-02'); await click('Back to results');
        await check('detail return retains filters/pin', async () => { assert.equal(await search.inputValue(), 'Lối'); assert.match(await page.getByLabel('Material', { exact: true }).locator('option:checked').textContent(), /Painted wood/); assert(await control('Unpin SC-02').isVisible()); });
        await click('Pin SC-06'); await click('Compare pinned');
        await check('comparison contains both records and labelled facts', async () => { const text = await page.locator('body').innerText(); for (const value of ['Lối qua xưởng', 'Lối xuống bờ kè', '1994', '1997', '420', '450', 'W2', 'R3']) assert(text.includes(value), value); });
        await capture('compare', true); await click('Back to results'); await click('Reset filters');
        await check('third pin blocked with recoverable feedback', async () => { const pin = control('Pin SC-01'); if (await pin.isEnabled()) await pin.click(); assert(await pin.isVisible()); assert.equal(await control('Unpin SC-01').count(), 0); assert.match(await page.locator('body').innerText(), /two|2 selected|2 pinned|remove|unpin/i); });
        await capture('pin-limit', true); await click('Unpin SC-02'); await click('Pin SC-01'); await click('Compare pinned');
        await check('replacement comparison retains remaining pin', async () => { const text = await page.locator('body').innerText(); assert(text.includes('Bến số 4')); assert(text.includes('Lối xuống bờ kè')); });
        await capture('replacement');
        await page.reload(); await page.waitForLoadState('networkidle');
        await check('keyboard detail/retry/pin/compare', async () => { await tabTo(control('Open SC-01')); await page.keyboard.press('Enter'); await tabTo(control('Retry detail')); await page.keyboard.press('Enter'); await tabTo(control('Pin SC-01')); await page.keyboard.press('Enter'); await tabTo(control('Back to results')); await page.keyboard.press('Enter'); await tabTo(control('Pin SC-02')); await page.keyboard.press('Enter'); await tabTo(control('Compare pinned')); await page.keyboard.press('Enter'); const text = await page.locator('body').innerText(); assert(text.includes('Bến số 4')); assert(text.includes('Lối qua xưởng')); });
        await capture('keyboard-outcome');
      }
    } catch (error) { report.harnessErrors.push({ width, error: String(error), stack: error.stack }); await capture('stopped').catch(() => {}); }
    await context.close();
  }
} finally {
  await browser.close(); await new Promise((resolve) => server.close(resolve));
  report.finishedAt = new Date().toISOString();
  report.summary = { passed: report.checks.filter((c) => c.pass).length, failed: report.checks.filter((c) => !c.pass).length, harnessErrors: report.harnessErrors.length, pageErrors: report.pageErrors.length, remoteRequests: report.remoteRequests.length };
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report.summary));
}

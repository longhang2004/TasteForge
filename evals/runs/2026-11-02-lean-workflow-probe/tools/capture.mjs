import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { serve, runRoot } from './serve.mjs';
import { captureCheckpoint } from '../shared/check-ui.mjs';

const manifest = JSON.parse(await readFile(path.join(runRoot, 'manifest.json'), 'utf8'));
const selected = process.argv.slice(2);
if (!selected.length || selected.some(id => !manifest.cases.some(entry => entry.id === id))) throw new Error('Supply explicit completed case IDs; never capture pending availability placeholders');
const { server, baseURL } = await serve();
const browser = await chromium.launch({ headless: true });
const pause = (page) => page.waitForTimeout(160);
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const visible = async (locator) => locator.isVisible().catch(() => false);
const has = (text, expression) => expression.test(text.replace(/\u00a0/g, ' '));

async function axe(page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  const summarize = (issue) => ({ id: issue.id, impact: issue.impact, description: issue.description, help: issue.help, helpUrl: issue.helpUrl, nodes: issue.nodes.map(({ html, target, failureSummary }) => ({ html, target, failureSummary })) });
  return { testEngine: result.testEngine, violations: result.violations.map(summarize), incomplete: result.incomplete.map(summarize), passes: result.passes.map((p) => p.id) };
}
async function sourceHashes(directory, prefix = '') {
  const result = {};
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === 'evidence' || entry.name === 'node_modules') continue;
    const relative = prefix + entry.name;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(result, await sourceHashes(full, relative + '/'));
    else if (entry.isFile()) result[relative] = sha(await readFile(full));
  }
  return result;
}
async function quantity(locator, value) {
  const tag = await locator.evaluate((element) => element.tagName);
  if (tag === 'SELECT') await locator.selectOption(String(value));
  else await locator.fill(String(value));
}
async function captureCase(entry) {
  const folder = path.join(runRoot, 'cases', entry.id);
  if (!manifest.generationReady || entry.generation !== 'submitted') throw new Error(entry.id + ': explicit submitted status and frozen inputs required');
  const out = path.join(runRoot, 'evidence', entry.id);
  await mkdir(out, { recursive: true });
  try {
    await access(path.join(out, 'browser.json'));
    throw new Error(`${entry.id}: operator capture already exists; preserve it and use a separate run/attempt`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const html = await readFile(path.join(folder, 'index.html'), 'utf8');
  if (html.includes('<title>Interface</title>') && (await readFile(path.join(folder, 'app.js'), 'utf8')).trim() === '') throw new Error(`${entry.id} still has starter files`);
  const record = { captureVersion: 'lean-natural-1.0', evidencePass: 'natural-pass-01', caseId: entry.id, capturedAtUtc: new Date().toISOString(), browser: await browser.version(), sourceHashes: await sourceHashes(folder), captureToolSha256: sha(await readFile(new URL(import.meta.url))), checkpointHelperSha256: sha(await readFile(new URL('../shared/check-ui.mjs', import.meta.url))), viewports: {} };
  for (const viewport of manifest.viewports) {
    const consoleErrors = [], pageErrors = [], blockedRequests = [], failedResponses = [];
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'Asia/Ho_Chi_Minh', colorScheme: 'light', reducedMotion: 'reduce' });
    await context.route('**/*', (route) => {
      if (route.request().url().startsWith(baseURL + '/')) return route.continue();
      blockedRequests.push(route.request().url());
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(4000);
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() }); });
    const hook = id => page.locator('[data-testid="' + id + '"]:visible');
    const multiplicity = async () => page.locator('[data-testid]').evaluateAll(elements => {
      const rows = {};
      for (const element of elements) {
        const id = element.dataset.testid;
        const row = rows[id] ??= { total: 0, visible: 0 };
        row.total++;
        const style = getComputedStyle(element);
        if (element.getClientRects().length && style.visibility !== 'hidden' && style.visibility !== 'collapse') row.visible++;
      }
      return Object.fromEntries(Object.entries(rows).filter(([, value]) => value.total > 1));
    });
    const result = { viewport, consoleErrors, pageErrors, blockedRequests, failedResponses, screenshots: [], checks: [], focusSequence: [], stateGeometry: {} };
    const check = (name, pass, observation, kind = 'contract') => result.checks.push({ name, status: pass ? 'pass' : 'fail', observation, kind });
    const screenshot = async (state) => {
      await pause(page);
      const feedbackSelectors = entry.promptId === 'commerce-repair'
        ? [state === 'cart' ? '[data-testid="cart-status"]' : '[data-testid="add-to-cart"]']
        : [state === 'failure' || state === 'success' ? '[data-testid="transfer-status"]' : state === 'review' ? '[data-testid="confirm-transfer"]' : '[data-testid="review-transfer"]'];
      const checkpoint = await captureCheckpoint(page, {
        outputDir: path.join(out, 'checkpoints'),
        label: viewport.name + '-' + state,
        fullPage: state === 'initial' && viewport.name === 'mobile',
        feedbackSelectors
      });
      result.stateGeometry[state] = checkpoint.report;
      result.feedbackViewportObservations ??= {};
      result.feedbackViewportObservations[state] = checkpoint.report.feedback.map(item => ({
        selector: item.selector,
        matches: item.matches,
        layoutVisible: item.layoutVisible,
        intersectsViewport: item.elements?.filter(e => e.intersectsViewport).length ?? null,
        fullyInViewport: item.elements?.filter(e => e.fullyInViewport).length ?? null,
        error: item.error ?? null,
        scope: 'Observed natural-frame geometry, separate from functional task assertions'
      }));
      result.hookMultiplicityByState ??= {};
      result.hookMultiplicityByState[state] = await multiplicity();
      if (!['initial', 'keyboard-focus'].includes(state)) check('No horizontal overflow in ' + state,
        checkpoint.report.geometry.status === 'pass',
        checkpoint.report.document.width + 'px document / ' + viewport.width + 'px viewport', 'geometry');
      result.screenshots.push(...checkpoint.report.screenshots.map(image => path.relative(out, path.join(checkpoint.directory, image.file))));
    };
    try {
      await page.goto(`${baseURL}/cases/${entry.id}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await pause(page);
      result.initialText = await page.locator('body').innerText();
      result.hookMultiplicityInitial = await multiplicity();
      result.layout = await page.evaluate(() => ({ viewportWidth: innerWidth, scrollWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight, title: document.title, h1: [...document.querySelectorAll('h1')].map((e) => e.textContent), mainCount: document.querySelectorAll('main').length, htmlLang: document.documentElement.lang, bodyFont: getComputedStyle(document.body).fontFamily }));
      check('No document horizontal overflow', result.layout.scrollWidth <= viewport.width + 1, `${result.layout.scrollWidth}px document / ${viewport.width}px viewport`);
      check('Fictional/simulation disclosure visible', /fictional|illustrative|simulation|simulated|sample data/i.test(result.initialText), 'Visible page text inspected; wording is not a certification of factual accuracy.');
      await screenshot('initial');
      result.axeInitial = await axe(page);
      for (let tab = 0; tab < 10; tab++) {
        await page.keyboard.press('Tab');
        result.focusSequence.push(await page.evaluate(() => {
          const e = document.activeElement;
          const css = getComputedStyle(e);
          return { tag: e.tagName, testId: e.getAttribute('data-testid'), name: e.getAttribute('aria-label') || e.textContent?.trim().slice(0, 80) || '', outline: `${css.outlineStyle} ${css.outlineWidth}`, boxShadow: css.boxShadow };
        }));
        if (tab === 0) await screenshot('keyboard-focus');
      }
      await page.reload({ waitUntil: 'networkidle' });
      if (entry.promptId === 'commerce-repair') {
        check('Iron is initially selected', await hook('glaze-iron').isChecked(), 'Preserved native radio selection from supplied product UI.');
        check('Quantity starts at one', await hook('quantity').inputValue() === '1', await hook('quantity').inputValue());
        const quantityTag = await hook('quantity').evaluate(e => e.tagName);
        if (quantityTag === 'SELECT') {
          const values = await hook('quantity').locator('option').evaluateAll(options => options.map(o => o.value));
          check('Native quantity choices remain precisely one through four', JSON.stringify(values) === JSON.stringify(['1','2','3','4']), JSON.stringify(values));
        } else {
          check('Quantity input retains minimum and maximum', await hook('quantity').getAttribute('min') === '1' && await hook('quantity').getAttribute('max') === '4', 'Attribute evidence only; custom validation not established by this check.');
        }
        check('Initial Iron quantity-one total is USD76', has(await page.locator('body').innerText(), /76(?:\.00)?/), 'USD68 plus USD8 shipping, same fixture.');
        await hook('glaze-sand').click();
        await quantity(hook('quantity'), 2);
        const beforeAdd = await page.locator('body').innerText();
        check('Shipping-inclusive USD 144 shown before commitment', has(beforeAdd,/144(?:\.00)?/), 'Required in this new task: USD 68 × 2 + USD 8 shipping; presence alone does not establish good placement.');
        await screenshot('review');
        await hook('add-to-cart').click();
        await pause(page);
        const status = hook('cart-status');
        const feedback = await status.innerText();
        check('Sand × 2 cart confirmation', await visible(status) && /sand/i.test(feedback) && /\b2\b/.test(feedback), feedback);
        const body = await page.locator('body').innerText();
        check('Shipping-inclusive USD 144 total explicitly shown', has(body, /144(?:\.00)?/), 'Supporting repeated read after commitment; the required USD144 pre-commit total is separately asserted above.', 'diagnostic');
        await screenshot('cart');
        const ash = hook('glaze-ash');
        let prevented = await ash.isDisabled();
        if (!prevented) {
          await ash.click();
          const add = hook('add-to-cart');
          prevented = await add.isDisabled();
          if (!prevented) { await add.click(); await pause(page); prevented = /unavailable|out of stock|cannot|sold out/i.test(await status.innerText()); }
        }
        check('Unavailable Ash cannot be purchased', prevented, 'Disabled variant/action or explicit rejection observed through the shared controls.');
      } else {
        const amount = hook('amount');
        const recipient = hook('recipient');
        const originalRecipient = await recipient.inputValue();
        for (const invalid of ['0', '1001']) {
          await amount.fill(invalid);
          const action=hook('review-transfer');
          if(!await action.isDisabled()) await action.click();
          await pause(page);
          const proceedVisible = await visible(hook('confirm-transfer'));
          check(`Reject out-of-range amount ${invalid}`, !proceedVisible&&(await recipient.inputValue())===originalRecipient, `Confirmation visible: ${proceedVisible}; recipient retained: ${(await recipient.inputValue()) === originalRecipient}`);
        }
        await amount.fill('375');
        await hook('review-transfer').click();
        await hook('confirm-transfer').waitFor({ state: 'visible' });
        const review = await page.locator('body').innerText();
        check('Review retains full Vietnamese recipient', review.includes(originalRecipient), originalRecipient);
        check('Review shows USD 375 amount', has(review, /375(?:\.00)?/), 'Changed the original amount to exercise recalculation.');
        check('Review shows USD 2.50 fee', has(review, /2[.,]50/), 'Flat fee from the shared fixture.');
        check('Review shows USD 377.50 total', has(review, /377[.,]50/), 'USD 375 + USD 2.50 fee.');
        check('Review shows VND 9,375,000 received', has(review, /9[,.\s]?375[,.\s]?000/), 'USD 375 × 25,000 VND/USD.');
        check('Review shows delivery estimate', /3 November 2026|November 3,? 2026|3 Nov(?:ember)? 2026/i.test(review), 'Fixture estimate; no current banking or delivery guarantee.');
        await screenshot('review');
        await hook('edit-transfer').click(); await pause(page);
        check('Edit retains recipient and previous amount',await amount.inputValue()==='375'&&await recipient.inputValue()===originalRecipient,'Review-to-entry edit was actually exercised.');
        await amount.fill('400');await hook('review-transfer').click();await pause(page);
        const edited=await page.locator('body').innerText();
        check('Edited amount recalculates total and received amount',/402[.,]50/.test(edited)&&/10[,.\s]?000[,.\s]?000/.test(edited),'USD 400 + fee; VND 10,000,000.');
        await hook('confirm-transfer').click();
        await hook('retry-transfer').waitFor({ state: 'visible' });
        const failureText = await hook('transfer-status').innerText();
        const failureBody = await page.locator('body').innerText();
        check('First confirmation reports recoverable failure', await visible(hook('retry-transfer')) && /fail|couldn.t|could not|unable|try again|retry|error|timeout|timed out|didn.t go through|nothing was sent|not (?:been )?(?:sent|completed|processed)|did not/i.test(failureBody), failureText);
        const currentAmount = await amount.count() ? await amount.inputValue() : null;
        const currentRecipient = await recipient.count() ? await recipient.inputValue() : null;
        const retainedInInputs = currentAmount === '400' && currentRecipient === originalRecipient;
        const retainedInSummary = currentAmount === null && currentRecipient === null && failureBody.includes(originalRecipient) && /400(?:\.00)?/.test(failureBody);
        check('Failure retains recipient and amount', retainedInInputs || retainedInSummary, JSON.stringify({ amount: currentAmount, recipient: currentRecipient, method: retainedInInputs ? 'retained input elements' : retainedInSummary ? 'retained failure summary; edit form not separately exercised' : 'not established' }));
        await screenshot('failure');
        result.axeFailure = await axe(page);
        await hook('retry-transfer').click();
        await page.waitForFunction(() => {
          const active = Array.from(document.querySelectorAll('[data-testid="transfer-status"]')).filter(element => element.getClientRects().length && !['hidden','collapse'].includes(getComputedStyle(element).visibility));
          if (active.length !== 1) return false;
          const text = active[0].textContent ?? '';
          return /success|succeed|complete|confirmed|scheduled/i.test(text) && !/fail|error|unable|couldn.t/i.test(text);
        }, null, { timeout: 4000 });
        const success = await hook('transfer-status').innerText();
        check('Retry reaches a visible success outcome', /success|succeed|complete|confirmed|sent|scheduled/i.test(success), success);
        check('Success remains clearly simulated', /simulat|fictional|no money|not.*real/i.test(await page.locator('body').innerText()), 'Success-state page text inspected.');
        await screenshot('success');
      }
      result.axeFinal = await axe(page);
      check('No uncaught browser JavaScript errors', pageErrors.length === 0, pageErrors.join('\n') || 'None observed.', 'execution');
      check('No external resources requested', blockedRequests.length === 0, blockedRequests.join('\n') || 'None observed.');
    } catch (error) {
      result.executionError = error.message;
      result.executionErrorKind = /strict mode violation/i.test(error.message) ? 'harness-visible-hook-ambiguity' : 'flow-interruption';
      check('Complete shared primary-task flow', false, error.message, result.executionErrorKind === 'harness-visible-hook-ambiguity' ? 'harness' : 'execution');
      await screenshot('failure-state', true).catch(() => {});
    } finally {
      record.viewports[viewport.name] = result;
      await context.close();
    }
  }
  record.minimumWidthEvidence = { ...record.viewports.minimum?.layout, scope: 'Full natural-state task trace at 320×740; no forced scroll reset.' };
  await writeFile(path.join(out, 'browser.json'), json(record));
  console.log(`${entry.id}: ` + Object.entries(record.viewports).map(([v, r]) => `${v} ${r.checks.filter((c) => c.status === 'pass').length}/${r.checks.length} checks, ${r.axeInitial?.violations.length ?? '?'} initial axe rules`).join('; '));
  return record;
}
try {
  for (const entry of manifest.cases.filter((c) => !selected.length || selected.includes(c.id))) {
    try { await captureCase(entry); }
    catch (error) { console.error(`${entry.id}: ${error.message}`); process.exitCode = 1; }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

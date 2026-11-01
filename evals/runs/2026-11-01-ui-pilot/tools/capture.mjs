import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { serve, runRoot } from './serve.mjs';

const manifest = JSON.parse(await readFile(path.join(runRoot, 'manifest.json'), 'utf8'));
const selected = process.argv.slice(2);
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
  const out = path.join(runRoot, 'evidence', entry.id);
  await mkdir(out, { recursive: true });
  const html = await readFile(path.join(folder, 'index.html'), 'utf8');
  if (html.includes('<title>Interface</title>') && (await readFile(path.join(folder, 'app.js'), 'utf8')).trim() === '') throw new Error(`${entry.id} still has starter files`);
  const record = { caseId: entry.id, capturedAtUtc: new Date().toISOString(), browser: await browser.version(), sourceHashes: await sourceHashes(folder), viewports: {} };
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
    const result = { viewport, consoleErrors, pageErrors, blockedRequests, failedResponses, screenshots: [], checks: [], focusSequence: [] };
    const check = (name, pass, observation, kind = 'contract') => result.checks.push({ name, status: pass ? 'pass' : 'fail', observation, kind });
    const screenshot = async (state, fullPage = false) => {
      const filename = `${viewport.name}-${state}.png`;
      await page.screenshot({ path: path.join(out, filename), fullPage, animations: 'disabled' });
      result.screenshots.push(filename);
    };
    try {
      await page.goto(`${baseURL}/cases/${entry.id}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await pause(page);
      result.initialText = await page.locator('body').innerText();
      result.layout = await page.evaluate(() => ({ viewportWidth: innerWidth, scrollWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight, title: document.title, h1: [...document.querySelectorAll('h1')].map((e) => e.textContent), mainCount: document.querySelectorAll('main').length, htmlLang: document.documentElement.lang, bodyFont: getComputedStyle(document.body).fontFamily }));
      check('No document horizontal overflow', result.layout.scrollWidth <= viewport.width + 1, `${result.layout.scrollWidth}px document / ${viewport.width}px viewport`);
      check('Fictional/simulation disclosure visible', /fictional|illustrative|simulation|simulated|sample data/i.test(result.initialText), 'Visible page text inspected; wording is not a certification of factual accuracy.');
      await screenshot('initial');
      await screenshot('full', true);
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
      if (entry.promptId === 'commerce-craft') {
        await page.getByTestId('glaze-sand').click();
        await quantity(page.getByTestId('quantity'), 2);
        await page.getByTestId('add-to-cart').click();
        await pause(page);
        const status = page.getByTestId('cart-status');
        const feedback = await status.innerText();
        check('Sand × 2 cart confirmation', await visible(status) && /sand/i.test(feedback) && /\b2\b/.test(feedback), feedback);
        const body = await page.locator('body').innerText();
        check('Shipping-inclusive USD 144 total explicitly shown', has(body, /144(?:\.00)?/), 'Diagnostic only: the original contract requires unit price and shipping disclosure, not an automatically calculated order total. Expected USD 68 × 2 + USD 8 shipping.', 'diagnostic');
        await screenshot('cart');
        const ash = page.getByTestId('glaze-ash');
        let prevented = await ash.isDisabled();
        if (!prevented) {
          await ash.click();
          const add = page.getByTestId('add-to-cart');
          prevented = await add.isDisabled();
          if (!prevented) { await add.click(); await pause(page); prevented = /unavailable|out of stock|cannot|sold out/i.test(await status.innerText()); }
        }
        check('Unavailable Ash cannot be purchased', prevented, 'Disabled variant/action or explicit rejection observed through the shared controls.');
      } else {
        const amount = page.getByTestId('amount');
        const recipient = page.getByTestId('recipient');
        const originalRecipient = await recipient.inputValue();
        for (const invalid of ['0', '1001']) {
          await amount.fill(invalid);
          await page.getByTestId('review-transfer').click();
          await pause(page);
          const proceedVisible = await visible(page.getByTestId('confirm-transfer'));
          check(`Reject out-of-range amount ${invalid}`, !proceedVisible, `Confirmation visible: ${proceedVisible}; recipient retained: ${(await recipient.inputValue()) === originalRecipient}`);
        }
        await amount.fill('375');
        await page.getByTestId('review-transfer').click();
        await page.getByTestId('confirm-transfer').waitFor({ state: 'visible' });
        const review = await page.locator('body').innerText();
        check('Review retains full Vietnamese recipient', review.includes(originalRecipient), originalRecipient);
        check('Review shows USD 375 amount', has(review, /375(?:\.00)?/), 'Changed the original amount to exercise recalculation.');
        check('Review shows USD 2.50 fee', has(review, /2[.,]50/), 'Flat fee from the shared fixture.');
        check('Review shows USD 377.50 total', has(review, /377[.,]50/), 'USD 375 + USD 2.50 fee.');
        check('Review shows VND 9,375,000 received', has(review, /9[,.\s]?375[,.\s]?000/), 'USD 375 × 25,000 VND/USD.');
        check('Review shows delivery estimate', /3 November 2026|November 3,? 2026|3 Nov(?:ember)? 2026/i.test(review), 'Fixture estimate; no current banking or delivery guarantee.');
        await screenshot('review');
        await page.getByTestId('confirm-transfer').click();
        await page.getByTestId('retry-transfer').waitFor({ state: 'visible' });
        const failureText = await page.getByTestId('transfer-status').innerText();
        const failureBody = await page.locator('body').innerText();
        check('First confirmation reports recoverable failure', /fail|couldn.t|unable|try again|error|didn.t go through|nothing was sent|not (?:been )?(?:sent|completed)|did not/i.test(failureBody), failureText);
        const currentAmount = await amount.count() ? await amount.inputValue() : null;
        const currentRecipient = await recipient.count() ? await recipient.inputValue() : null;
        const retainedInInputs = currentAmount === '375' && currentRecipient === originalRecipient;
        const retainedInSummary = currentAmount === null && currentRecipient === null && failureBody.includes(originalRecipient) && /375(?:\.00)?/.test(failureBody);
        check('Failure retains recipient and amount', retainedInInputs || retainedInSummary, JSON.stringify({ amount: currentAmount, recipient: currentRecipient, method: retainedInInputs ? 'retained input elements' : retainedInSummary ? 'retained failure summary; edit form not separately exercised' : 'not established' }));
        await screenshot('failure');
        result.axeFailure = await axe(page);
        await page.getByTestId('retry-transfer').click();
        await page.waitForFunction(() => {
          const text = document.querySelector('[data-testid="transfer-status"]')?.textContent ?? '';
          return /success|complete|confirmed|scheduled/i.test(text) && !/fail|error|unable|couldn.t/i.test(text);
        }, null, { timeout: 4000 });
        const success = await page.getByTestId('transfer-status').innerText();
        check('Retry reaches a visible success outcome', /success|complete|confirmed|sent|scheduled/i.test(success), success);
        check('Success remains clearly simulated', /simulat|fictional|no money|not.*real/i.test(await page.locator('body').innerText()), 'Success-state page text inspected.');
        await screenshot('success');
      }
      result.axeFinal = await axe(page);
      check('No uncaught browser JavaScript errors', pageErrors.length === 0, pageErrors.join('\n') || 'None observed.', 'execution');
      check('No external resources requested', blockedRequests.length === 0, blockedRequests.join('\n') || 'None observed.');
    } catch (error) {
      result.executionError = error.message;
      check('Complete shared primary-task flow', false, error.message);
      await screenshot('failure-state', true).catch(() => {});
    } finally {
      record.viewports[viewport.name] = result;
      await context.close();
    }
  }
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

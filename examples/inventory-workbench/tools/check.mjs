import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { serve, root } from './serve.mjs';

const output = process.argv[2] || 'evidence/pass-01';
const out = path.resolve(root, output);
assert(
  out.startsWith(path.join(root, 'evidence') + path.sep),
  'Use a new directory under evidence/',
);
await mkdir(path.dirname(out), { recursive: true });
await mkdir(out); // Preserve earlier passes instead of overwriting evidence.
const { server, url } = await serve();
const browser = await chromium.launch();
const report = {
  createdAt: new Date().toISOString(),
  chromium: browser.version(),
  userTesting: 'not performed',
  traces: [],
  candidates: [],
};
const issues = [];
async function snapshot(page, trace, state) {
  await page.screenshot({
    path: path.join(out, `${trace.id}-${state}.png`),
    fullPage: true,
    animations: 'disabled',
  });
  const geometry = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    scrollY,
    visibleRows: [...document.querySelectorAll('[data-testid="inventory-row"]')].filter(
      (e) => e.getBoundingClientRect().height > 0,
    ).length,
    actions: [...document.querySelectorAll('#decision-panel button')]
      .filter((e) => e.getBoundingClientRect().height > 0)
      .map((e) => {
        const r = e.getBoundingClientRect();
        return { text: e.textContent, top: r.top + scrollY, bottom: r.bottom + scrollY };
      }),
  }));
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  if (state === 'failure') {
    await page.screenshot({
      path: path.join(out, `${trace.id}-failure-viewport.png`),
      fullPage: false,
      animations: 'disabled',
    });
  }
  trace.states[state] = {
    geometry,
    axe: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
    incomplete: axe.incomplete.map((v) => v.id),
  };
  assert(geometry.width <= geometry.viewport.width, `${trace.id}/${state}: horizontal overflow`);
  if (axe.violations.length)
    issues.push(`${trace.id}/${state}: ${axe.violations.map((v) => v.id).join(', ')}`);
}
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const trace = {
      id: `selected-${viewport.width}`,
      states: {},
      checks: [],
      errors: [],
      externalRequests: [],
    };
    report.traces.push(trace);
    page.on('pageerror', (error) => trace.errors.push(error.message));
    await page.route('**/*', (route) => {
      if (new URL(route.request().url()).origin !== url) {
        trace.externalRequests.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    const check = (name, observation = true) => {
      assert(observation, name);
      trace.checks.push(name);
    };
    const hook = (name) => page.getByTestId(name);
    await page.goto(url);
    await hook('inventory-row').first().waitFor();
    check(
      'Initially five rows; no selection',
      (await hook('inventory-row').count()) === 5 &&
        (await page.locator('#decision-panel').isHidden()),
    );
    await snapshot(page, trace, 'initial');
    await hook('shortage-only').check();
    check(
      'Shortage filter has exactly three items including incoming stock',
      (await hook('inventory-row').count()) === 3 && (await hook('item-LIN-115').isVisible()),
    );
    await hook('inventory-search').fill('NOT-A-SKU');
    await hook('clear-search').waitFor();
    check('Useful no-results recovery', (await hook('inventory-row').count()) === 0);
    await hook('clear-search').click();
    check(
      'Clear retains shortage filter',
      (await hook('shortage-only').isChecked()) && (await hook('inventory-row').count()) === 3,
    );
    await hook('inventory-search').fill('Nguyễn');
    check('Search matches Vietnamese item name', (await hook('inventory-row').count()) === 1);
    await hook('inventory-search').fill('LIN-115');
    await hook('item-LIN-115').focus();
    await page.keyboard.press('Enter');
    check(
      'Keyboard opens item; focus moves to its heading',
      await page.locator('#item-heading').evaluate((e) => e === document.activeElement),
    );
    await page.keyboard.press('Tab');
    check(
      'Next keyboard stop is the editable quantity',
      await hook('decision-quantity').evaluate((e) => e === document.activeElement),
    );
    const evidence = await page.locator('.stock-evidence').innerText();
    check(
      'Stock evidence contains available, reorder point, shortage and incoming',
      /Available now\s+2 pieces/.test(evidence) &&
        /Reorder point\s+10 pieces/.test(evidence) &&
        /Shortage\s+8 pieces/.test(evidence) &&
        /Incoming\s+4 pieces/.test(evidence),
    );
    check('Initial quantity is shortage', (await hook('decision-quantity').inputValue()) === '8');
    if (viewport.width <= 760)
      check(
        'Mobile focuses detail without list above it',
        await page.locator('.stock-list').isHidden(),
      );
    await snapshot(page, trace, 'detail');
    for (const quantity of ['', '0', '-1', '1.5', '51']) {
      await hook('decision-quantity').fill(quantity);
      await hook('review-decision').click();
      check(
        `Rejects invalid quantity ${JSON.stringify(quantity)}`,
        (await hook('decision-quantity').getAttribute('aria-invalid')) === 'true' &&
          (await hook('save-decision').count()) === 0,
      );
    }
    await hook('decision-quantity').fill('7');
    await hook('back-to-list').click();
    check(
      'Return retains query and filter; focus returns to item',
      (await hook('inventory-search').inputValue()) === 'LIN-115' &&
        (await hook('shortage-only').isChecked()) &&
        (await hook('item-LIN-115').evaluate((e) => e === document.activeElement)),
    );
    await hook('item-LIN-115').click();
    check('Return retains draft quantity', (await hook('decision-quantity').inputValue()) === '7');
    await hook('review-decision').click();
    check(
      'Review shows actual edited quantity and no purchase order consequence',
      /7 pieces/.test(await page.locator('.decision-summary').innerText()) &&
        /No purchase order is placed/.test(await page.locator('.decision-summary').innerText()),
    );
    await hook('edit-decision').click();
    check(
      'Edit retains quantity and returns focus to input',
      (await hook('decision-quantity').inputValue()) === '7' &&
        (await hook('decision-quantity').evaluate((e) => e === document.activeElement)),
    );
    await hook('decision-quantity').fill('8');
    await hook('review-decision').click();
    await snapshot(page, trace, 'review');
    await hook('save-decision').click();
    await hook('retry-decision').waitFor();
    check(
      'First save fails visibly and retains chosen quantity',
      /not recorded/.test(await hook('decision-status').innerText()) &&
        /8 pieces/.test(await page.locator('.decision-amount').innerText()),
    );
    check(
      'Failure focus is on retry',
      await hook('retry-decision').evaluate((e) => e === document.activeElement),
    );
    check(
      'Focused retry is exposed in the actual viewport',
      await hook('retry-decision').evaluate((e) => {
        const r = e.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight;
      }),
    );
    await snapshot(page, trace, 'failure');
    await hook('edit-decision').click();
    check(
      'Failure can return to retained edit value',
      (await hook('decision-quantity').inputValue()) === '8',
    );
    await hook('review-decision').click();
    await hook('save-decision').click();
    await hook('decision-status').waitFor();
    check(
      'Retry succeeds',
      /recorded for this session/.test(await hook('decision-status').innerText()),
    );
    await snapshot(page, trace, 'success');
    await hook('back-to-list').click();
    check(
      'Success return retains list context',
      (await hook('inventory-search').inputValue()) === 'LIN-115' &&
        (await hook('shortage-only').isChecked()),
    );
    await snapshot(page, trace, 'return');
    check(
      'No page errors or external requests',
      trace.errors.length === 0 && trace.externalRequests.length === 0,
    );
    await context.close();
  }
  for (const layout of ['focused', 'continuous']) {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      const page = await context.newPage();
      const trace = { id: `${layout}-${width}`, states: {} };
      report.candidates.push(trace);
      await page.goto(`${url}/prototype.html?layout=${layout}`);
      await page.getByTestId('item-LIN-115').click();
      await page.evaluate(() => scrollTo(0, 0));
      await snapshot(page, trace, 'detail');
      await page.getByTestId('review-decision').click();
      await page.evaluate(() => scrollTo(0, 0));
      await snapshot(page, trace, 'review');
      // Both options must actually support review, editing, failure, and retry.
      await page.getByTestId('edit-decision').click();
      assert.equal(await page.getByTestId('decision-quantity').inputValue(), '8');
      await page.getByTestId('review-decision').click();
      await page.getByTestId('save-decision').click();
      await page.getByTestId('retry-decision').click();
      await page.getByTestId('decision-status').waitFor();
      assert.match(
        await page.getByTestId('decision-status').innerText(),
        /recorded for this session/,
      );
      trace.recoveryPath = 'passed';
      await context.close();
    }
  }
} catch (error) {
  report.error = error.stack;
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
  report.axeFindings = issues;
  report.sources = {};
  for (const file of [
    'index.html',
    'app.mjs',
    'styles.css',
    'prototype.html',
    'prototype.mjs',
    'fixture.json',
    'tools/check.mjs',
    'tools/serve.mjs',
  ]) {
    report.sources[file] = createHash('sha256')
      .update(await readFile(path.join(root, file)))
      .digest('hex');
  }
  await writeFile(path.join(out, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
}
if (issues.length) {
  process.exitCode = 1;
  console.log(issues.join('\n'));
}
console.log(
  `${report.traces.length} viewport traces, ${report.candidates.length} executable candidate traces. Evidence: ${output}`,
);
if (report.error) console.log(report.error);

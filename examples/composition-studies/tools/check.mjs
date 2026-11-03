import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root, serve } from './serve.mjs';

const require = createRequire(
  new URL('../../inventory-workbench/tools/package.json', import.meta.url),
);
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const pass = process.argv[2] || 'pass-01';
assert(/^[a-z0-9-]+$/.test(pass), 'Use a new pass name');
const out = path.join(root, 'evidence', pass);
await mkdir(path.dirname(out), { recursive: true });
await mkdir(out);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sources = {};
for (const name of await readdir(root)) {
  if (/\.(mjs|css|html|json)$/.test(name))
    sources[name] = hash(await readFile(path.join(root, name)));
}
for (const name of await readdir(path.join(root, 'assets'))) {
  sources[`assets/${name}`] = hash(await readFile(path.join(root, 'assets', name)));
}
const { server, url } = await serve();
const browser = await chromium.launch();
const report = {
  startedAt: new Date().toISOString(),
  chromium: browser.version(),
  sources,
  traces: [],
  failures: [],
  scope:
    'Automated task assertions, axe and natural viewport evidence; no human tests or conformance claim.',
};
let current;
async function capture(page, state) {
  const filename = `${current.id}-${state}.png`;
  await page.screenshot({
    path: path.join(out, filename),
    fullPage: false,
    animations: 'disabled',
  });
  const geometry = await page.evaluate(() => {
    const active = document.activeElement;
    const rect = active?.getBoundingClientRect();
    return {
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      scrollX: window.scrollX,
      scrollY,
      focus: {
        tag: active?.tagName,
        id: active?.id,
        text: active?.textContent?.slice(0, 150),
        top: rect?.top,
        bottom: rect?.bottom,
      },
    };
  });
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const result = {
    state,
    file: filename,
    scope: 'natural viewport; no scroll/focus reset',
    geometry,
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
    incomplete: axe.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
  };
  current.states.push(result);
  if (geometry.scrollWidth > geometry.width)
    report.failures.push(`${current.id}/${state}: overflow ${geometry.scrollWidth}`);
  if (axe.violations.length)
    report.failures.push(
      `${current.id}/${state}: axe ${axe.violations.map((v) => v.id).join(', ')}`,
    );
  if (state === 'entry' && geometry.width === 1440) {
    await page.screenshot({
      path: path.join(out, `${current.id}-entry-full.png`),
      fullPage: true,
      animations: 'disabled',
    });
    result.optionalFullPage = `${current.id}-entry-full.png`;
  }
}
async function check(name, run) {
  await run();
  current.checks.push(name);
}
async function keyboardClick(page, locator) {
  await locator.focus();
  await page.keyboard.press('Enter');
}
async function operational(page) {
  await page.locator('#op-search').fill('LIN');
  await page.locator('#op-shortage').check();
  await keyboardClick(page, page.locator('[data-sku="LIN-115"]'));
  await capture(page, 'detail');
  for (const value of ['0', '1.5']) {
    await page.locator('#op-quantity').fill(value);
    await page.locator('#op-review').click();
    await check(`invalid quantity ${value} blocked`, async () =>
      assert(await page.locator('#op-quantity').isVisible()),
    );
  }
  await capture(page, 'invalid');
  await page.locator('#op-quantity').fill('8');
  await page.locator('#op-review').click();
  await capture(page, 'review');
  await page.locator('#op-edit').click();
  await check('edit retains quantity', async () =>
    assert.equal(await page.locator('#op-quantity').inputValue(), '8'),
  );
  await page.locator('#op-review').click();
  await page.locator('#op-save').click();
  await check('save failure offers retry', async () =>
    assert(await page.locator('#op-retry').isVisible()),
  );
  await capture(page, 'failure');
  await page.locator('#op-retry').click();
  await check('retry reports success and selected quantity', async () => {
    assert.match(await page.locator('#op-success').innerText(), /8/);
  });
  await capture(page, 'success');
  await page.locator('#op-back').click();
  await check('return retains search/filter and row focus', async () => {
    assert.equal(await page.locator('#op-search').inputValue(), 'LIN');
    assert(await page.locator('#op-shortage').isChecked());
    assert.equal(
      await page.locator('[data-sku="LIN-115"]').evaluate((e) => e === document.activeElement),
      true,
    );
  });
  await capture(page, 'return');
  await page.locator('[data-sku="LIN-115"]').click();
  await check('reopen retains draft', async () =>
    assert.equal(await page.locator('#op-quantity').inputValue(), '8'),
  );
  await page.locator('#op-back').click();
  await page.locator('#op-search').fill('nonexistent');
  await capture(page, 'empty');
  await check('empty list has no selectable rows', async () =>
    assert.equal(await page.locator('[data-sku]').count(), 0),
  );
}
async function commerce(page) {
  await page.locator('#co-glaze').selectOption('Ash');
  await capture(page, 'unavailable');
  await check('unavailable purchase blocked', async () =>
    assert(await page.locator('#co-add').isDisabled()),
  );
  await page.locator('#co-glaze').selectOption('Iron');
  await page.locator('#co-quantity').fill('3');
  await page.locator('#co-add').click();
  await capture(page, 'invalid');
  await check('over-stock does not add', async () =>
    assert(await page.locator('#co-retry').isHidden()),
  );
  await page.locator('#co-glaze').selectOption('Sand');
  await page.locator('#co-quantity').fill('2');
  await capture(page, 'decision');
  await check('complete cost and policies supplied', async () => {
    const text = await page.locator('main').innerText();
    for (const value of ['84', '90', '14', 'postage', '280'])
      assert(text.includes(value), `missing ${value}`);
  });
  await page.locator('#co-add').click();
  await capture(page, 'failure');
  await page.locator('#co-retry').click();
  await check('retry retains choices and exact total', async () => {
    const text = await page.locator('#co-feedback').innerText();
    for (const value of ['Sand', '2', '90']) assert(text.includes(value));
    assert.equal(await page.locator('#co-quantity').inputValue(), '2');
  });
  await capture(page, 'success');
}
async function editorial(page) {
  await keyboardClick(page, page.locator('a[href="#compare"]').first());
  await check('anchor focuses matching heading', async () =>
    assert.equal(await page.evaluate(() => document.activeElement.id), 'compare'),
  );
  await capture(page, 'section');
  await page.locator('#ed-save-compare').click();
  await page.locator('a[href="#record"]').first().click();
  await page.locator('#ed-resume').click();
  await check('resume restores saved heading focus', async () =>
    assert.equal(await page.evaluate(() => document.activeElement.id), 'compare'),
  );
  await capture(page, 'resumed');
  await page.locator('#ed-save-record').click();
  await page.locator('#ed-resume').click();
  await check('replace saved section works', async () =>
    assert.equal(await page.evaluate(() => document.activeElement.id), 'record'),
  );
  await capture(page, 'replaced');
  await page.locator('#ed-clear').click();
  await capture(page, 'cleared');
  await check('captions stay attached to artifacts', async () => {
    assert.equal(await page.locator('figure img').count(), 2);
    assert.equal(await page.locator('figure figcaption').count(), 2);
  });
}
async function collection(page) {
  await page.locator('#cl-type').selectOption('Print');
  await page.locator('#cl-search').fill('ink');
  await check('filters narrow to matching record', async () =>
    assert.equal(await page.locator('[data-record]').count(), 1),
  );
  await keyboardClick(page, page.locator('[data-record="FI-03"]'));
  await capture(page, 'detail');
  await check('detail has meaningful metadata and caption', async () => {
    const text = await page.locator('main').innerText();
    for (const value of ['42 × 59.4', '2023', 'Ink on paper', 'fictional'])
      assert(text.includes(value));
  });
  await page.locator('#cl-back').click();
  await check('return retains query/filter and trigger focus', async () => {
    assert.equal(await page.locator('#cl-search').inputValue(), 'ink');
    assert.equal(await page.locator('#cl-type').inputValue(), 'Print');
    assert(
      await page.locator('[data-record="FI-03"]').evaluate((e) => e === document.activeElement),
    );
  });
  await capture(page, 'return');
  await page.locator('#cl-search').fill('nonexistent');
  await capture(page, 'empty');
  await page.locator('#cl-reset').click();
  await check('empty reset restores all records', async () => {
    assert.equal(await page.locator('[data-record]').count(), 4);
    assert.equal(await page.locator('#cl-search').inputValue(), '');
  });
  await capture(page, 'reset');
}
try {
  for (const caseId of ['operational', 'commerce', 'editorial', 'collection']) {
    for (const condition of ['conventional', 'adapted']) {
      for (const width of [320, 390, 1440]) {
        current = {
          id: `${caseId}-${condition}-${width}`,
          states: [],
          checks: [],
          pageErrors: [],
          externalRequests: [],
        };
        report.traces.push(current);
        const context = await browser.newContext({
          viewport: { width, height: width === 320 ? 740 : width === 390 ? 844 : 1000 },
        });
        const page = await context.newPage();
        page.setDefaultTimeout(5000);
        page.on('pageerror', (error) => current.pageErrors.push(error.message));
        await page.route('**/*', (route) => {
          if (new URL(route.request().url()).origin !== url) {
            current.externalRequests.push(route.request().url());
            return route.abort();
          }
          return route.continue();
        });
        try {
          await page.goto(
            `${url}/examples/composition-studies/study.html?case=${caseId}&condition=${condition}`,
          );
          await page.locator('main h1').waitFor();
          await page.keyboard.press('Tab');
          await check('first keyboard stop is skip link', async () =>
            assert.equal(
              await page.evaluate(() => document.activeElement.textContent),
              'Skip to task',
            ),
          );
          await capture(page, 'entry');
          await { operational, commerce, editorial, collection }[caseId](page);
          assert.deepEqual(current.pageErrors, []);
          assert.deepEqual(current.externalRequests, []);
        } catch (error) {
          current.error = error.stack;
          report.failures.push(`${current.id}: ${error.message}`);
          await page
            .screenshot({
              path: path.join(out, `${current.id}-failure-diagnostic.png`),
              fullPage: false,
            })
            .catch(() => {});
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  report.finishedAt = new Date().toISOString();
  report.checkCount = report.traces.reduce((n, trace) => n + trace.checks.length, 0);
  report.stateCount = report.traces.reduce((n, trace) => n + trace.states.length, 0);
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  server.close();
}
console.log(
  JSON.stringify(
    { pass, checks: report.checkCount, states: report.stateCount, failures: report.failures },
    null,
    2,
  ),
);
if (report.failures.length) process.exitCode = 1;

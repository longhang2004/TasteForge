import assert from 'node:assert/strict';
import { chromium } from '../inventory-workbench/tools/node_modules/playwright/index.mjs';
import AxeBuilder from '../inventory-workbench/tools/node_modules/@axe-core/playwright/dist/index.mjs';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const here = fileURLToPath(new URL('.', import.meta.url));
const pass = process.argv[2] || 'pass-01';
assert(/^pass-\d\d$/.test(pass));
const out = path.join(here, 'evidence', pass);
await mkdir(out); // Refuse to replace previous evidence.
const report = {
  createdAt: new Date().toISOString(),
  userTesting: 'not performed',
  checks: [],
  failures: [],
};
const types = {
  '.html': 'text/html',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ttf': 'font/ttf',
  '.md': 'text/plain',
  '.txt': 'text/plain',
};
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const target = path.resolve(
    root,
    `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`,
  );
  if (!target.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403);
    response.end();
    return;
  }
  try {
    response.writeHead(200, {
      'Content-Type': `${types[path.extname(target)] || 'application/octet-stream'}; charset=utf-8`,
      'Cache-Control': 'no-store',
    });
    response.end(await readFile(target));
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/examples/composition-library/`;
const browser = await chromium.launch();
report.chromium = browser.version();
async function inspect(page, width, state, fullPage = false) {
  const geometry = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    scrollY,
    active: document.activeElement?.textContent?.slice(0, 100),
  }));
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const record = {
    width,
    state,
    geometry,
    violations: axe.violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      targets: nodes.map((node) => node.target),
    })),
    incomplete: axe.incomplete.map(({ id }) => id),
  };
  report.checks.push(record);
  await page.screenshot({
    path: path.join(out, `${width}-${state}.png`),
    fullPage,
    animations: 'disabled',
  });
  if (geometry.document > width)
    report.failures.push(`${width}/${state}: horizontal overflow ${geometry.document}`);
  if (record.violations.length)
    report.failures.push(
      `${width}/${state}: axe ${record.violations.map((item) => item.id).join(', ')}`,
    );
}
async function visibleFocus(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    const rect = el.getBoundingClientRect();
    return {
      text: el.textContent?.slice(0, 100),
      top: rect.top,
      bottom: rect.bottom,
      viewport: innerHeight,
      outline: getComputedStyle(el).outlineStyle,
    };
  });
}
try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 1440 ? 1000 : 844 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url);
    await page.locator('.composition').nth(11).waitFor();
    await page.waitForFunction(() =>
      document.querySelector('#font-status').textContent.includes('6 of 6'),
    );
    await page.evaluate(() => document.fonts.ready);
    await inspect(page, width, 'initial');
    const fontState = await page.locator('.specimen').evaluateAll((rows) =>
      rows.map((row) => ({
        id: row.dataset.font,
        loaded: row.dataset.loaded,
        family: getComputedStyle(row.querySelector('.sample')).fontFamily,
      })),
    );
    assert(fontState.length === 6 && fontState.every((font) => font.loaded === 'true'));
    report.checks.push({ width, state: 'local-fonts', fonts: fontState });
    if (width === 1440) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const { root: documentRoot } = await cdp.send('DOM.getDocument');
      const actualFonts = [];
      for (const font of fontState) {
        const { nodeId } = await cdp.send('DOM.querySelector', {
          nodeId: documentRoot.nodeId,
          selector: `[data-font="${font.id}"] .sample`,
        });
        const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
        assert(
          fonts.length && fonts.every((item) => item.isCustomFont),
          `${font.id} sample uses its local font`,
        );
        actualFonts.push({ id: font.id, fonts });
      }
      report.checks.push({ width, state: 'actual-specimen-font-mapping', actualFonts });
      await cdp.detach();
    }
    for (const group of ['work', 'commerce', 'reading', 'exploration']) {
      await page.locator(`[data-group="${group}"]`).click();
      assert.equal(await page.locator('.composition').count(), 3, `${group} has three entries`);
    }
    await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
    await page.locator('#task').selectOption('form');
    assert.equal(await page.locator('.composition').count(), 1);
    await page.locator('[data-group="commerce"]').click();
    assert.equal(await page.locator('.composition').count(), 0);
    await inspect(page, width, 'empty');
    await page.getByRole('button', { name: 'Show all compositions' }).click();
    assert.equal(await page.locator('.composition').count(), 12);
    assert.equal(
      await page.locator('[data-group="all"]').evaluate((el) => el === document.activeElement),
      true,
    );
    await page.locator('#query').fill('evidence margin');
    assert.equal(await page.locator('.composition').count(), 1);
    await page.locator('#query').fill('no-such-composition');
    assert.equal(await page.locator('.composition').count(), 0);
    await page.getByRole('button', { name: 'Show all compositions' }).click();
    // Natural keyboard traversal starts at the focused reset destination; Tab scrolls normally.
    let reachedSummary = false;
    const focusTrace = [];
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      const focus = await visibleFocus(page);
      focusTrace.push(focus);
      assert(focus.top >= 0 && focus.bottom <= focus.viewport + 1, 'natural focus is visible');
      if (
        await page
          .locator('summary')
          .first()
          .evaluate((el) => el === document.activeElement)
      ) {
        reachedSummary = true;
        break;
      }
    }
    assert(reachedSummary, 'keyboard reaches first card details');
    await page.keyboard.press('Enter');
    assert((await page.locator('.composition details').first().getAttribute('open')) !== null);
    await inspect(page, width, 'keyboard-details');
    report.checks.push({ width, state: 'keyboard-path', focusTrace });
    await page.locator('.composition details a[href^="#source-"]').first().click();
    assert((await page.locator('#source-shadcn-task-page').getAttribute('open')) !== null);
    await inspect(page, width, 'pinned-source');
    await page.locator('[data-group="work"]').click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await inspect(page, width, 'work-overview', true);
    assert.deepEqual(errors, []);
    await context.close();
  }
  const errorContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const errorPage = await errorContext.newPage();
  await errorPage.route('**/compositions.json', (route) => route.abort());
  await errorPage.goto(url);
  await errorPage.locator('#load-error:not([hidden])').waitFor();
  await errorPage.locator('#load-error').scrollIntoViewIfNeeded();
  await inspect(errorPage, 390, 'load-error');
  await errorPage.unroute('**/compositions.json');
  await errorPage.getByRole('button', { name: 'Retry loading' }).click();
  await errorPage.locator('.composition').nth(11).waitFor();
  report.checks.push({
    width: 390,
    state: 'load-retry',
    entries: await errorPage.locator('.composition').count(),
  });
  await errorContext.close();
  const fontContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const fontPage = await fontContext.newPage();
  await fontPage.route('**/*.ttf', (route) => route.abort());
  await fontPage.goto(url);
  await fontPage.waitForFunction(() =>
    document.querySelector('#font-status').textContent.includes('0 of 6'),
  );
  assert.equal(await fontPage.locator('.specimen[data-loaded="false"]').count(), 6);
  await fontPage.locator('#type').scrollIntoViewIfNeeded();
  await inspect(fontPage, 390, 'font-fallback');
  await fontContext.close();
} catch (error) {
  report.failures.push(error.stack);
} finally {
  await writeFile(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
  server.close();
}
console.log(
  JSON.stringify(
    { evidence: out, checks: report.checks.length, failures: report.failures },
    null,
    2,
  ),
);
if (report.failures.length) process.exitCode = 1;

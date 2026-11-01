import assert from 'node:assert/strict';
import { chromium } from '../../inventory-workbench/tools/node_modules/playwright/index.mjs';
import AxeBuilder from '../../inventory-workbench/tools/node_modules/@axe-core/playwright/dist/index.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { root } from './evidence.mjs';
import { serve } from './serve.mjs';
const output = process.argv[2] || 'evidence/pass-01';
const out = path.resolve(root, output);
assert(out.startsWith(path.join(root, 'evidence') + path.sep));
await mkdir(path.dirname(out), { recursive: true });
await mkdir(out);
const data = JSON.parse(await readFile(path.join(root, 'cases.json'), 'utf8'));
const { server, url } = await serve();
const browser = await chromium.launch();
const report = {
  createdAt: new Date().toISOString(),
  chromium: browser.version(),
  traces: [],
  userTesting: 'not performed',
};
try {
  for (const width of [1280, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const trace = { width, checks: [], errors: [], externalRequests: [], axe: [] };
    report.traces.push(trace);
    page.on('pageerror', (error) => trace.errors.push(error.message));
    await page.route('**/*', (route) => {
      if (new URL(route.request().url()).origin !== url) {
        trace.externalRequests.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    const check = (name, result) => {
      assert(result, name);
      trace.checks.push(name);
    };
    for (const entry of data.cases) {
      await page.goto(`${url}/?case=${entry.id}`);
      await page.waitForFunction(
        (id) => document.querySelector('#comparison').dataset.case === id,
        entry.id,
      );
      await page.waitForFunction(() =>
        [...document.querySelectorAll('article img')].every(
          (e) => e.complete && e.naturalWidth > 0,
        ),
      );
      check(
        `${entry.id}: deep link selects correct case`,
        (await page.locator('#comparison').getAttribute('data-case')) === entry.id,
      );
      check(`${entry.id}: source images load`, (await page.locator('article img').count()) === 2);
      check(
        `${entry.id}: no horizontal overflow`,
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      );
      if (entry.kind === 'alternatives')
        check(
          'Alternatives are labelled rather than presented as chronological repairs',
          /Structural alternatives.*not before/.test(await page.locator('.case-kind').innerText()),
        );
      else
        check(
          `${entry.id}: repair is labelled before/after`,
          (await page.locator('.case-kind').innerText()) === 'Before / after repair',
        );
      if (entry.id === 'visible-recovery')
        check(
          'Recovery framing distinguishes actual viewport from full-page',
          (await page.locator('.scope').nth(0).innerText()).includes('Full-page') &&
            (await page.locator('.scope').nth(1).innerText()).includes('Actual viewport'),
        );
      await page.locator('.hotspot').first().focus();
      await page.keyboard.press('Enter');
      check(
        `${entry.id}: keyboard annotation exposes its note`,
        await page
          .locator('figcaption p')
          .first()
          .evaluate((e) => e === document.activeElement),
      );
      await page.locator('#annotations').uncheck();
      check(
        `${entry.id}: hide annotations preserves explanation`,
        (await page.locator('.hotspot').first().isHidden()) &&
          (await page.locator('figcaption p').first().isVisible()),
      );
      await page.locator('#annotations').check();
      check(
        `${entry.id}: annotations can be restored`,
        await page.locator('.hotspot').first().isVisible(),
      );
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      trace.axe.push({
        case: entry.id,
        violations: axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        incomplete: axe.incomplete.map((v) => v.id),
      });
      check(
        `${entry.id}: no axe violations in inspected viewer state`,
        axe.violations.length === 0,
      );
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(out, `${width}-${entry.id}.png`), fullPage: true });
    }
    await page.getByRole('button', { name: /Give the stock columns/ }).focus();
    await page.keyboard.press('Enter');
    check(
      'Keyboard case selection announces the new comparison',
      await page
        .locator('#comparison')
        .evaluate((e) => e === document.activeElement && e.dataset.case === 'column-meaning'),
    );
    check(
      'Case selection updates the shareable URL',
      new URL(page.url()).searchParams.get('case') === 'column-meaning',
    );
    check(
      'No viewer errors or external application requests',
      trace.errors.length === 0 && trace.externalRequests.length === 0,
    );
    await context.close();
  }
} catch (error) {
  report.error = error.stack;
  process.exitCode = 1;
} finally {
  report.sources = {};
  for (const file of [
    'index.html',
    'app.mjs',
    'styles.css',
    'cases.json',
    'tools/check.mjs',
    'tools/serve.mjs',
    'tools/evidence.mjs',
  ])
    report.sources[file] = createHash('sha256')
      .update(await readFile(path.join(root, file)))
      .digest('hex');
  await writeFile(path.join(out, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  server.close();
}
console.log(
  `${report.traces.length} widths; ${report.traces.reduce((n, t) => n + t.checks.length, 0)} viewer checks. Evidence: ${output}`,
);
if (report.error) console.log(report.error);

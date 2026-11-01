import assert from 'node:assert/strict';
import { chromium } from '../../inventory-workbench/tools/node_modules/playwright/index.mjs';
import AxeBuilder from '../../inventory-workbench/tools/node_modules/@axe-core/playwright/dist/index.mjs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { serve, root } from './serve.mjs';
const output = process.argv[2] || 'evidence/pass-01';
const out = path.resolve(root, output);
assert(out.startsWith(path.join(root, 'evidence') + path.sep));
await mkdir(path.dirname(out), { recursive: true });
await mkdir(out);
const { server, url } = await serve();
const browser = await chromium.launch();
const report = {
  createdAt: new Date().toISOString(),
  browser: browser.version(),
  traces: [],
  userTesting: 'not performed',
  performanceProfiling: 'not performed',
};
try {
  for (const width of [1280, 390, 320]) {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion,
        hasTouch: width === 390,
      });
      const page = await context.newPage();
      const trace = {
        width,
        reducedMotion,
        touchContext: width === 390,
        checks: [],
        errors: [],
        externalRequests: [],
      };
      report.traces.push(trace);
      page.on('pageerror', (e) => trace.errors.push(e.message));
      await page.route('**/*', (route) => {
        if (new URL(route.request().url()).origin !== url) {
          trace.externalRequests.push(route.request().url());
          return route.abort();
        }
        return route.continue();
      });
      const check = (label, result) => {
        assert(result, label);
        trace.checks.push(label);
      };
      const running = () =>
        page.evaluate(
          () => document.getAnimations().filter((a) => a.playState === 'running').length,
        );
      const widthOK = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
      await page.goto(url);
      await page.waitForFunction(
        () => !document.querySelector('button[data-view="list"]').disabled,
      );
      check('No autoplay animations', (await running()) === 0);
      check(
        'Vietnamese text is retained',
        (await page.locator('.specimen').innerText()).includes('điều quan trọng.'),
      );
      check('No initial horizontal overflow', await widthOK());
      await page.screenshot({
        path: path.join(out, `${width}-${reducedMotion}-initial.png`),
        fullPage: true,
      });
      const before = await page
        .locator('.works li')
        .evaluateAll((nodes) => nodes.map((e) => e.dataset.item));
      await page.getByRole('button', { name: 'List', exact: true }).focus();
      await page.keyboard.press('Enter');
      check(
        'Keyboard view change retains button focus and state',
        await page
          .getByRole('button', { name: 'List', exact: true })
          .evaluate(
            (e) => e === document.activeElement && e.getAttribute('aria-pressed') === 'true',
          ),
      );
      assert.deepEqual(
        await page.locator('.works li').evaluateAll((nodes) => nodes.map((e) => e.dataset.item)),
        before,
      );
      trace.checks.push('Item identity/order survives view change');
      if (reducedMotion === 'reduce') {
        check(
          'OS reduced-motion control is checked and cannot be overridden',
          (await page.locator('#static-preview').isChecked()) &&
            (await page.locator('#static-preview').isDisabled()),
        );
        check('Reduced motion changes layout without animation', (await running()) === 0);
        check(
          'Reduced motion disables decorative replay',
          await page.locator('#replay').isDisabled(),
        );
      } else {
        await page.getByRole('button', { name: 'Grid', exact: true }).click();
        await page.getByRole('button', { name: 'List', exact: true }).click();
        await page.getByRole('button', { name: 'Grid', exact: true }).click();
        await page.waitForFunction(() => document.getAnimations().length === 0);
        check(
          'Repeated/interrupted view changes settle in the requested state',
          (await page.locator('.works').getAttribute('data-view')) === 'grid',
        );
        await page.locator('#replay').click();
        check(
          'Requested highlight starts a bounded animation',
          await page
            .locator('#marker')
            .evaluate((e) =>
              e
                .getAnimations()
                .some((a) => a.playState === 'running' && a.effect.getTiming().iterations === 1),
            ),
        );
        await page.locator('#static-preview').check();
        check(
          'Static preference cancels active animations',
          (await running()) === 0 && (await page.locator('#replay').isDisabled()),
        );
        await page.locator('#static-preview').uncheck();
        await page.locator('#replay').click();
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => document.querySelector('#static-preview').disabled);
        check(
          'Preference change mid-animation cancels motion and retains content',
          (await running()) === 0 &&
            (await page.locator('#marker').innerText()) === 'điều quan trọng.',
        );
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForFunction(() => !document.querySelector('#static-preview').disabled);
      }
      await page.locator('#reveal').focus();
      await page.keyboard.press('ArrowRight');
      check(
        'Comparison slider works with keyboard in either motion mode',
        (await page.locator('#reveal').inputValue()) === '51' &&
          (await page.locator('#reveal-value').innerText()) === '51%',
      );
      await page.keyboard.press('Home');
      check(
        'Comparison reaches greyscale endpoint',
        (await page.locator('#reveal').getAttribute('aria-valuetext')) === '0% colour',
      );
      await page.keyboard.press('End');
      check(
        'Comparison reaches colour endpoint with updated alternative',
        (await page.locator('#reveal').getAttribute('aria-valuetext')) === '100% colour' &&
          (await page.locator('.base').getAttribute('alt')).includes('100%'),
      );
      // In the touch-enabled context, tap the real native range rather than a hover proxy.
      if (width === 390) {
        const box = await page.locator('#reveal').boundingBox();
        await page.touchscreen.tap(box.x + box.width * 0.3, box.y + box.height / 2);
        check(
          'Native range responds to touch',
          Number(await page.locator('#reveal').inputValue()) < 100,
        );
      }
      await page.locator('#reveal').fill('50');
      await page.locator('#reveal').dispatchEvent('input');
      check('Image comparison introduces no autonomous animation', (await running()) === 0);
      check('No final horizontal overflow', await widthOK());
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      trace.axe = axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }));
      trace.incomplete = axe.incomplete.map((v) => v.id);
      check('No axe violations in inspected settled state', trace.axe.length === 0);
      check(
        'No page errors or external application requests',
        trace.errors.length === 0 && trace.externalRequests.length === 0,
      );
      await page.screenshot({
        path: path.join(out, `${width}-${reducedMotion}-settled.png`),
        fullPage: true,
      });
      await context.close();
    }
  }
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  const page = await context.newPage();
  await page.goto(url);
  assert(await page.locator('#replay').isDisabled());
  assert(await page.locator('#reveal').isDisabled());
  assert((await page.locator('.specimen').innerText()).includes('điều quan trọng.'));
  assert(
    await page.locator('.comparison img.base').evaluate((e) => e.complete && e.naturalWidth > 0),
  );
  report.noJS = 'Static text/image/captions present; optional controls disabled';
  await page.screenshot({ path: path.join(out, '320-no-js.png'), fullPage: true });
  await context.close();
} catch (error) {
  report.error = error.stack;
  process.exitCode = 1;
} finally {
  report.sources = {};
  for (const file of [
    'index.html',
    'app.mjs',
    'styles.css',
    'study.svg',
    'tools/check.mjs',
    'tools/serve.mjs',
  ])
    report.sources[file] = createHash('sha256')
      .update(await readFile(path.join(root, file)))
      .digest('hex');
  await writeFile(path.join(out, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  server.close();
}
console.log(
  `${report.traces.length} motion/viewport traces; ${report.traces.reduce((n, t) => n + t.checks.length, 0)} checks. Evidence: ${output}`,
);
if (report.error) console.log(report.error);

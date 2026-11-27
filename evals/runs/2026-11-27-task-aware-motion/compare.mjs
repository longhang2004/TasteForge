import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { serve } = await import(pathToFileURL(resolve('examples/effects-lab/tools/serve.mjs')));
const toolsPackage = resolve(process.argv[2] ?? 'examples/inventory-workbench/tools/package.json');
const { chromium } = createRequire(toolsPackage)('playwright');
const browser = await chromium.launch();
const { server, url } = await serve();
const samples = [];
try {
  for (const width of [390, 1280]) {
    for (const mode of ['no-preference', 'reduce']) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: mode, hasTouch: width === 390 });
      await page.goto(url);
      const list = page.getByRole('button', { name: 'List', exact: true });
      await list.waitFor();
      if (width === 390) await list.tap();
      else { await list.focus(); await page.keyboard.press('Enter'); }
      assert.equal(await list.getAttribute('aria-pressed'), 'true');
      if (width === 1280) assert(await list.evaluate(el => el === document.activeElement));
      await page.evaluate(() => Promise.all(document.getAnimations().map(anim => anim.finished)));
      const result = await page.evaluate(async () => {
        const works = document.querySelector('.works');
        const items = [...works.children];
        const rows = [];
        for (let i = 0; i < 8; i++) {
          const view = i % 2 === 0 ? 'grid' : 'list';
          const button = document.querySelector('button[data-view="' + view + '"]');
          const start = performance.now();
          button.click();
          const dispatchMs = performance.now() - start;
          const animations = items.flatMap(el => el.getAnimations());
          const stateCorrect = works.dataset.view === view && button.getAttribute('aria-pressed') === 'true'
            && items.every((item, index) => works.children[index] === item);
          const durations = animations.map(a => a.effect.getTiming().duration);
          rows.push({ view, dispatchMs, durations, stateCorrect });
          await Promise.all(animations.map(a => a.finished));
        }
        return rows;
      });
      assert(result.every(row => row.stateCorrect));
      if (mode === 'reduce') assert(result.every(row => row.durations.length === 0));
      else assert(result.every(row => row.durations.length > 0 && row.durations.every(d => d === 280)));
      samples.push({ width, mode, activation: width === 390 ? 'tap' : 'Enter', result });
      await page.close();
    }
  }
  console.log(JSON.stringify({ browser: browser.version(), samples }, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

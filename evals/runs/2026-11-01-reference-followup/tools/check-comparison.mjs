import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { runRoot, serve } from './serve.mjs';

const { server, baseURL } = await serve();
const browser = await chromium.launch({ headless: true });
const errors = [];
const checks = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(baseURL);
  for (const viewport of ['desktop', 'mobile']) {
    for (const state of ['initial', 'full', 'review', 'failure', 'success']) {
      await page.selectOption('#viewport', viewport);
      await page.selectOption('#state', state);
      await page.waitForFunction(() => Array.from(document.querySelectorAll('.frame img')).every((i) => i.complete && i.naturalWidth > 0));
      const images = await page.locator('.frame img').evaluateAll((nodes) => nodes.map((i) => ({ src: i.getAttribute('src'), width: i.naturalWidth, height: i.naturalHeight })));
      assert.equal(images.length, 2);
      checks.push({ viewport, state, images });
    }
  }
  await page.selectOption('#viewport', 'desktop');
  await page.selectOption('#state', 'initial');
  await page.waitForFunction(() => Array.from(document.querySelectorAll('.frame img')).every((i) => i.complete && i.naturalWidth > 0));
  await page.screenshot({ path: path.join(runRoot, 'evidence/comparison-desktop.png'), fullPage: true });
  await page.selectOption('#viewport', 'mobile');
  await page.waitForFunction(() => Array.from(document.querySelectorAll('.frame img')).every((i) => i.complete && i.naturalWidth > 0));
  await page.locator('#comparison').screenshot({ path: path.join(runRoot, 'evidence/comparison-mobile-panels.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Viewer mobile overflow');
  await page.screenshot({ path: path.join(runRoot, 'evidence/comparison-mobile.png'), fullPage: true });
  assert.deepEqual(errors, []);
  await writeFile(path.join(runRoot, 'evidence/comparison-check.json'), JSON.stringify({ browser: browser.version(), combinations: checks, pageErrors: errors, viewerMobileOverflow: false }, null, 2) + '\n');
  console.log(`Verified ${checks.length} comparison states / ${checks.length * 2} images, mobile reflow and no page errors.`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

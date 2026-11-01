import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { serve, runRoot } from './serve.mjs';

const { server, baseURL } = await serve();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const checks = [];
try {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Does TasteForge change the UI?' }).waitFor();
  for (const model of ['gpt-6.1-sol', 'gpt-6-luna']) {
    await page.locator('#model').selectOption(model);
    for (const prompt of ['commerce-craft', 'fintech-transfer']) {
      await page.locator('#prompt').selectOption(prompt);
      for (const viewport of ['desktop', 'mobile']) {
        await page.locator('#viewport').selectOption(viewport);
        const states = await page.locator('#state option').evaluateAll((options) => options.map((o) => o.value));
        for (const state of states) {
          await page.locator('#state').selectOption(state);
          await page.waitForFunction(() => [...document.querySelectorAll('.pair img')].length === 2 && [...document.querySelectorAll('.pair img')].every((image) => image.complete && image.naturalWidth > 0));
          checks.push({ model, prompt, viewport, state, imagesLoaded: 2 });
        }
      }
    }
  }
  await page.locator('#model').selectOption('gpt-6.1-sol');
  await page.locator('#prompt').selectOption('commerce-craft');
  await page.locator('#viewport').selectOption('desktop');
  await page.locator('#state').selectOption('initial');
  await page.locator('#reveal').check();
  const conditions = await page.locator('.condition').allTextContents();
  if (!conditions.includes('With TasteForge') || !conditions.includes('Without TasteForge')) throw new Error('Reveal control did not show both conditions');
  const links = await page.locator('.option-actions a').evaluateAll((a) => a.map((link) => link.href));
  links.push(...await page.locator('.nav a').evaluateAll((a) => a.map((link) => link.href)));
  for (const url of links) if (!(await page.request.get(url)).ok()) throw new Error('Broken gallery action: ' + url);
  await mkdir(path.join(runRoot, 'evidence'), { recursive: true });
  await page.screenshot({ path: path.join(runRoot, 'evidence/gallery-desktop.png'), fullPage: true, animations: 'disabled' });
  await page.locator('.pair').screenshot({ path: path.join(runRoot, 'evidence/comparison-commerce-sol.png'), animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  if (width > 391) throw new Error(`Gallery overflows mobile viewport: ${width}`);
  await page.screenshot({ path: path.join(runRoot, 'evidence/gallery-mobile.png'), fullPage: true, animations: 'disabled' });
  if (errors.length) throw new Error(errors.join('\n'));
  const result = { checkedAtUtc: new Date().toISOString(), browser: await browser.version(), imageCombinations: checks, revealConditions: conditions, consolePageErrors: errors, mobileScrollWidth: width, note: 'Gallery controls and local links only; implementation task checks are in per-case browser.json.' };
  await writeFile(path.join(runRoot, 'evidence/gallery-checks.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(`Gallery: ${checks.length} image combinations, reveal control, live links, and mobile overflow check passed.`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

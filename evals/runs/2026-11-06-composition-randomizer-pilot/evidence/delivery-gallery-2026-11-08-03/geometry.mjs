import { chromium } from '../../examples/inventory-workbench/tools/node_modules/playwright/index.mjs';
import { readFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
  await page.setContent(await readFile('evals/runs/2026-11-06-composition-randomizer-pilot/index.html', 'utf8'));
  console.log(JSON.stringify(await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth, overflowing: [...document.querySelectorAll('body *')].filter(el => el.scrollWidth > el.clientWidth + 1).slice(0, 12).map(el => ({ tag: el.tagName, text: el.textContent.slice(0, 70), client: el.clientWidth, scroll: el.scrollWidth })) }))));
} finally { await browser.close(); }

const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
const { AxeBuilder } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/@axe-core/playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'http://127.0.0.1:4189';
const OUT = process.env.OUT;

(async () => {
  const browser = await chromium.launch();
  const all = [];
  for (const width of [320, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + '/index.html');
    const scenarios = [
      ['initial', async () => {}],
      ['selected-excursion', async () => { await page.locator('#pick-HC-114').check(); }],
      ['validation-error', async () => { await page.locator('#review-button').click(); }],
      ['review', async () => {
        await page.locator('#decision-hold').check();
        await page.locator('#decision-note').fill('Third reading is above limit; holding for supervisor review.');
        await page.locator('#review-button').click();
      }],
      ['submit-failure', async () => {
        await page.locator('#submit-button').click();
        await page.waitForSelector('#submit-error');
      }],
      ['success', async () => {
        await page.locator('#retry-button').click();
        await page.waitForSelector('#success-panel:not([hidden])');
      }]
    ];
    for (const [name, act] of scenarios) {
      await act();
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      all.push({ width, name, violations: res.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target.join(' ')) })), incomplete: res.incomplete.map(v => v.id) });
      console.log('axe ' + width + ' ' + name + ': violations=' + res.violations.length + ' incomplete=' + res.incomplete.length +
        (res.violations.length ? ' -> ' + res.violations.map(v => v.id + '(' + v.nodes.length + ')').join(', ') : ''));
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'axe.json'), JSON.stringify(all, null, 2));
})();

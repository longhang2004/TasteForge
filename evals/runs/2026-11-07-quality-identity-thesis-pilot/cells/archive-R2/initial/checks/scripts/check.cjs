const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
const { AxeBuilder } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/@axe-core/playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:4191/index.html';
const OUT = '/mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-07-quality-identity-thesis-pilot/cells/archive-R2/initial/checks';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function rec(name, ok, detail) { results.push({ name, ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' :: ' + detail : '')); }

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(URL, { waitUntil: 'load' });

  // counts
  const n = await page.locator('.record').count();
  rec('initial list shows 5 records', n === 5, 'count=' + n);
  const countText = (await page.locator('#count').innerText()).trim();
  rec('count text', /Showing 5 of 5/.test(countText), countText);

  // search
  await page.fill('#q', 'weir');
  await page.waitForTimeout(120);
  let c = await page.locator('.record').count();
  rec('search "weir" -> 1', c === 1, 'count=' + c);
  let t = await page.locator('.record-title').first().innerText();
  rec('weir result title', /River weir cross-section/.test(t), t);

  // series search
  await page.fill('#q', 'craft');
  await page.waitForTimeout(120);
  c = await page.locator('.record').count();
  rec('search "craft" (series match) -> 2', c === 2, 'count=' + c);

  // no results
  await page.fill('#q', 'zzzz');
  await page.waitForTimeout(120);
  rec('empty state visible', await page.locator('#empty').isVisible());
  const ed = await page.locator('#empty-desc').innerText();
  rec('empty desc mentions term', /zzzz/.test(ed), ed);

  // reset
  await page.click('#reset');
  await page.waitForTimeout(120);
  c = await page.locator('.record').count();
  rec('reset restores 5', c === 5, 'count=' + c);
  rec('reset clears query', (await page.inputValue('#q')) === '');

  // filter series
  await page.getByText('Field Surveys', { exact: false }).first().click();
  await page.waitForTimeout(120);
  c = await page.locator('.record').count();
  rec('Field Surveys filter -> 3', c === 3, 'count=' + c);

  // combined search+filter -> empty & reset via click
  await page.fill('#q', 'kiln');
  await page.waitForTimeout(120);
  rec('kiln + Field Surveys empty', await page.locator('#empty').isVisible());
  await page.click('#reset');
  await page.waitForTimeout(120);
  rec('reset clears series too', await page.isChecked('input[value="All"]') && (await page.locator('.record').count()) === 5);
  // keyboard radio operation
  await page.focus('input[value="All"]');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(120);
  rec('arrow key changes series', await page.isChecked('input[value="Field Surveys"]'), 'checked Field Surveys');
  const kbCount = await page.locator('.record').count();
  rec('keyboard series filter applied -> 3', kbCount === 3, 'count=' + kbCount);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(120);

  // scroll + filter context retention
  await page.fill('#q', 'coastal');
  await page.waitForTimeout(120);
  c = await page.locator('.record').count();
  rec('coastal -> 2 (LS-02, LS-19)', c === 2, 'count=' + c);

  // open second record (duplicate)
  const second = page.locator('.record-btn').nth(1);
  const openedLabel = await second.getAttribute('aria-label');
  await second.scrollIntoViewIfNeeded();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await second.click();
  await page.waitForTimeout(150);
  rec('detail visible', await page.locator('#detail').isVisible());
  rec('browse hidden', !(await page.locator('#browse').isVisible()));
  const h2 = (await page.locator('#record-title').innerText()).trim();
  rec('duplicate detail title', /duplicate/.test(h2), h2);
  rec('focus on detail heading', await page.evaluate(() => document.activeElement && document.activeElement.id === 'record-title'));
  const dupeVisible = await page.locator('.dupe').isVisible();
  rec('duplicate notice present', dupeVisible);
  const plateCaption = await page.locator('.plate-figure figcaption').innerText();
  rec('schematic caption not archival', /Schematic placeholder — not the archival photograph/.test(plateCaption));
  const cond = await page.locator('.condition p').first().innerText();
  rec('condition note shown', /Duplicate of LS-02/.test(cond), cond);
  const limits = await page.locator('.limits li').count();
  rec('limits list', limits === 4, 'li=' + limits);
  rec('position text', /record 2 of 2/i.test(await page.locator('.position').innerText()), (await page.locator('.position').innerText()));

  // back retains context + focus
  await page.click('[data-back]');
  await page.waitForTimeout(200);
  rec('back shows browse', await page.locator('#browse').isVisible());
  rec('back retains query', (await page.inputValue('#q')) === 'coastal');
  c = await page.locator('.record').count();
  rec('back retains 2 results', c === 2, 'count=' + c);
  const focusAfter = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? (el.getAttribute('data-open') || el.tagName) : null;
  });
  rec('focus restored to opened record', focusAfter === 'LS-19', String(focusAfter));
  const scrollAfter = await page.evaluate(() => window.scrollY);
  rec('scroll restored', Math.abs(scrollAfter - scrollBefore) < 40, scrollBefore + ' -> ' + scrollAfter);

  // keyboard: escape from detail
  await page.locator('.record-btn').first().click();
  await page.waitForTimeout(120);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  rec('Escape closes detail', await page.locator('#browse').isVisible());

  // long title no horizontal overflow at widths
  for (const w of [320, 390, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.fill('#q', '');
    await page.getByText('All series', { exact: false }).first().click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth
    }));
    rec('no horizontal overflow @' + w, m.sw <= m.cw + 1, JSON.stringify(m));
    await page.screenshot({ path: path.join(OUT, 'list-' + w + '.png'), fullPage: true });
  }

  // accessibility at 390
  await page.setViewportSize({ width: 390, height: 900 });
  await page.fill('#q', 'coastal');
  await page.waitForTimeout(120);
  const axe1 = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  fs.writeFileSync(path.join(OUT, 'axe-list.json'), JSON.stringify(axe1, null, 2));
  rec('axe list violations', axe1.violations.length === 0, axe1.violations.map(v => v.id).join(',') || 'none');

  await page.locator('.record-btn').nth(1).click();
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, 'detail-390.png'), fullPage: true });
  const axe2 = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  fs.writeFileSync(path.join(OUT, 'axe-detail.json'), JSON.stringify(axe2, null, 2));
  rec('axe detail violations', axe2.violations.length === 0, axe2.violations.map(v => v.id).join(',') || 'none');
  rec('axe detail incomplete', axe2.incomplete.length === 0, axe2.incomplete.map(v => v.id).join(',') || 'none');

  await page.setViewportSize({ width: 1440, height: 950 });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, 'detail-1440.png'), fullPage: true });

  // focus ring visibility computed check
  await page.click('[data-back]');
  await page.waitForTimeout(120);
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => document.body.focus());
  const rings = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const a = document.activeElement;
      const t = a.matches('.chip input') ? a.nextElementSibling : a;
      const s = getComputedStyle(t);
      return { name: (a.id || a.className || a.tagName), vis: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2, o: s.outlineStyle + '/' + s.outlineWidth };
    });
    rings.push(r);
    if (r.name.indexOf('record-btn') !== -1) break;
  }
  rec('focus rings via real Tab traversal', rings.length > 2 && rings.every(r => r.vis), rings.map(r => r.name + ':' + r.o).join(' '));
  const tabOrder = await page.evaluate(async () => {
    document.body.focus();
    const seen = [];
    for (let i = 0; i < 12; i++) {
      const ev = new KeyboardEvent('keydown', { key: 'Tab' });
      document.dispatchEvent(ev);
      await new Promise(r => setTimeout(r, 5));
      const a = document.activeElement;
      seen.push(a.id || a.className || a.tagName);
      if (a.matches('[data-open="LS-02"]')) break;
    }
    return seen.join(' > ');
  });
  rec('keyboard order reaches records', /record-btn/.test(tabOrder), tabOrder);

  rec('no JS/console errors', errors.length === 0, errors.join(' | ') || 'none');

  await browser.close();
  const failed = results.filter(r => !r.ok);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  console.log('\nSUMMARY: ' + (results.length - failed.length) + '/' + results.length + ' passed');
  if (failed.length) console.log('FAILED: ' + failed.map(f => f.name).join('; '));
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('SCRIPT ERROR', e); process.exit(2); });

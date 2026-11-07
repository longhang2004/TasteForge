// Rendered checks for the Lantern Slide Lecture Archive slice.
// Module root: examples/inventory-workbench/tools/node_modules (playwright 1.64.1, @axe-core/playwright 4.14.0)
const NM = 'file:///mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/';
const pw = await import(NM + 'playwright/index.js');
const chromium = pw.chromium || pw.default.chromium;
const axeMod = await import(NM + '@axe-core/playwright/dist/index.js');
const AxeBuilder = axeMod.AxeBuilder || axeMod.default;
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.argv[2] || 'http://127.0.0.1:4181/00.html';
const OUT = path.resolve(process.argv[3] || './out');
const WIDTHS = [320, 390, 1440];

const results = [];
const raw = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

async function noOverflow(page, label) {
  const m = await page.evaluate(() => {
    const de = document.documentElement;
    const widest = [...document.querySelectorAll('body *')]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.right > de.clientWidth + 1 || r.left < -1)
      .map(({ el, r }) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 30)} right=${Math.round(r.right)}`);
    return { scrollW: de.scrollWidth, clientW: de.clientWidth, widest: widest.slice(0, 6) };
  });
  check(`no horizontal overflow @ ${label}`, m.scrollW <= m.clientW + 1,
    `scrollWidth=${m.scrollW} clientWidth=${m.clientW}${m.widest.length ? ' offenders=' + m.widest.join(' | ') : ''}`);
  return m;
}

async function shot(page, width, name) {
  const n = `w${width}-${name}`;
  await page.screenshot({ path: path.join(OUT, 'shots', n + '.png'), fullPage: false });
  return `shots/${n}.png`;
}

const browser = await chromium.launch();
try {
  await mkdir(path.join(OUT, 'shots'), { recursive: true });

  // ---------- PASS A: widths, overflow, list states ----------
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 780 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('requestfailed', (r) => errors.push('requestfailed ' + r.url()));
    const reqs = [];
    const origin = new URL(BASE).origin;
    page.on('request', (r) => { if (!r.url().startsWith(origin)) reqs.push(r.url()); });

    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForSelector('.record');

    const tag = `list/${width}px`;
    await noOverflow(page, tag);
    const shots = [];
    shots.push(await shot(page, width, '01-list'));

    // count present
    const count0 = (await page.locator('#count').innerText()).trim();
    check(`matching count shown @ ${tag}`, /5/.test(count0), `count="${count0}"`);
    const n0 = await page.locator('.record').count();
    check(`all 5 records listed @ ${tag}`, n0 === 5, `rows=${n0}`);

    // long title + duplicate present and readable
    const longTitle = await page.locator('.rec-title', { hasText: 'River weir cross-section' }).count();
    check(`long title present @ ${tag}`, longTitle === 1, '');
    const dupRow = page.locator('.record[data-record="LS-19"]');
    check(`duplicate LS-19 listed @ ${tag}`, await dupRow.count() === 1, '');
    const dupText = (await dupRow.innerText()).replace(/\s+/g, ' ');
    check(`LS-19 labelled duplicate @ ${tag}`,
      /duplicate/i.test(dupText) && /LS-02/.test(dupText),
      dupText.slice(0, 160));

    // search by title
    await page.locator('#q').fill('coastal');
    await page.waitForFunction(() => document.querySelectorAll('.record').length === 2);
    const nCoastal = await page.locator('.record').count();
    const ids = await page.locator('.record').evaluateAll((els) => els.map((e) => e.dataset.record));
    check(`search by title "coastal" @ ${tag}`, nCoastal === 2 && ids.join(',') === 'LS-02,LS-19',
      `n=${nCoastal} ids=${ids.join(',')}`);
    const c1 = (await page.locator('#count').innerText()).trim();
    check(`count reflects filter @ ${tag}`, /2/.test(c1) && /5/.test(c1), `count="${c1}"`);

    // search by series name
    await page.locator('#q').fill('Craft Teaching');
    await page.waitForFunction(() => document.querySelectorAll('.record').length === 2);
    const craftIds = await page.locator('.record').evaluateAll((e) => e.map((x) => x.dataset.record));
    check(`search by series text @ ${tag}`, craftIds.join(',') === 'LS-07,LS-14', `ids=${craftIds.join(',')}`);

    // series filter combined
    await page.locator('#q').fill('');
    await page.waitForFunction(() => document.querySelectorAll('.record').length === 5);
    await page.getByRole('radio', { name: /Field Surveys/ }).check();
    await page.waitForFunction(() => document.querySelectorAll('.record').length === 3);
    const fsIds = await page.locator('.record').evaluateAll((e) => e.map((x) => x.dataset.record));
    check(`series filter Field Surveys @ ${tag}`, fsIds.join(',') === 'LS-02,LS-11,LS-19', `ids=${fsIds.join(',')}`);

    // empty state + reset
    await page.locator('#q').fill('zzzznomatch');
    await page.waitForSelector('#empty:not([hidden])');
    check(`empty state appears @ ${tag}`, await page.locator('#empty').isVisible(), '');
    check(`records list hidden when empty @ ${tag}`, !(await page.locator('#records').isVisible()), '');
    shots.push(await shot(page, width, '02-empty'));
    await noOverflow(page, `${tag}/empty`);
    const resetBtn = page.getByRole('button', { name: /Clear search and show all 5 records/i });
    check(`empty reset control present @ ${tag}`, await resetBtn.count() === 1, '');
    await resetBtn.click();
    await page.waitForFunction(() => document.querySelectorAll('.record').length === 5);
    const afterReset = (await page.locator('#count').innerText()).trim();
    const qAfter = await page.locator('#q').inputValue();
    const allAfter = await page.locator('.record').count();
    check(`reset restores results @ ${tag}`, allAfter === 5 && qAfter === '', `rows=${allAfter} q="${qAfter}" count="${afterReset}"`);

    // ---------- detail + back retention ----------
    await page.locator('#q').fill('coastal');
    await page.waitForFunction(() => document.querySelectorAll('.record').length === 2);
    await page.getByRole('radio', { name: /Field Surveys/ }).check();
    await page.waitForFunction(() => document.querySelectorAll('.record').length === 2);
    const beforeOrder = await page.locator('.record').evaluateAll((e) => e.map((x) => x.dataset.record));
    const opener = page.locator('#records [data-open="LS-19"]');
    await opener.focus();
    await opener.click();
    await page.waitForSelector('#detailView:not([hidden])');
    await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'detailTitle');
    const focusOnTitle = await page.evaluate(() => document.activeElement.id);
    check(`detail heading receives focus @ ${tag}`, focusOnTitle === 'detailTitle', `active=${focusOnTitle}`);
    shots.push(await shot(page, width, '03-detail-LS19'));

    const detailText = (await page.locator('#detailArticle').innerText()).replace(/\s+/g, ' ');
    for (const fact of ['LS-19', 'Field Surveys', 'Hand-tinted glass', 'undated', '8.3 × 8.3 cm',
      'Duplicate of LS-02; second copy, not a different photograph']) {
      check(`detail shows "${fact}" @ ${tag}`, detailText.includes(fact), '');
    }
    check(`detail states image is schematic placeholder @ ${tag}`,
      /schematic/i.test(detailText) && /not the archival/i.test(detailText), '');
    check(`detail does not present LS-19 as a new photograph @ ${tag}`,
      /second copy/i.test(detailText) && /not a separate photograph|not a different photograph/i.test(detailText), '');
    await noOverflow(page, `${tag}/detail-LS19`);

    // keyboard: back via button, retention
    await page.locator('#back').focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('#listView:not([hidden])');
    const qRet = await page.locator('#q').inputValue();
    const seriesRet = await page.locator('input[name="series"]:checked').getAttribute('value');
    const afterOrder = await page.locator('.record').evaluateAll((e) => e.map((x) => x.dataset.record));
    const focusBack = await page.evaluate(() => {
      const a = document.activeElement;
      return { tag: a.tagName, open: a.getAttribute && a.getAttribute('data-open'), text: (a.textContent || '').trim().slice(0, 50) };
    });
    check(`back retains query @ ${tag}`, qRet === 'coastal', `q="${qRet}"`);
    check(`back retains series filter @ ${tag}`, seriesRet === 'Field Surveys', `series="${seriesRet}"`);
    check(`back retains result order @ ${tag}`, afterOrder.join(',') === beforeOrder.join(','),
      `before=${beforeOrder.join(',')} after=${afterOrder.join(',')}`);
    check(`back restores focus to opened record @ ${tag}`, focusBack.open === 'LS-19',
      `active=${focusBack.tag} data-open=${focusBack.open}`);
    shots.push(await shot(page, width, '04-back-retained'));

    // Escape also returns and restores focus
    await page.locator('#records [data-open="LS-02"]').click();
    await page.waitForSelector('#detailView:not([hidden])');
    await page.keyboard.press('Escape');
    await page.waitForSelector('#listView:not([hidden])');
    const escFocus = await page.evaluate(() => document.activeElement.getAttribute && document.activeElement.getAttribute('data-open'));
    check(`Escape returns and restores focus @ ${tag}`, escFocus === 'LS-02', `active data-open=${escFocus}`);

    // keyboard reachability: tab from document start reaches search field
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForSelector('.record');
    const tabOrder = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      tabOrder.push(await page.evaluate(() => {
        const a = document.activeElement;
        return a ? `${a.tagName}${a.id ? '#' + a.id : ''}${a.getAttribute && a.getAttribute('data-open') ? '[open:' + a.getAttribute('data-open') + ']' : ''}` : 'none';
      }));
    }
    check(`keyboard reaches search + filters + records @ ${tag}`,
      tabOrder.some((t) => t.includes('#q')) && tabOrder.some((t) => t === 'INPUT') && tabOrder.some((t) => t.includes('open:')),
      tabOrder.join(' > '));

    // focus visible outline present
    await page.locator('#q').focus();
    const outline = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement);
      return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
    });
    check(`search field shows a focus indicator @ ${tag}`, outline.style !== 'none' && parseFloat(outline.w) >= 2,
      JSON.stringify(outline));

    // ---------- axe ----------
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForSelector('.record');
    const axeList = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
    raw.push({ width, state: 'list', violations: axeList.violations, incomplete: axeList.incomplete, passes: axeList.passes.map((p) => p.id) });
    check(`axe list violations @ ${tag}`, axeList.violations.length === 0,
      axeList.violations.map((v) => `${v.id}(${v.nodes.length})`).join(', ') || 'none');
    console.log(`       axe incomplete @ ${tag}: ` +
      (axeList.incomplete.map((v) => `${v.id}(${v.nodes.length})`).join(', ') || 'none'));

    // axe on detail state (LS-19 duplicate + long-title record)
    await page.locator('#q').fill('coastal');
    await page.waitForFunction(() => document.querySelectorAll('.record').length === 2);
    await page.locator('#records [data-open="LS-19"]').click();
    await page.waitForSelector('#detailView:not([hidden])');
    const axeDetail = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
    raw.push({ width, state: 'detail-LS19', violations: axeDetail.violations, incomplete: axeDetail.incomplete });
    check(`axe detail violations @ ${tag}`, axeDetail.violations.length === 0,
      axeDetail.violations.map((v) => `${v.id}(${v.nodes.length})`).join(', ') || 'none');
    console.log(`       axe incomplete @ ${tag}/detail: ` +
      (axeDetail.incomplete.map((v) => `${v.id}(${v.nodes.length})`).join(', ') || 'none'));

    // long title detail at this width
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForSelector('.record');
    await page.locator('#records [data-open="LS-11"]').click();
    await page.waitForSelector('#detailView:not([hidden])');
    const longDetail = (await page.locator('#detailArticle').innerText()).replace(/\s+/g, ' ');
    check(`LS-11 detail shows revised-plate condition @ ${tag}`,
      longDetail.includes('Clean; revised plate replaces an earlier figure') &&
      longDetail.includes('10 × 8.3 cm') && longDetail.includes('1924'), '');
    await noOverflow(page, `${tag}/detail-LS11`);
    shots.push(await shot(page, width, '05-detail-LS11'));

    check(`no page JS errors or failed requests @ ${tag}`, errors.length === 0, errors.join(' | ') || 'none');
    check(`no external requests @ ${tag}`, reqs.length === 0, reqs.slice(0, 5).join(', ') || 'none');

    await ctx.close();
  }
} finally {
  await browser.close();
}

const passed = results.filter((r) => r.pass).length;
const failed = results.filter((r) => !r.pass);
const axeViol = raw.reduce((a, r) => a + r.violations.length, 0);
const axeInc = raw.reduce((a, r) => a + r.incomplete.length, 0);
await writeFile(path.join(OUT, 'checks-summary.json'), JSON.stringify({
  base: BASE,
  ranAtUtc: new Date().toISOString(),
  widths: WIDTHS,
  total: results.length, passed, failed: failed.length,
  results,
  axe: { violationCount: axeViol, incompleteCount: axeInc, raw },
}, null, 2) + '\n');
console.log(`\nSUMMARY ${passed}/${results.length} passed, ${failed.length} failed; axe violations=${axeViol} incomplete=${axeInc}`);
if (failed.length) { console.log('FAILED CHECKS:'); failed.forEach((f) => console.log(' - ' + f.name + ' :: ' + f.detail)); }
process.exit(failed.length ? 1 : 0);

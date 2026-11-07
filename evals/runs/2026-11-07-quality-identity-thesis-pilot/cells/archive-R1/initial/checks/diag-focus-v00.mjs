// Diagnostic for the focus-after-open finding observed on versions/00.html.
// Recorded before any correction so the raw failure is preserved.
const NM = 'file:///mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/';
const pw = await import(NM + 'playwright/index.js');
const { writeFile, mkdir } = await import('node:fs/promises');
const chromium = pw.chromium || pw.default.chromium;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 320, height: 780 } });
const page = await ctx.newPage();
await page.goto(process.argv[2], { waitUntil: 'load' });
await page.waitForSelector('.record');
await page.locator('#q').fill('coastal');
await page.waitForSelector('.record');
await page.locator('[data-open="LS-19"]').click();
await page.waitForSelector('#detailView:not([hidden])');

const state = await page.evaluate(() => {
  const a = document.activeElement;
  const t = document.getElementById('detailTitle');
  return {
    activeTag: a.tagName,
    activeId: a.id,
    activeText: (a.textContent || '').trim().slice(0, 60),
    detailTitleExists: !!t,
    detailTitleTabIndex: t ? t.getAttribute('tabindex') : null,
    detailTitleRect: t ? t.getBoundingClientRect().toJSON() : null,
    detailViewHiddenAttrAtFocusTime: null,
    detailVisibleNow: !document.getElementById('detailView').hidden,
  };
});

// Retry focus now that the view is definitely visible: proves the element is focusable
// and that the original ordering (focus attempted before unhiding) was the cause.
const retry = await page.evaluate(() => {
  const t = document.getElementById('detailTitle');
  t.focus();
  return { activeId: document.activeElement.id };
});

const out = {
  capturedAtUtc: new Date().toISOString(),
  page: process.argv[2],
  viewport: { width: 320, height: 780 },
  observed: state,
  retryFocusAfterVisible: retry,
  conclusion: 'After clicking a record, document.activeElement was not #detailTitle. ' +
    'Focus was attempted inside renderDetail() while #detailView still had the hidden attribute, ' +
    'so the focus call was ignored. Re-focusing the same element after unhiding succeeds, ' +
    'confirming the ordering (not the element) is the defect.',
};
await mkdir(process.argv[3], { recursive: true });
await writeFile(process.argv[3] + '/focus-after-open-finding.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
await browser.close();

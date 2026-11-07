const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:4189';
const OUT = process.env.OUT || '/tmp/freight-check';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function log(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' :: ' + detail : ''));
}

(async () => {
  const browser = await chromium.launch();
  const errs = [];
  for (const width of [320, 390, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') errs.push(width + ' console: ' + m.text()); });
    page.on('pageerror', e => errs.push(width + ' pageerror: ' + e.message));
    await page.goto(BASE + '/index.html', { waitUntil: 'load' });

    // no horizontal overflow
    const docW = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    log('width ' + width + ' no horizontal overflow', docW.sw <= docW.cw + 1, JSON.stringify(docW));

    // empty state
    const emptyVisible = await page.locator('#empty-panel').isVisible();
    log('width ' + width + ' empty state shown', emptyVisible);

    // select HC-114 (excursion)
    await page.locator('#pick-HC-114').check();
    const title = await page.locator('#detail-title').innerText();
    log('width ' + width + ' select HC-114', /HC-114/.test(title), title);
    const releaseDisabled = await page.locator('#decision-release').isDisabled();
    log('width ' + width + ' release blocked for HC-114', releaseDisabled);
    const blockVisible = await page.locator('#release-block').isVisible();
    log('width ' + width + ' blocked explanation visible', blockVisible);
    const blockText = await page.locator('#release-block-reason').innerText();
    log('width ' + width + ' blocked reason cites reading', /Reading 3/.test(blockText) && /0\.6/.test(blockText), blockText);

    // rows
    const rowCount = await page.locator('#readings-body tr').count();
    log('width ' + width + ' four reading rows', rowCount === 4, String(rowCount));
    const aboveCount = await page.locator('#readings-body tr.is-above').count();
    log('width ' + width + ' one excursion row', aboveCount === 1, String(aboveCount));

    // actions reachable (not clipped)
    const btnBox = await page.locator('#review-button').boundingBox();
    log('width ' + width + ' review button laid out', !!btnBox && btnBox.width > 0, JSON.stringify(btnBox));

    // validation: submit empty
    await page.locator('#review-button').click();
    const errVisible = await page.locator('#form-error-summary').isVisible();
    log('width ' + width + ' validation summary on empty submit', errVisible);
    const errText = await page.locator('#form-error-summary').innerText();
    log('width ' + width + ' validation mentions decision+note', /Release or Hold/.test(errText) && /note/i.test(errText), errText.replace(/\n/g, ' | '));

    // focus moved to summary
    const focused = await page.evaluate(() => document.activeElement && document.activeElement.id);
    log('width ' + width + ' focus to error summary', focused === 'form-error-summary', focused);

    // short note
    await page.locator('#decision-hold').check();
    await page.locator('#decision-note').fill('too short');
    // 8 chars -> 9 chars? count
    await page.locator('#review-button').click();
    const errText2 = await page.locator('#form-error-summary').innerText();
    log('width ' + width + ' short note rejected', /at least 10/.test(errText2), errText2.replace(/\n/g, ' | '));

    // valid
    await page.locator('#decision-note').fill('Third reading is above limit; holding for supervisor review.');
    const counter = await page.locator('#note-counter').innerText();
    log('width ' + width + ' counter updates', /\d+ \/ 120/.test(counter), counter);
    await page.locator('#review-button').click();
    const reviewVisible = await page.locator('#review-panel').isVisible();
    log('width ' + width + ' review shown', reviewVisible);
    const reviewText = await page.locator('#review-panel').innerText();
    log('width ' + width + ' review has consignment/weight/dock/note',
      /HC-114/.test(reviewText) && /42\.5 kg/.test(reviewText) && /Dock B/.test(reviewText) && /supervisor review/.test(reviewText));

    await page.screenshot({ path: path.join(OUT, 'review-' + width + '.png'), fullPage: true });

    // edit retains
    await page.locator('#edit-button').click();
    const keptNote = await page.locator('#decision-note').inputValue();
    const keptHold = await page.locator('#decision-hold').isChecked();
    log('width ' + width + ' edit retains note+decision', /supervisor/.test(keptNote) && keptHold);

    // submit fails then retry
    await page.locator('#review-button').click();
    await page.locator('#submit-button').click();
    await page.waitForSelector('#submit-error', { timeout: 5000 });
    const failText = await page.locator('#submit-error').innerText();
    log('width ' + width + ' first submit fails with recovery', /failed/i.test(failText) && /unchanged/i.test(failText), failText.replace(/\n/g, ' | '));
    await page.screenshot({ path: path.join(OUT, 'failure-' + width + '.png'), fullPage: true });
    const keptAfterFail = await page.locator('#review-summary').innerText();
    log('width ' + width + ' facts retained after failure', /42\.5 kg/.test(keptAfterFail) && /supervisor review/.test(keptAfterFail));
    await page.locator('#retry-button').click();
    await page.waitForSelector('#success-panel:not([hidden])', { timeout: 5000 });
    const successText = await page.locator('#success-panel').innerText();
    log('width ' + width + ' retry succeeds', /Decision recorded: Hold/.test(successText));
    log('width ' + width + ' success disclaimer', /No real shipment, release or food-safety determination occurred/.test(successText));
    await page.screenshot({ path: path.join(OUT, 'success-' + width + '.png'), fullPage: true });

    // changing consignment clears
    await page.locator('#restart-button').click();
    await page.locator('#pick-HC-118').check();
    const afterSwitchNote = await page.locator('#decision-note').inputValue();
    const afterSwitchHold = await page.locator('#decision-hold').isChecked();
    log('width ' + width + ' consignment change clears decision+note', afterSwitchNote === '' && !afterSwitchHold);
    const hc118Release = await page.locator('#decision-release').isDisabled();
    log('width ' + width + ' HC-118 release enabled', !hc118Release);

    await ctx.close();
  }

  // keyboard-only pass at 390
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/index.html');
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement.textContent.trim());
  log('keyboard skip link first', /Skip to consignment/.test(first), first);
  await page.keyboard.press('Enter');
  const hash = await page.evaluate(() => location.hash);
  log('skip link targets main', hash === '#main', hash);
  await ctx.close();

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  if (errs.length) { console.log('JS ERRORS:\n' + errs.join('\n')); }
  const failed = results.filter(r => !r.pass).length;
  console.log('--- ' + (results.length - failed) + '/' + results.length + ' passed, errors=' + errs.length);
  process.exit(failed || errs.length ? 1 : 0);
})();

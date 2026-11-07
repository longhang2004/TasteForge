const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
const BASE = 'http://127.0.0.1:4189';
const results = [];
function log(name, pass, detail) { results.push({ name, pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' :: ' + detail : '')); }

function lum(rgb) {
  const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
function parse(css) {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map(s => parseFloat(s));
  return [p[0], p[1], p[2]];
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/index.html');

  // each consignment state
  const expect = {
    'HC-114': { n: 1, release: false, rows: 1 },
    'HC-118': { n: 0, release: true, rows: 0 },
    'HC-121': { n: 2, release: false, rows: 2 },
    'HC-126': { n: 0, release: true, rows: 0 }
  };
  for (const id of Object.keys(expect)) {
    await page.locator('#pick-' + id).check();
    const disabled = await page.locator('#decision-release').isDisabled();
    const rows = await page.locator('#readings-body tr.is-above').count();
    const verdict = await page.locator('#verdict').innerText();
    log(id + ' excursion count/block/' + expect[id].n, disabled === !expect[id].release && rows === expect[id].rows, 'disabled=' + disabled + ' rows=' + rows);
    if (expect[id].n === 2) {
      log('HC-121 verdict lists both', /2 of 4 readings above/.test(verdict), verdict.replace(/\n/g, ' | '));
      const reason = await page.locator('#release-block-reason').innerText();
      log('HC-121 block reason cites reading 1', /Reading 1 is 0\.3/.test(reason), reason);
    }
    if (expect[id].n === 0) {
      const blockShown = await page.locator('#release-block').isVisible();
      log(id + ' no block message when clear', !blockShown);
    }
  }

  // contrast on visible text pairs
  const pairs = await page.evaluate(() => {
    const els = [...document.querySelectorAll('body *')].filter(e => {
      const t = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (!t) return false;
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    return els.map(e => {
      let bgEl = e, bg = 'rgba(0, 0, 0, 0)';
      while (bgEl && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) { bg = getComputedStyle(bgEl).backgroundColor; bgEl = bgEl.parentElement; }
      const cs = getComputedStyle(e);
      return { tag: e.tagName + '.' + (e.className || '').toString().split(' ')[0], text: e.textContent.trim().slice(0, 40), fg: cs.color, bg, size: parseFloat(cs.fontSize), weight: cs.fontWeight };
    });
  });
  let worst = { r: 99 };
  pairs.forEach(p => {
    const f = parse(p.fg), b = parse(p.bg);
    if (!f || !b) return;
    const r = ratio(f, b);
    if (r < worst.r) worst = { r, p };
  });
  log('lowest computed text contrast >= 4.5', worst.r >= 4.5, worst.r.toFixed(2) + ' ' + (worst.p ? worst.p.tag + ' "' + worst.p.text + '"' : ''));

  // zoom 200% reflow proxy: set viewport width 320 with 200% text
  const ctx2 = await browser.newContext({ viewport: { width: 320, height: 800 } });
  const p2 = await ctx2.newPage();
  await p2.goto(BASE + '/index.html');
  await p2.locator('#pick-HC-114').check();
  const overflow = await p2.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  log('320 no overflow on detail', overflow.sw <= overflow.cw + 1, JSON.stringify(overflow));

  // long error text: 120+ note
  await p2.locator('#decision-hold').check();
  await p2.locator('#decision-note').fill('x'.repeat(140));
  await p2.locator('#review-button').click();
  const longErr = await p2.locator('#note-error').innerText();
  const longOverflow = await p2.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  log('long note error shown and no overflow', /shorten it to 120/.test(longErr) && longOverflow.sw <= longOverflow.cw + 1, longErr + ' ' + JSON.stringify(longOverflow));

  // focus visible: computed outline on focused radio and button
  await p2.keyboard.press('Tab');
  const focusInfo = await p2.evaluate(() => {
    const a = document.activeElement;
    return { id: a.id || a.tagName, outline: getComputedStyle(a).outlineStyle, w: getComputedStyle(a).outlineWidth };
  });
  log('focus ring present', focusInfo.outline !== 'none' && parseFloat(focusInfo.w) >= 2, JSON.stringify(focusInfo));

  await browser.close();
  const failed = results.filter(r => !r.pass).length;
  console.log('--- ' + (results.length - failed) + '/' + results.length + ' passed');
  process.exit(failed ? 1 : 0);
})();

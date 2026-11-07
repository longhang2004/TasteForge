const { chromium } = require('/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/playwright');
const BASE = 'http://127.0.0.1:4189';

function lum(rgb) {
  const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
function parse(css) {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map(s => parseFloat(s));
  if (p.length === 4 && p[3] < 1) return null;
  return [p[0], p[1], p[2]];
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/index.html');
  await page.locator('#pick-HC-114').check();

  const pairs = await page.evaluate(() => {
    const els = [...document.querySelectorAll('body *')].filter(e => {
      const t = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (!t) return false;
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    return els.map(e => {
      let bgEl = e, bg = getComputedStyle(e).backgroundColor;
      while (bgEl && (parse(bg)) === null) { bgEl = bgEl.parentElement; if (!bgEl) break; bg = getComputedStyle(bgEl).backgroundColor; }
      const cs = getComputedStyle(e);
      return { sel: e.tagName + '.' + String(e.className).split(' ')[0], text: e.textContent.trim().slice(0, 34), fg: cs.color, bg, size: parseFloat(cs.fontSize), weight: cs.fontWeight };
    });
    function parse(c) { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(parseFloat); if (p.length === 4 && p[3] < 1) return null; return p; }
  });

  const bad = [];
  pairs.forEach(p => {
    const f = parse(p.fg), b = parse(p.bg);
    if (!f || !b) return;
    const r = ratio(f, b);
    const large = p.size >= 24 || (p.size >= 18.66 && parseInt(p.weight, 10) >= 700);
    const need = large ? 3 : 4.5;
    if (r < need) bad.push({ ...p, r: r.toFixed(2), need });
  });
  console.log('pairs checked: ' + pairs.length + ', below threshold: ' + bad.length);
  console.log(JSON.stringify(bad, null, 1));

  for (const width of [320, 390, 1440]) {
    const c = await browser.newContext({ viewport: { width, height: 800 } });
    const pg = await c.newPage();
    await pg.goto(BASE + '/index.html');
    const states = [['initial', 0], ['detail', 1], ['review', 2], ['failure', 3], ['success', 4]];
    for (const [name, step] of states) {
      if (step === 1) await pg.locator('#pick-HC-114').check();
      if (step === 2) {
        await pg.locator('#decision-hold').check();
        await pg.locator('#decision-note').fill('Third reading is above limit; holding for supervisor review.');
        await pg.locator('#review-button').click();
      }
      if (step === 3) { await pg.locator('#submit-button').click(); await pg.waitForSelector('#submit-error'); }
      if (step === 4) { await pg.locator('#retry-button').click(); await pg.waitForSelector('#success-panel:not([hidden])'); }
      const o = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      console.log(width + ' ' + name + ' overflow=' + (o.sw - o.cw) + 'px');
    }
    await c.close();
  }
  await browser.close();
})();

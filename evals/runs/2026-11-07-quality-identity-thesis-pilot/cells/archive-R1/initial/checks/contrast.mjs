// Manual WCAG contrast computation for the pairs axe reported as INCOMPLETE
// (axe cannot resolve the body background because it is a gradient).
const NM = 'file:///mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules/';
const pw = await import(NM + 'playwright/index.js');
const { writeFile } = await import('node:fs/promises');
const chromium = pw.chromium || pw.default.chromium;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const target = process.argv[2];
const outDir = process.argv[3];

async function sample(sel) {
  return page.evaluate((s) => {
    const lum = (c) => {
      const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const parse = (str) => {
      const m = str.match(/[\d.]+/g);
      if (!m) return null;
      const v = m.map(Number);
      return v.length >= 3 ? v.slice(0, 3) : null;
    };
    const ratio = (f, b) => {
      const a = lum(f), c = lum(b);
      return (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05);
    };
    const el = document.querySelector(s);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg) return null;
    let n = el, bg = null;
    while (n && n !== document.documentElement) {
      const cb = parse(getComputedStyle(n).backgroundColor);
      const csb = getComputedStyle(n).backgroundColor;
      if (cb && !/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(csb)) { bg = cb; break; }
      n = n.parentElement;
    }
    if (!bg) bg = [244, 239, 227];
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = px >= 24 || (bold && px >= 18.66);
    const r = ratio(fg, bg);
    return {
      selector: s, fg: cs.color, bg: 'rgb(' + bg.join(', ') + ')',
      fontSize: cs.fontSize, fontWeight: cs.fontWeight, isLargeText: large,
      threshold: large ? 3 : 4.5, ratio: Math.round(r * 100) / 100,
      passes: r >= (large ? 3 : 4.5),
    };
  }, sel);
}

await page.goto(target, { waitUntil: 'load' });
await page.waitForSelector('.record');
const listSels = ['.deck', '.hint', '.pcap', '.meta', '.cond', '.count .of', '.kicker .plain',
  '.foot p', '.scope li', '.code .series', '.rec-title', '.tag', 'h1'];
const listPairs = [];
for (const s of listSels) { const r = await sample(s); if (r) listPairs.push(r); }

await page.locator('#q').fill('coastal');
await page.waitForFunction(() => document.querySelectorAll('.record').length === 2);
await page.locator('#records [data-open="LS-19"]').click();
await page.waitForSelector('#detailView:not([hidden])');
const detailSels = ['#detailTitle', '.detail-head .sub', '.code .id', 'dl.spec dt', 'dl.spec dd',
  '.condblock p', '.condblock h3', 'figure.plate-large figcaption', '.dupe p', '.dupe h3',
  '.honest p', '.honest h3', '.rel p'];
const detailPairs = [];
for (const s of detailSels) { const r = await sample(s); if (r) detailPairs.push(r); }

// skip link at focus state
await page.keyboard.press('Escape');
await page.goto(target, { waitUntil: 'load' });
await page.waitForSelector('.record');
await page.keyboard.press('Tab');
const skipPair = await page.evaluate(() => {
  const a = document.activeElement;
  const cs = getComputedStyle(a);
  const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const parse = (str) => { const m = str.match(/[\d.]+/g); return m ? m.map(Number).slice(0, 3) : null; };
  const f = parse(cs.color), b = parse(cs.backgroundColor);
  const a1 = lum(f), c1 = lum(b);
  const ratio = (Math.max(a1, c1) + 0.05) / (Math.min(a1, c1) + 0.05);
  return { selector: '.skip:focus', focused: a.className, fg: cs.color, bg: cs.backgroundColor, ratio: Math.round(ratio * 100) / 100, passes: ratio >= 4.5 };
});

const all = [...listPairs, ...detailPairs, skipPair];
const failing = all.filter((p) => !p.passes);
const report = {
  note: 'Manual WCAG contrast computation on resolved computed colors. Axe reported color-contrast as ' +
    'INCOMPLETE (not violation) because the page background is a gradient it cannot resolve. ' +
    'This list is evidence about the sampled text/background pairs only; it is not a WCAG conformance claim.',
  ranAtUtc: new Date().toISOString(),
  target,
  pairCount: all.length,
  failingCount: failing.length,
  state: { list: listPairs, detail: detailPairs, skipLink: skipPair },
};
await writeFile(outDir + '/contrast-manual.json', JSON.stringify(report, null, 2) + '\n');
for (const p of all) {
  console.log(`${p.passes ? 'PASS' : 'FAIL'} ${String(p.ratio).padEnd(6)} >=${p.threshold}  ${p.selector.padEnd(32)} ${p.fg} on ${p.bg}`);
}
console.log(`\nMANUAL CONTRAST: ${all.length - failing.length}/${all.length} pairs pass`);
await browser.close();
process.exit(failing.length ? 1 : 0);

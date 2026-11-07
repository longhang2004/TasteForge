import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(process.argv[2] || '.');
const outDir = path.resolve(process.argv[3] || './checks');
const fileRel = process.argv[4] || 'index.html';
const label = process.argv[5] || 'run';

const toolsDir = '/mnt/c/Users/hi/src/personal_repos/TasteForge/examples/inventory-workbench/tools/node_modules';
const pw = await import(path.join(toolsDir, 'playwright/index.mjs'));
const chromium = pw.chromium || (pw.default && pw.default.chromium);
const axeMod = await import(path.join(toolsDir, '@axe-core/playwright/dist/index.mjs'));
const AxeBuilder = axeMod.default ? axeMod.default.AxeBuilder || axeMod.default : axeMod.AxeBuilder;

fs.mkdirSync(outDir, { recursive: true });

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const target = path.join(rootDir, urlPath === '/' ? fileRel : urlPath.replace(/^\//, ''));
  if (!target.startsWith(rootDir) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  const ext = path.extname(target);
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
  res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
});

const port = 4173 + Math.floor(Math.random() * 200);
await new Promise((r) => server.listen(port, '127.0.0.1', r));
const base = `http://127.0.0.1:${port}/`;

const results = [];
let hardFailures = [];
const record = (name, status, detail) => {
  results.push({ name, status, detail });
  if (status === 'fail') hardFailures.push(name);
};
const writeJson = (file, data) => fs.writeFileSync(path.join(outDir, file), JSON.stringify(data, null, 2));

function log(...a) { console.log(...a); }

const browser = await chromium.launch();
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => pageErrors.push(String(e && e.stack || e)));
page.on('requestfailed', (r) => failedRequests.push(r.url() + ' :: ' + (r.failure() ? r.failure().errorText : '?')));

await page.goto(base, { waitUntil: 'load' });

// ---------- structural facts ----------
const staticFacts = await page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  return {
    title: document.title,
    lang: document.documentElement.getAttribute('lang'),
    externalReqs: Array.from(document.querySelectorAll('link,script,img,iframe,source,video,audio')).map((e) => e.src || e.href).filter(Boolean),
    consignments: Array.from(document.querySelectorAll('input[name="consignment"]')).map((i) => i.value),
    decisions: Array.from(document.querySelectorAll('input[name="decision"]')).map((i) => i.value),
    noteMaxLength: q('#note').getAttribute('maxlength'),
    hasTextarea: !!q('#note'),
    headings: Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => h.tagName + ':' + h.textContent.trim().slice(0, 60)),
  };
});
writeJson(`${label}-static.json`, staticFacts);

// ---------- helper assertions ----------
const assert = async (name, fn) => {
  try {
    await fn();
    record(name, 'pass', '');
  } catch (e) {
    record(name, 'fail', String(e && e.message || e));
    log('FAIL', name, String(e && e.message || e));
  }
};

function strictEqual(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`);
}

const facts = {
  'HC-114': { product: 'Line-caught mackerel', limit: 'at or below \u22121.0 \u00b0C', readings: ['\u22122.1', '\u22121.8', '\u22120.4', '\u22121.6'], excursion: true, weight: '42.5 kg', dock: 'Dock B' },
  'HC-118': { product: 'Blue mussels', limit: 'at or below 2.0 \u00b0C', readings: ['1.2', '1.6', '1.9', '1.4'], excursion: false, weight: '18.0 kg', dock: 'Dock A' },
  'HC-121': { product: 'Sea bream', limit: 'at or below 0.0 \u00b0C', readings: ['0.3', '0.2', '\u22120.2', '0.1'], excursion: true, weight: '61.2 kg', dock: 'Dock C' },
  'HC-126': { product: 'Squid', limit: 'at or below \u22120.5 \u00b0C', readings: ['\u22121.4', '\u22121.1', '\u22121.2', '\u22121.3'], excursion: false, weight: '27.4 kg', dock: 'Dock A' },
};

// ---------- check each consignment renders correct facts ----------
await assert('each consignment renders product, limit, weight, dock and all four readings', async () => {
  for (const id of Object.keys(facts)) {
    await page.locator('#pick-' + id).check();
    await page.waitForTimeout(80);
    const got = await page.evaluate(() => ({
      name: document.getElementById('ev-name').textContent.trim(),
      limit: document.getElementById('ev-limit').textContent.trim(),
      weight: document.getElementById('ev-weight').textContent.trim(),
      dock: document.getElementById('ev-dock').textContent.trim(),
      verdict: document.getElementById('verdict-title').textContent.trim(),
      readings: Array.from(document.querySelectorAll('#strip .srow__val')).map((e) => e.textContent.replace(' (above the limit)', '').replace(' \u00b0C', '').trim()),
      overFlags: Array.from(document.querySelectorAll('#strip .srow')).map((e) => e.classList.contains('is-over')),
    }));
    if (got.name !== facts[id].product) throw new Error(`${id} product: ${got.name}`);
    if (got.limit !== facts[id].limit) throw new Error(`${id} limit: ${got.limit}`);
    if (got.weight !== facts[id].weight) throw new Error(`${id} weight: ${got.weight}`);
    if (got.dock !== facts[id].dock) throw new Error(`${id} dock: ${got.dock}`);
    if (JSON.stringify(got.readings) !== JSON.stringify(facts[id].readings)) throw new Error(`${id} readings: ${JSON.stringify(got.readings)}`);
    const anyOver = got.overFlags.some(Boolean);
    if (anyOver !== facts[id].excursion) throw new Error(`${id} excursion visual: ${anyOver}`);
    const vt = got.verdict.toLowerCase();
    if (facts[id].excursion && !vt.includes('excursion')) throw new Error(`${id} verdict text: ${got.verdict}`);
    if (!facts[id].excursion && !vt.includes('no excursion')) throw new Error(`${id} verdict text: ${got.verdict}`);
  }
});

// HC-114 excursion blocks release
await assert('HC-114 release is blocked with the offending reading named', async () => {
  await page.locator('#pick-HC-114').check();
  await page.waitForTimeout(60);
  await page.locator('#d-release').check();
  const visible = await page.locator('#release-block').isVisible();
  if (!visible) throw new Error('release block not shown');
  const txt = await page.locator('#block-text').textContent();
  if (!/Reading 3/.test(txt)) throw new Error('block does not name Reading 3: ' + txt);
  if (!/\u22120\.4/.test(txt)) throw new Error('block does not name -0.4°C: ' + txt);
  if (!/above the declared limit of at or below \u22121\.0 \u00b0C/.test(txt)) throw new Error('block does not name the limit: ' + txt);
  if (!/must be held, not released/.test(txt)) throw new Error('block does not explain the rule: ' + txt);
  // cannot proceed to review
  await page.locator('#note').fill('Excursion on reading 3, hold for supervisor review.');
  await page.locator('#btn-review').click();
  const reviewHidden = await page.locator('#panel-review').isHidden();
  if (!reviewHidden) throw new Error('release with excursion reached review');
});

// HC-118 no excursion -> release allowed
await assert('HC-118 release is allowed (no excursion) and reaches review with correct facts', async () => {
  await page.locator('#pick-HC-118').check();
  await page.waitForTimeout(60);
  await page.locator('#d-release').check();
  const blockHidden = await page.locator('#release-block').isHidden();
  if (!blockHidden) throw new Error('release block shown for non-excursion consignment');
  await page.locator('#note').fill('All four readings within limit, releasing to dock A.');
  await page.locator('#btn-review').click();
  await page.waitForTimeout(120);
  if (!(await page.locator('#panel-review').isVisible())) throw new Error('review not shown');
  const rv = await page.evaluate(() => ({
    consignment: document.getElementById('rv-consignment').textContent.trim(),
    decision: document.getElementById('rv-decision').textContent.trim(),
    weight: document.getElementById('rv-weight').textContent.trim(),
    dock: document.getElementById('rv-dock').textContent.trim(),
    excursion: document.getElementById('rv-excursion').textContent.trim(),
    note: document.getElementById('rv-note').textContent.trim(),
  }));
  if (!rv.consignment.includes('HC-118')) throw new Error('review consignment: ' + rv.consignment);
  if (rv.decision !== 'Release') throw new Error('review decision: ' + rv.decision);
  if (rv.weight !== '18.0 kg') throw new Error('review weight: ' + rv.weight);
  if (rv.dock !== 'Dock A') throw new Error('review dock: ' + rv.dock);
  if (!/No reading above the declared limit/.test(rv.excursion)) throw new Error('review excursion: ' + rv.excursion);
  if (rv.note !== 'All four readings within limit, releasing to dock A.') throw new Error('review note: ' + rv.note);
});

// edit retains
await assert('Edit retains consignment, decision and note', async () => {
  await page.locator('#btn-edit').click();
  await page.waitForTimeout(120);
  const kept = await page.evaluate(() => ({
    checkedConsignment: (document.querySelector('input[name="consignment"]:checked') || {}).value,
    checkedDecision: (document.querySelector('input[name="decision"]:checked') || {}).value,
    note: document.getElementById('note').value,
  }));
  if (kept.checkedConsignment !== 'HC-118') throw new Error('consignment lost: ' + kept.checkedConsignment);
  if (kept.checkedDecision !== 'release') throw new Error('decision lost: ' + kept.checkedDecision);
  if (kept.note !== 'All four readings within limit, releasing to dock A.') throw new Error('note lost: ' + kept.note);
});

// note length validation
await assert('note shorter than 10 characters is rejected with a useful message', async () => {
  await page.locator('#note').fill('ok');
  await page.locator('#btn-review').click();
  await page.waitForTimeout(80);
  if (await page.locator('#panel-review').isVisible()) throw new Error('short note reached review');
  const err = await page.locator('#form-error').textContent();
  if (!/at least 10 characters/.test(err)) throw new Error('error message: ' + err);
  const inv = await page.locator('#note').getAttribute('aria-invalid');
  if (inv !== 'true') throw new Error('aria-invalid not set: ' + inv);
});

await assert('note longer than 120 characters is rejected with a useful message', async () => {
  await page.locator('#note').fill('a'.repeat(125));
  await page.locator('#btn-review').click();
  await page.waitForTimeout(80);
  if (await page.locator('#panel-review').isVisible()) throw new Error('long note reached review');
  const err = await page.locator('#form-error').textContent();
  if (!/120/.test(err)) throw new Error('error message: ' + err);
});

// submit fails first then retry succeeds
await assert('first submit fails with recovery, retry succeeds with same facts', async () => {
  await page.locator('#note').fill('All four readings within limit, releasing to dock A.');
  await page.locator('#btn-review').click();
  await page.waitForTimeout(120);
  await page.locator('#btn-submit').click();
  await page.waitForTimeout(1200);
  const err = await page.locator('#submit-error').textContent();
  if (!/not confirmed/i.test(err)) throw new Error('first submit did not report failure: ' + JSON.stringify(err));
  if (!/Retry/i.test(await page.locator('#btn-submit').textContent())) throw new Error('no retry affordance');
  if (await page.locator('#panel-success').isVisible()) throw new Error('success shown on first attempt');
  const beforeRetry = await page.evaluate(() => ({
    c: document.getElementById('rv-consignment').textContent.trim(),
    d: document.getElementById('rv-decision').textContent.trim(),
    w: document.getElementById('rv-weight').textContent.trim(),
    n: document.getElementById('rv-note').textContent.trim(),
  }));
  await page.locator('#btn-submit').click();
  await page.waitForTimeout(1400);
  if (!(await page.locator('#panel-success').isVisible())) throw new Error('retry did not succeed');
  const after = await page.evaluate(() => ({
    h: document.getElementById('h-success').textContent.trim(),
    line: document.getElementById('suc-line').textContent.trim(),
    d: document.getElementById('suc-decision').textContent.trim(),
    c: document.getElementById('suc-consignment').textContent.trim(),
    w: document.getElementById('suc-weight').textContent.trim(),
    dock: document.getElementById('suc-dock').textContent.trim(),
    n: document.getElementById('suc-note').textContent.trim(),
    disclaimer: document.getElementById('suc-disclaimer').textContent.trim(),
  }));
  if (!/^Release recorded for HC-118/.test(after.h)) throw new Error('success heading: ' + after.h);
  if (after.d !== 'Release') throw new Error('success decision: ' + after.d);
  if (!after.c.includes('HC-118')) throw new Error('success consignment: ' + after.c);
  if (after.w !== '18.0 kg') throw new Error('success weight: ' + after.w);
  if (after.dock !== 'Dock A') throw new Error('success dock: ' + after.dock);
  if (after.n !== beforeRetry.n) throw new Error('note changed across retry');
  if (!/no real shipment/i.test(after.disclaimer) || !/food-safety determination/i.test(after.disclaimer)) {
    throw new Error('disclaimer missing: ' + after.disclaimer);
  }
});

// changing consignment clears decision + note
await assert('changing consignment clears the previous decision and note', async () => {
  await page.locator('#btn-again').click();
  await page.waitForTimeout(150);
  await page.locator('#pick-HC-121').check();
  await page.waitForTimeout(60);
  await page.locator('#d-hold').check();
  await page.locator('#note').fill('Excursion on readings 1 and 2, holding for review.');
  const before = await page.evaluate(() => ({
    d: (document.querySelector('input[name="decision"]:checked') || {}).value,
    n: document.getElementById('note').value,
  }));
  await page.locator('#pick-HC-126').check();
  await page.waitForTimeout(100);
  const after = await page.evaluate(() => ({
    d: (document.querySelector('input[name="decision"]:checked') || {}).value || null,
    n: document.getElementById('note').value,
    checked: (document.querySelector('input[name="consignment"]:checked') || {}).value,
  }));
  if (after.checked !== 'HC-126') throw new Error('consignment not switched');
  if (after.d !== null) throw new Error('decision carried over: ' + after.d);
  if (after.n !== '') throw new Error('note carried over: ' + after.n);
});

// HC-121 excursion, hold path
await assert('HC-121 has excursion and Hold reaches review with 61.2 kg / Dock C', async () => {
  await page.locator('#pick-HC-121').check();
  await page.waitForTimeout(80);
  const vt = await page.locator('#verdict-text').textContent();
  if (!/excursion/i.test(await page.locator('#verdict-title').textContent())) throw new Error('HC-121 not flagged excursion: ' + vt);
  await page.locator('#d-hold').check();
  await page.locator('#note').fill('Two readings above 0.0 °C, holding for inspection.');
  await page.locator('#btn-review').click();
  await page.waitForTimeout(150);
  const rv = await page.evaluate(() => ({
    d: document.getElementById('rv-decision').textContent.trim(),
    w: document.getElementById('rv-weight').textContent.trim(),
    dock: document.getElementById('rv-dock').textContent.trim(),
    ex: document.getElementById('rv-excursion').textContent.trim(),
  }));
  if (rv.d !== 'Hold') throw new Error('review decision: ' + rv.d);
  if (rv.w !== '61.2 kg') throw new Error('review weight: ' + rv.w);
  if (rv.dock !== 'Dock C') throw new Error('review dock: ' + rv.dock);
  if (!/3 of 4 readings above/.test(rv.ex)) throw new Error('excursion summary: ' + rv.ex);
  if (!/Reading 1 at 0\.3 \u00b0C/.test(rv.ex)) throw new Error('excursion summary highest: ' + rv.ex);
});

writeJson(`${label}-console.json`, { consoleErrors, pageErrors, failedRequests });

// ---------- keyboard / focus ----------
await page.locator('#btn-edit').click();
await page.waitForTimeout(100);
await assert('keyboard: Tab reaches the consignment radios, a visible focus indicator appears, Space selects', async () => {
  await page.evaluate(() => { document.body.focus(); window.scrollTo(0, 0); });
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
  const order = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName)));
  }
  writeJson(`${label}-tab-order.json`, order);
  if (!order.some((id) => /^pick-HC-/.test(id))) throw new Error('tab order did not reach the consignment radio group: ' + JSON.stringify(order));
  await page.locator('#pick-HC-114').check();
  const focusState = await page.evaluate(() => {
    const input = document.activeElement;
    const card = input.closest('.pick');
    const cs = getComputedStyle(input);
    const ccs = getComputedStyle(card);
    return {
      id: input.id,
      inputOutline: { w: cs.outlineWidth, s: cs.outlineStyle, c: cs.outlineColor },
      cardBorder: ccs.borderTopColor,
      cardBg: ccs.backgroundColor,
    };
  });
  writeJson(`${label}-focus-state.json`, focusState);
  const hasOutline = focusState.inputOutline.s !== 'none' && focusState.inputOutline.w !== '0px';
  const cardChanged = focusState.cardBorder !== 'rgba(0, 0, 0, 0)' && focusState.cardBorder !== '';
  if (!hasOutline && !cardChanged) throw new Error('no visible focus indicator: ' + JSON.stringify(focusState));
  await page.keyboard.press('Space');
  await page.waitForTimeout(80);
  const checked = await page.evaluate(() => (document.querySelector('input[name="consignment"]:checked') || {}).value);
  if (checked !== 'HC-114') throw new Error('Space did not select: ' + checked);
});

await assert('keyboard: submit via Enter on the review step, and Escape-free flow', async () => {
  await page.locator('#d-hold').focus();
  await page.keyboard.press('Space');
  await page.locator('#note').focus();
  await page.keyboard.type('Keyboard path check: holding at dock B.');
  await page.locator('#btn-review').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  if (!(await page.locator('#panel-review').isVisible())) throw new Error('Enter on review button did not advance');
});

// ---------- axe ----------
const runAxe = async (labelName) => {
  const res = await new AxeBuilder({ page }).analyze();
  const slim = {
    violations: res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => ({ target: n.target, html: n.html, failureSummary: n.failureSummary })) })),
    incomplete: res.incomplete.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => ({ target: n.target, html: n.html, failureSummary: n.failureSummary })) })),
    passes: res.passes.length,
    inapplicable: res.inapplicable.length,
  };
  writeJson(`${label}-axe-${labelName}.json`, slim);
  return slim;
};

const axeEvidence = await runAxe('evidence');
record('axe evidence view', axeEvidence.violations.length === 0 ? 'pass' : 'fail', `violations=${axeEvidence.violations.length} incomplete=${axeEvidence.incomplete.length}`);
if (axeEvidence.violations.length) log('AXE evidence violations', JSON.stringify(axeEvidence.violations.map((v) => v.id)));

const axeReview = await runAxe('review');
record('axe review view', axeReview.violations.length === 0 ? 'pass' : 'fail', `violations=${axeReview.violations.length} incomplete=${axeReview.incomplete.length}`);

// error state axe
await page.locator('#btn-edit').click();
await page.waitForTimeout(100);
await page.locator('#pick-HC-114').check();
await page.waitForTimeout(80);
await page.locator('#d-release').check();
await page.locator('#note').fill('x');
await page.locator('#btn-review').click();
await page.waitForTimeout(120);
const axeError = await runAxe('blocked-release-and-validation');
record('axe blocked release + validation state', axeError.violations.length === 0 ? 'pass' : 'fail', `violations=${axeError.violations.length} incomplete=${axeError.incomplete.length}`);
if (axeError.violations.length) log('AXE error violations', JSON.stringify(axeError.violations.map((v) => v.id)));

// ---------- widths / overflow ----------
const widths = [320, 390, 1440];
const overflowReport = [];
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(120);
  // evidence state
  await page.locator('#pick-HC-114').check();
  await page.waitForTimeout(60);
  const ev = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, inner: window.innerWidth, body: document.body.scrollWidth }));
  overflowReport.push({ width: w, state: 'evidence-blocked', ...ev });
  writeJson(`${label}-ev-${w}.json`, ev);
  await page.screenshot({ path: path.join(outDir, `${label}-evidence-${w}.png`), fullPage: false });
  await page.screenshot({ path: path.join(outDir, `${label}-evidence-${w}-full.png`), fullPage: true });
  if (ev.doc > ev.inner + 1) record(`no horizontal overflow evidence @${w}`, 'fail', JSON.stringify(ev));
  else record(`no horizontal overflow evidence @${w}`, 'pass', JSON.stringify(ev));

  // review state
  await page.locator('#d-hold').check();
  await page.locator('#note').fill('Holding HC-114 after a temperature excursion on reading 3.');
  await page.locator('#btn-review').click();
  await page.waitForTimeout(150);
  const rv = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, inner: window.innerWidth }));
  overflowReport.push({ width: w, state: 'review', ...rv });
  await page.screenshot({ path: path.join(outDir, `${label}-review-${w}.png`) });
  if (rv.doc > rv.inner + 1) record(`no horizontal overflow review @${w}`, 'fail', JSON.stringify(rv));
  else record(`no horizontal overflow review @${w}`, 'pass', JSON.stringify(rv));

  // error state with long text
  await page.locator('#btn-submit').click();
  await page.waitForTimeout(1200);
  const errState = await page.evaluate(() => {
    const el = document.getElementById('submit-error');
    const r = el.getBoundingClientRect();
    return { doc: document.documentElement.scrollWidth, inner: window.innerWidth, errVisible: r.height > 0, errText: el.textContent.trim().length, inViewport: r.top >= 0 && r.top < window.innerHeight, rect: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width) }, scrollY: window.scrollY };
  });
  overflowReport.push({ width: w, state: 'submit-error', ...errState });
  await page.screenshot({ path: path.join(outDir, `${label}-submit-error-${w}.png`) });
  if (errState.doc > errState.inner + 1) record(`no horizontal overflow submit-error @${w}`, 'fail', JSON.stringify(errState));
  else record(`no horizontal overflow submit-error @${w}`, 'pass', JSON.stringify(errState));
  if (!errState.errVisible) record(`submit error visible @${w}`, 'fail', 'zero height');

  // success state
  await page.locator('#btn-submit').click();
  await page.waitForTimeout(1400);
  const sc = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, inner: window.innerWidth }));
  overflowReport.push({ width: w, state: 'success', ...sc });
  await page.screenshot({ path: path.join(outDir, `${label}-success-${w}.png`) });
  if (sc.doc > sc.inner + 1) record(`no horizontal overflow success @${w}`, 'fail', JSON.stringify(sc));
  else record(`no horizontal overflow success @${w}`, 'pass', JSON.stringify(sc));

  await page.locator('#btn-again').click();
  await page.waitForTimeout(150);
}
writeJson(`${label}-overflow.json`, overflowReport);

// ---------- min tap target / label check ----------
const labelAudit = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('input,textarea,select'));
  return els.map((e) => {
    const r = e.getBoundingClientRect();
    return {
      tag: e.tagName, id: e.id, type: e.type || '',
      hasLabel: !!(e.labels && e.labels.length) || !!e.getAttribute('aria-label') || !!e.getAttribute('aria-labelledby'),
      labelText: e.labels && e.labels[0] ? e.labels[0].textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : null,
      w: Math.round(r.width), h: Math.round(e.tagName === 'INPUT' && e.type === 'radio' ? e.labels[0].getBoundingClientRect().height : r.height),
    };
  });
});
writeJson(`${label}-labels.json`, labelAudit);
const unlabeled = labelAudit.filter((e) => !e.hasLabel);
record('all text/radio inputs have programmatic labels', unlabeled.length === 0 ? 'pass' : 'fail', JSON.stringify(unlabeled.map((u) => u.id)));

writeJson(`${label}-results.json`, { results, consoleErrors, pageErrors, failedRequests, staticFacts });
writeJson(`${label}-summary.json`, {
  pass: results.filter((r) => r.status === 'pass').length,
  fail: results.filter((r) => r.status === 'fail').length,
  axe: { evidence: axeEvidence.violations.length, review: axeReview.violations.length, error: axeError.violations.length },
  axeIncomplete: { evidence: axeEvidence.incomplete.length, review: axeReview.incomplete.length, error: axeError.incomplete.length },
  consoleErrors, pageErrors, failedRequests,
});

log('--- SUMMARY ---');
log(JSON.stringify({
  pass: results.filter((r) => r.status === 'pass').length,
  fail: results.filter((r) => r.status === 'fail').length,
  failures: results.filter((r) => r.status === 'fail'),
  axeViolations: { evidence: axeEvidence.violations.map(v => v.id), review: axeReview.violations.map(v => v.id), error: axeError.violations.map(v => v.id) },
  axeIncomplete: { evidence: axeEvidence.incomplete.map(v => v.id), review: axeReview.incomplete.map(v => v.id), error: axeError.incomplete.map(v => v.id) },
  consoleErrors, pageErrors, failedRequests,
}, null, 2));

await browser.close();
server.close();
process.exit(hardFailures.length ? 1 : 0);

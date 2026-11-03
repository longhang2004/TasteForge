/* global scrollY */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { setTimeout, clearTimeout } from 'node:timers';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { captureCheckpoint } from '../skills/tasteforge/scripts/check-ui.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const project = path.resolve(
  process.argv[2] === '--project'
    ? process.argv[3]
    : path.join(root, 'examples/inventory-workbench/tools'),
);
const outputRoot = path.join(root, '.tmp/lean-ui-checkpoint-validation');
await mkdir(outputRoot, { recursive: true });
const output = await mkdtemp(path.join(outputRoot, 'run-'));
const checks = [];
const check = (name, observation) => {
  assert(observation, name);
  checks.push(name);
};
const helper = path.join(root, 'skills/tasteforge/scripts/check-ui.mjs');
const sha = async (file) =>
  createHash('sha256')
    .update(await readFile(file))
    .digest('hex');
let browser;
const fixture = (overflow) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Checkpoint fixture</title><style>body{margin:0;font:16px Arial;color:#111;background:white}main{padding:16px}.spacer{height:1300px}.tail{height:900px}button{min-height:48px;padding:12px}#feedback{padding:12px;background:#eef}input{max-width:100%}${overflow ? '.wide{width:900px}' : ''}</style></head><body><main><h1>Local fixture</h1><div class="wide">Layout evidence</div><label>Password<input type="password" value="PRIVATE_INPUT_SENTINEL"></label><div class="spacer"></div><button id="save">Save local draft</button><p id="feedback" tabindex="-1" hidden>Draft retained locally</p><div class="tail">PRIVATE_BODY_SENTINEL</div></main><script>document.querySelector('#save').onclick=()=>{const e=document.querySelector('#feedback');e.hidden=false;e.focus({preventScroll:true});e.scrollIntoView({block:'center'})}</script></body></html>`;
const server = createServer((request, response) => {
  response.writeHead(request.url === '/missing' ? 404 : 200, {
    'Content-Type': 'text/html; charset=utf-8',
  });
  response.end(fixture(request.url === '/overflow'));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = 'http://127.0.0.1:' + server.address().port;
function cli(args, env = process.env) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [helper, ...args], {
      cwd: root,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '',
      stderr = '';
    p.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    p.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    const timer = setTimeout(() => {
      p.kill();
      reject(new Error('CLI test timed out'));
    }, 90000);
    p.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    p.once('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, summary: JSON.parse(stdout.trim()) });
    });
  });
}
let status = 'passed';
let error;
try {
  const require = createRequire(path.join(project, 'package.json'));
  let loaded;
  try {
    loaded = await import(pathToFileURL(require.resolve('playwright')).href);
  } catch {
    throw new Error(
      'UNAVAILABLE: existing Playwright required through --project; no dependency installed',
    );
  }
  browser = await (loaded.default ?? loaded).chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 700 } });
  await page.goto(url);
  await page.locator('#save').click();
  const before = await page.evaluate(() => scrollY);
  check('Fixture reaches actual scrolled feedback state', before > 1000);
  const captured = await captureCheckpoint(page, {
    outputDir: output,
    label: 'natural-feedback',
    fullPage: true,
    feedbackSelectors: ['#feedback'],
  });
  check(
    'Natural scroll captured and preserved after both screenshot scopes',
    captured.report.scroll.y === before &&
      captured.report.afterCaptureScroll.y === before &&
      (await page.evaluate(() => scrollY)) === before,
  );
  check(
    'Actual focused feedback and in-viewport geometry retained',
    captured.report.activeElement.id === 'feedback' &&
      captured.report.feedback[0].layoutVisible === 1 &&
      captured.report.feedback[0].elements[0].fullyInViewport,
  );
  check(
    'Viewport and full-page scopes are separate real PNGs',
    captured.report.screenshots.length === 2 &&
      (await stat(path.join(captured.directory, 'viewport.png'))).size > 0 &&
      (await stat(path.join(captured.directory, 'full-page.png'))).size > 0,
  );
  const reportText = await readFile(path.join(captured.directory, 'report.json'), 'utf8');
  check(
    'Report extracts neither input values nor body copy',
    !reportText.includes('PRIVATE_INPUT_SENTINEL') && !reportText.includes('PRIVATE_BODY_SENTINEL'),
  );
  const originalHash = await sha(path.join(captured.directory, 'report.json'));
  await assert.rejects(captureCheckpoint(page, { outputDir: output, label: 'natural-feedback' }), {
    code: 'EEXIST',
  });
  check(
    'Reused checkpoint refuses overwrite and preserves original bytes',
    (await sha(path.join(captured.directory, 'report.json'))) === originalHash,
  );
  await assert.rejects(
    captureCheckpoint(page, { outputDir: output, label: '../escape' }),
    /simple checkpoint label/,
  );
  checks.push('Traversal label rejected before capture');
  const good = await cli([
    '--url',
    url,
    '--project',
    project,
    '--out',
    path.join(output, 'initial-good'),
  ]);
  check(
    'Default three widths pass actual initial geometry',
    good.code === 0 &&
      good.summary.widths.join(',') === '320,390,1440' &&
      good.summary.geometryFailures === 0,
  );
  check(
    'Compact output discloses initial-only scope',
    good.stdout.trim().split('\n').length === 1 &&
      good.stdout.length < 1500 &&
      /no task interactions/i.test(good.summary.scope),
  );
  const bad = await cli([
    '--url',
    url + '/overflow',
    '--project',
    project,
    '--out',
    path.join(output, 'initial-overflow'),
    '--widths',
    '320',
  ]);
  check(
    'Real overflow produces findings and nonzero exit',
    bad.code === 1 && bad.summary.geometryFailures === 1,
  );
  const missingPage = await cli([
    '--url',
    url + '/missing',
    '--project',
    project,
    '--out',
    path.join(output, 'missing-page'),
    '--widths',
    '390',
  ]);
  check(
    'HTTP failure is not mistaken for a passing layout',
    missingPage.code === 1 &&
      missingPage.summary.httpErrorWidths === 1 &&
      missingPage.summary.geometryFailures === 0,
  );
  const collision = await cli([
    '--url',
    url,
    '--project',
    project,
    '--out',
    path.join(output, 'initial-good'),
  ]);
  check(
    'Runner refuses existing output directory',
    collision.code === 2 && collision.summary.status === 'unassessed',
  );
  const remote = await cli([
    '--url',
    'https://example.com',
    '--project',
    project,
    '--out',
    path.join(output, 'remote'),
  ]);
  check('Remote start URL rejected', remote.code === 2 && /loopback/i.test(remote.summary.error));
  const invalidWidth = await cli([
    '--url',
    url,
    '--project',
    project,
    '--out',
    path.join(output, 'invalid-width'),
    '--widths',
    '0,390',
  ]);
  check('Invalid viewport rejected', invalidWidth.code === 2);
  const empty = await mkdtemp(path.join(tmpdir(), 'tasteforge-missing-playwright-'));
  const missing = await cli(
    ['--url', url, '--project', empty, '--out', path.join(output, 'missing-dependency')],
    { ...process.env, NODE_PATH: '' },
  );
  check(
    'Missing dependency remains unassessed, not a passing gate',
    missing.code === 2 &&
      missing.summary.status === 'unassessed' &&
      /Playwright unavailable/.test(missing.summary.error),
  );
  let axeAvailable = false;
  try {
    require.resolve('@axe-core/playwright');
    axeAvailable = true;
  } catch {
    /* optional */
  }
  if (axeAvailable) {
    const scanned = await cli([
      '--url',
      url,
      '--project',
      project,
      '--out',
      path.join(output, 'initial-axe'),
      '--widths',
      '390',
      '--axe',
    ]);
    const full = JSON.parse(await readFile(scanned.summary.report, 'utf8'));
    check(
      'Installed optional axe scan keeps findings/incomplete separate',
      full.checks[0].axe.status === 'completed' &&
        Array.isArray(full.checks[0].axe.violations) &&
        Array.isArray(full.checks[0].axe.incomplete) &&
        /no conformance/i.test(full.accessibility),
    );
  } else checks.push('Optional axe unavailable: explicitly not tested');
} catch (caught) {
  error = caught.message;
  status = error.startsWith('UNAVAILABLE:') ? 'unassessed' : 'failed';
  process.exitCode = status === 'unassessed' ? 2 : 1;
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
const report = {
  status,
  checks,
  count: checks.length,
  error,
  output,
  project,
  userTesting: 'not performed',
  scope: 'Local synthetic fixture validation of optional helper, not UI usability',
};
await writeFile(path.join(output, 'validation.json'), JSON.stringify(report, null, 2) + '\n', {
  flag: 'wx',
});
console.log(JSON.stringify(report));

/* global document, getComputedStyle, innerWidth, innerHeight, scrollX, scrollY */
import { mkdir, writeFile, realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const json = (value) => JSON.stringify(value, null, 2) + '\n';
const errorText = (error) => (error instanceof Error ? error.message : String(error));

/** Capture an already-reached state. Callers own readiness and task assertions. */
export async function captureCheckpoint(
  page,
  { outputDir, label, fullPage = false, feedbackSelectors = [] } = {},
) {
  if (typeof outputDir !== 'string' || !outputDir.trim()) throw new Error('outputDir is required');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(label ?? ''))
    throw new Error('Use a simple checkpoint label, not a path');
  if (
    typeof fullPage !== 'boolean' ||
    !Array.isArray(feedbackSelectors) ||
    feedbackSelectors.length > 20 ||
    feedbackSelectors.some((s) => typeof s !== 'string' || !s || s.length > 300)
  )
    throw new Error('Invalid capture options');
  const directory = path.join(path.resolve(outputDir), label);
  await mkdir(path.dirname(directory), { recursive: true });
  await mkdir(directory); // EEXIST preserves earlier/partial evidence.
  let report = {
    label,
    capturedAtUtc: new Date().toISOString(),
    scope: 'Current natural viewport; no scroll or focus reset',
    taskBehavior: 'Not established by this checkpoint',
  };
  try {
    const geometry = await page.evaluate((selectors) => {
      const rect = (element) => {
        const r = element.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          intersectsViewport:
            r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight,
          fullyInViewport:
            r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
        };
      };
      const visible = (element) => {
        const css = getComputedStyle(element);
        return (
          element.getClientRects().length > 0 && !['hidden', 'collapse'].includes(css.visibility)
        );
      };
      const active = document.activeElement;
      return {
        viewport: { width: innerWidth, height: innerHeight },
        scroll: { x: scrollX, y: scrollY },
        document: {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
        },
        activeElement: active
          ? {
              tag: active.tagName,
              id: active.id || null,
              testId: active.getAttribute('data-testid'),
              rect: rect(active),
            }
          : null,
        feedback: selectors.map((selector) => {
          try {
            const matches = [...document.querySelectorAll(selector)];
            return {
              selector,
              matches: matches.length,
              layoutVisible: matches.filter(visible).length,
              elements: matches.filter(visible).map(rect),
            };
          } catch {
            return { selector, error: 'Invalid CSS selector; unassessed' };
          }
        }),
      };
    }, feedbackSelectors);
    report = {
      ...report,
      ...geometry,
      geometry: {
        status: geometry.document.width <= geometry.viewport.width + 1 ? 'pass' : 'fail',
        horizontalOverflow: Math.max(0, geometry.document.width - geometry.viewport.width),
        scope: 'Document width only; no accessibility or task-quality certification',
      },
      screenshots: [{ file: 'viewport.png', scope: 'Natural viewport', scroll: geometry.scroll }],
    };
    await page.screenshot({
      path: path.join(directory, 'viewport.png'),
      fullPage: false,
      animations: 'disabled',
    });
    if (fullPage) {
      await page.screenshot({
        path: path.join(directory, 'full-page.png'),
        fullPage: true,
        animations: 'disabled',
      });
      report.screenshots.push({
        file: 'full-page.png',
        scope: 'Full page; includes content outside the original viewport',
      });
    }
    report.afterCaptureScroll = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
    await writeFile(path.join(directory, 'report.json'), json(report), { flag: 'wx' });
    return { directory, report };
  } catch (error) {
    await writeFile(
      path.join(directory, 'report.json'),
      json({
        ...report,
        status: 'unassessed',
        error: errorText(error),
        partialEvidencePreserved: true,
      }),
      { flag: 'wx' },
    ).catch(() => {});
    throw error;
  }
}

function parse(argv) {
  const options = { widths: [320, 390, 1440], fullPage: false, axe: false };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--help') return { help: true };
    if (flag === '--full-page') options.fullPage = true;
    else if (flag === '--axe') options.axe = true;
    else if (['--url', '--project', '--out', '--widths'].includes(flag)) {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error('Missing value for ' + flag);
      options[flag.slice(2)] = value;
    } else throw new Error('Unknown option: ' + flag);
  }
  if (!options.url || !options.project || !options.out)
    throw new Error('Require --url, --project and a new --out directory');
  const url = new URL(options.url);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    url.username ||
    url.password
  )
    throw new Error('Use a loopback HTTP(S) test URL without credentials');
  options.widths =
    typeof options.widths === 'string' ? options.widths.split(',').map(Number) : options.widths;
  if (
    options.widths.length < 1 ||
    options.widths.length > 8 ||
    new Set(options.widths).size !== options.widths.length ||
    options.widths.some((w) => !Number.isInteger(w) || w < 240 || w > 3840)
  )
    throw new Error('Supply 1–8 distinct integer widths from 240 to 3840');
  return options;
}
async function loadFrom(project, name) {
  const location = await realpath(project);
  const require = createRequire(path.join(location, 'package.json'));
  const loaded = await import(pathToFileURL(require.resolve(name)).href);
  return loaded.default ?? loaded;
}

async function runInitialCheck(options) {
  const out = path.resolve(options.out);
  await mkdir(path.dirname(out), { recursive: true });
  await mkdir(out);
  const result = {
    status: 'unassessed',
    scope: 'Initial load only; no task interactions exercised',
    url: options.url,
    checks: [],
    accessibility: options.axe ? 'requested' : 'not requested',
    limitations: [
      'Geometry is not task quality or accessibility conformance.',
      'Use captureCheckpoint from actual task tests for edit/error/retry states.',
    ],
  };
  let browser;
  try {
    let playwright;
    try {
      playwright = await loadFrom(options.project, 'playwright');
    } catch {
      throw new Error(
        'Playwright unavailable from --project; use an existing project installation. No package was installed.',
      );
    }
    try {
      browser = await playwright.chromium.launch({ headless: true });
    } catch {
      throw new Error('Installed Playwright browser unavailable; no browser was downloaded.');
    }
    result.browser = browser.version();
    let Axe;
    if (options.axe) {
      try {
        Axe = await loadFrom(options.project, '@axe-core/playwright');
      } catch {
        result.accessibility = 'unassessed: @axe-core/playwright unavailable; no package installed';
      }
    }
    for (const width of options.widths) {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(errorText(error)));
      try {
        const response = await page.goto(options.url, { waitUntil: 'load', timeout: 15000 });
        await page.evaluate(() => document.fonts.ready);
        const captured = await captureCheckpoint(page, {
          outputDir: out,
          label: 'initial-' + width,
          fullPage: options.fullPage,
        });
        const row = {
          width,
          navigationStatus: response?.status() ?? null,
          geometry: captured.report.geometry,
          pageErrors,
          report: path.relative(out, path.join(captured.directory, 'report.json')),
        };
        if (Axe) {
          try {
            const scan = await new Axe({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
              .analyze();
            const issues = (list) =>
              list.map((item) => ({
                id: item.id,
                impact: item.impact,
                targets: item.nodes.map((node) => node.target),
              }));
            const axe = {
              status: 'completed',
              violations: issues(scan.violations),
              incomplete: issues(scan.incomplete),
              scope: 'Automated scan only; incomplete findings remain unassessed',
            };
            await writeFile(path.join(captured.directory, 'axe.json'), json(axe), { flag: 'wx' });
            row.axe = {
              status: axe.status,
              violations: axe.violations.map((v) => v.id),
              incomplete: axe.incomplete.map((v) => v.id),
              report: path.relative(out, path.join(captured.directory, 'axe.json')),
            };
          } catch (error) {
            row.axe = { status: 'unassessed', error: errorText(error) };
          }
        }
        result.checks.push(row);
      } finally {
        await context.close();
      }
    }
    const missingAxe =
      options.axe && (!Axe || result.checks.some((row) => row.axe?.status !== 'completed'));
    const findings = result.checks.some(
      (row) =>
        row.geometry.status === 'fail' ||
        row.navigationStatus >= 400 ||
        row.pageErrors.length ||
        row.axe?.violations?.length,
    );
    result.status = findings ? 'findings' : missingAxe ? 'unassessed' : 'pass';
    if (missingAxe && Axe)
      result.accessibility = 'unassessed: one or more requested automated scans failed';
    if (Axe && !missingAxe)
      result.accessibility = 'automated scans completed; no conformance claim';
  } catch (error) {
    result.error = errorText(error);
  } finally {
    if (browser) await browser.close();
  }
  await writeFile(path.join(out, 'report.json'), json(result), { flag: 'wx' });
  return {
    status: result.status,
    scope: result.scope,
    widths: result.checks.map((row) => row.width),
    geometryFailures: result.checks.filter((row) => row.geometry.status === 'fail').length,
    httpErrorWidths: result.checks.filter((row) => row.navigationStatus >= 400).length,
    javascriptErrorWidths: result.checks.filter((row) => row.pageErrors.length).length,
    accessibility: result.accessibility,
    report: path.join(out, 'report.json'),
    ...(result.error ? { error: result.error } : {}),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options = parse(process.argv.slice(2));
    if (options.help)
      console.log(
        'node check-ui.mjs --url http://127.0.0.1:PORT --project /project-with-playwright --out /new-evidence [--widths 320,390,1440] [--full-page] [--axe]',
      );
    else {
      const summary = await runInitialCheck(options);
      console.log(JSON.stringify(summary));
      process.exitCode = summary.status === 'pass' ? 0 : summary.status === 'findings' ? 1 : 2;
    }
  } catch (error) {
    console.log(
      JSON.stringify({
        status: 'unassessed',
        error: errorText(error),
        scope: 'No task quality established',
      }),
    );
    process.exitCode = 2;
  }
}

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root } from './serve.mjs';

const pass = process.argv[2] || 'pass-04';
assert(/^[a-z0-9-]+$/.test(pass));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const freeze = JSON.parse(await readFile(path.join(root, 'brief-freeze.json'), 'utf8'));
for (const [file, expected] of Object.entries(freeze.files)) {
  assert.equal(
    hash(await readFile(path.join(root, file))),
    expected,
    `Frozen input changed: ${file}`,
  );
}
const reportPath = `evidence/${pass}/report.json`;
const bytes = await readFile(path.join(root, reportPath));
const report = JSON.parse(bytes);
assert.equal(report.failures.length, 0, 'Acceptance report has failures');
assert.equal(report.traces.length, 24);
assert(report.traces.every((trace) => !trace.error && trace.states.length >= 5));
for (const [file, expected] of Object.entries(report.sources)) {
  assert.equal(
    hash(await readFile(path.join(root, file))),
    expected,
    `Tested source changed: ${file}`,
  );
}
const files = { [reportPath]: hash(bytes) };
for (const trace of report.traces)
  for (const state of trace.states) {
    for (const file of [state.file, state.optionalFullPage].filter(Boolean)) {
      const relative = `evidence/${pass}/${file}`;
      files[relative] = hash(await readFile(path.join(root, relative)));
    }
  }
for (const file of ['tools/check.mjs', 'tools/serve.mjs'])
  files[file] = hash(await readFile(path.join(root, file)));
const acceptance = {
  report: reportPath,
  reportSha256: hash(bytes),
  checks: report.checkCount,
  states: report.stateCount,
  traces: 24,
  widths: [320, 390, 1440],
  files,
  limitations: [
    'Automated checks and nonblinded AI review; human tests deferred.',
    'Axe incomplete results are retained in each state.',
    'Natural viewports do not imply every fact/action is simultaneously visible.',
    'Raw pass-01 and pass-02 retain harness failures; author probes are supplementary.',
  ],
};
await writeFile(path.join(root, 'acceptance.json'), JSON.stringify(acceptance, null, 2) + '\n');
const escape = (text) =>
  String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const cards = report.traces
  .map(
    (trace) =>
      `<article><h2>${escape(trace.id)}</h2><p>${trace.checks.length} task assertions; ${trace.states.length} states. <a href="${pass}/report.json">Raw trace</a></p>${trace.states.map((state) => `<details><summary>${escape(state.state)} · scrollY ${state.geometry.scrollY} · focus ${escape(state.geometry.focus.id || state.geometry.focus.tag)}</summary><a href="${pass}/${state.file}"><img loading="lazy" src="${pass}/${state.file}" alt="${escape(trace.id)} ${escape(state.state)} natural viewport" /></a><p>${state.violations.length} axe violations; incomplete: ${state.incomplete.map((v) => escape(v.id)).join(', ') || 'none'}.</p></details>`).join('')}</article>`,
  )
  .join('');
await writeFile(
  path.join(root, 'evidence/index.html'),
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Composition evidence</title><link rel="stylesheet" href="../gallery.css"><style>img{max-width:100%;height:auto;max-height:850px;object-fit:contain;object-position:left}article{break-inside:avoid}summary{padding:12px;cursor:pointer}details{border-bottom:1px solid #aaa}</style><a href="../index.html">← Studies</a><h1>Task checks and natural viewports</h1><p>${report.checkCount} assertions across24 traces / ${report.stateCount} states. No reported axe violations; incomplete scope remains in the raw report. No human tests.</p><p>Raw harness failures: <a href="pass-01/report.json">pass01 HTTP404</a> · <a href="pass-02/report.json">pass02 axe context API</a>. Both remain separate from acceptance pass.</p>${cards}</html>`,
);
console.log(
  `Verified frozen inputs + tested sources + ${Object.keys(files).length} evidence files; wrote acceptance and gallery.`,
);

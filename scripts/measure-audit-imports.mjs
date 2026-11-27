import { performance } from 'node:perf_hooks';
import { Buffer } from 'node:buffer';
import os from 'node:os';
import { auditProject, AUDIT_IMPORT_LIMITS } from '../packages/core/dist/audit.js';

// A reproducible synthetic workload; timing is evidence, never a correctness threshold.
const consumers = 126;
const sources = [
  {
    file: 'entry.css',
    source: [
      '@import "tokens.css";',
      ...Array.from({ length: consumers }, (_, i) => `@import "component-${i}.css";`),
    ].join('\n'),
  },
  { file: 'tokens.css', source: ':root { --fg: #aaa; --bg: #fff; --font: "Inter"; }' },
  ...Array.from({ length: consumers }, (_, i) => ({
    file: `component-${i}.css`,
    source: '.notice { color: var(--fg); background: var(--bg); font-family: var(--font); }',
  })),
];
const samples = [];
let report;
for (let i = 0; i < 8; i++) {
  const started = performance.now();
  report = auditProject(sources, { roots: ['entry.css'] });
  samples.push(Number((performance.now() - started).toFixed(3)));
}
if (report.status !== 'complete' || report.findings.length !== consumers * 2)
  throw new Error('Synthetic graph did not produce its expected source findings');
console.log(
  JSON.stringify(
    {
      schemaVersion: '1.0',
      command: 'node scripts/measure-audit-imports.mjs',
      measuredAt: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        cpu: os.cpus()[0]?.model,
      },
      graph: {
        files: sources.length,
        imports: report.imports.length,
        entries: report.roots.length,
        inputUtf8Bytes: sources.reduce((sum, item) => sum + Buffer.byteLength(item.source), 0),
        findings: report.findings.length,
      },
      limits: AUDIT_IMPORT_LIMITS,
      measurementsMs: {
        firstInvocationExcludingModuleLoad: samples[0],
        subsequentInvocations: samples.slice(1),
      },
      scope:
        'In-process core parsing, resolution and report creation; excludes module/process startup, CLI filesystem reads, agent generation/review/corrections and human acceptance.',
      endToEndCost: 'unknown',
      billingCost: 'unknown',
    },
    null,
    2,
  ),
);

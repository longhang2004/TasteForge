import fs from 'node:fs';
const p = process.argv[2];
const d = JSON.parse(fs.readFileSync(p, 'utf8'));
const keys = ['cell','resource','task','start_utc','end_utc','submitted_file','versions','submitted_sha256','loaded_skill_paths','rationale','checks_run','failures_observed_and_resolved','unavailable_or_unassessed_checks','tool_calls','token_usage','model','human_acceptance'];
const missing = keys.filter((k) => !(k in d));
const extra = Object.keys(d).filter((k) => !keys.includes(k));
console.log('JSON OK; missing keys:', JSON.stringify(missing), 'extra keys:', JSON.stringify(extra));
console.log('versions:', d.versions.length, 'checks_run:', d.checks_run.length, 'failures:', d.failures_observed_and_resolved.length, 'unassessed:', d.unavailable_or_unassessed_checks.length);
console.log('skill paths:', d.loaded_skill_paths.length);

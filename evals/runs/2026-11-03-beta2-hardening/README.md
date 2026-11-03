# Beta.2 hardening and native host smoke

This is a bounded maintenance follow-up to the frozen four-skill comparison, not a rerating or a fresh paired efficacy trial. The original Field Fold output and all anonymous reviews remain unchanged. A native Windows Codex invocation used the candidate standalone skill ZIP to refine a separate copy of that supplied UI.

Open the [follow-up viewer](index.html), [before source](cells/fold-3/before/index.html), [corrected source](cells/fold-3/after/index.html), [host trace/result](host-smoke/result.json), [browser report](evidence/fold-3/followup-01/report.json), [named price probe](evidence/pricing-probe-01/report.json), or [independent release review](reviews/release-review.md).

[Verification](verification.json) records scoped integrity results; [evidence hashes](evidence-manifest.json) preserve this follow-up. Release build, CI, merge and publication metadata are recorded separately in release validation/GitHub/Linear.

```bash
node evals/runs/2026-11-03-beta2-hardening/tools/serve.mjs 4183
```

Visit <http://localhost:4183/>. The viewer serves fictional local-only UI slices. No order, payment or email is created.

## What changed and what was checked

The original source hash is `255b7c599971f906ccc84ee835be28ffad49eb26830f267863d0ebb8445783f7`; corrected source is `c9263769993b6f4ae7341276654d61b97f2239bb4cd763e835d0b47bf29a8b7a`. Original/corrected versions, the creator's actual loaded resources/commands and source/minimal-DOM checks are retained under [after](cells/fold-3/after/creator-record.json).

- Displayed cost and submission now share the selected edition's stock/quantity validity. Ridge ×3 retains quantity 3 and presents pending dashes instead of an ordinary USD 164 total.
- Complete costs precede required email. Invalid fields receive focus with associated feedback. Failure edits retain values and an explicit retry; obsolete success clears on edit.
- Parent Chromium checks passed **51 assertions / 19 natural state captures** across 320/390/1440px and a reduced-motion entry. They include invalid-stock cost suppression, rendered cost/email order, failure edit/retry, exact Harbor ×2 USD 111 success, keyboard/focus, geometry, scoped axe and runtime requests/errors.
- The price probe contains six before/after observations at three widths: all three original views reproduce the known ordinary invalid total, all three corrected views withhold it. These expected baseline findings remain visible in the report; they are not counted as corrected-output failures.

The parent inspected actual 320 invalid/failure-edit and 1440 decision viewport images. Focus/scroll were retained. Error text or controls partly outside a viewport do not establish inaccessibility or simultaneous visibility; the recorded keyboard paths are scoped technical evidence. No human/manual usability or screen-reader speech test was performed, and axe incomplete items remain unassessed. The source/minimal-DOM checks from the creator are distinct from parent browser checks.

## Standalone installation/invocation evidence

The ZIP hash is `c6d37cb585e6b02b4c9eb7c4eb36651b71422e404809a11c843c65ad76f94337`. All 24 installed files were hashed. The native Windows Codex CLI `0.166.0-alpha.5.1` resolved explicit `$tasteforge` from the isolated project's `.agents/skills`, loaded the entry, Fast workflow and relevant local render-check reference, then completed with exit 0. The request named the skill without supplying its path. The TasteForge CLI was not installed/used. Existing ChatGPT auth stayed in its normal store; no global host settings changed.

The first startup invocation combined mutually exclusive `--sandbox` and `--approve-for-me`; it exited 2 before a model turn. Raw [invalid invocation](host-smoke/invalid-invocation-01/) is preserved separately. The corrected invocation uses `--ignore-user-config --ephemeral --approve-for-me --json`, with actual terminal commands launched into Ubuntu WSL2 Bash. This is one explicit repo-scope invocation, not implicit selection, global installation, full native Windows CLI certification or an all-host claim. Codex Linux 0.163.0 was not logged in; other hosts were not run in this beta lane. [Host integration documentation](../../../docs/host-integration.md) links official OpenAI documentation and repeat/rollback scope.

The archive is [preserved here](host-smoke/tasteforge-skill-v0.2.0-beta.2.zip). The release builder verifies and copies those exact tested bytes, rather than silently repacking a different ZIP. [Source manifest](source-manifest.json) records input provenance, installed file hashes and task boundary. [Integrity verifier](tools/verify.py) checks archive/source equality, source versions, recorded host outcome, browser/probe results and local links.

## Observed resources and limitations

The successful native run spans **03:36:40–03:40:56 UTC on 3 November 2026 (256 seconds)**, including reads, implementation, source checks and documentation. Its emitted usage is input 291544, cached input 274432, cache-write input 0, output 7174 and reasoning-output 858 tokens. These fields are preserved as returned; categories are not added together or converted to cost. Resolved model, billing and complete operator/evaluator/full-acceptance totals remain unknown. The later parent browser pass took 78.277 seconds and is additional work. No end-to-end savings claim is made.

The fixture, task, host and targeted repair differ from the original fresh-generation comparison; this follow-up does not measure a causal skill improvement. Independent release review covered selected code/docs and six archive-verifier probes, with a working-tree scope and explicit transcript-preservation limits. Broader LON-95 host coverage, LON-99 diversity, LON-109 replication and deferred human tests remain separate.

# Eight-UI exploratory pilot

This run compares TasteForge-assisted generation with ordinary generation on two practical UI tasks. It is a small pilot to preserve concrete examples and identify useful or harmful behavior, not an estimate of universal improvement.

## Design

- Two requested model IDs: `gpt-6.1-sol` and `gpt-6-luna`.
- Two benchmark prompts, copied verbatim from `evals/prompts.json`: `commerce-craft` and `fintech-transfer`.
- Each model implements each prompt once without TasteForge and once with the frozen TasteForge skill and local CLI: eight UIs, four matched pairs.
- The same plain HTML/CSS/JavaScript starter, fictional fixture, behavior contract, local vector illustration, and self-review allowance are supplied within a pair.
- Fresh subagents receive no parent conversation (`fork_turns="none"`). They may only inspect their assigned case's task, fixture, starter, and assets. Assisted agents additionally receive the frozen skill and local CLI path. They must not inspect other outputs or root project documentation.
- Only the treatment receives the skill, progressive references, CLI, and seed 42. Generated Design DNA and CLI outputs are retained. Baselines receive no design directions or tokens from TasteForge.
- Creation is one implementation pass and one self-review, aiming for eight minutes. Model token limits, backend model snapshots, inference settings, and generation seeds are not exposed by the subagent API. This is not a matched-token or matched-compute experiment.
- No external assets, font downloads, packages, or APIs in generated UIs. The tool operator may install isolated browser-test dependencies. All product and transaction data are fictional.

The task and fixture SHA-256 values in `manifest.json` demonstrate matched product inputs. Invisible test hooks provide equivalent functional checks without prescribing layout. The runtime code and skill snapshot are versioned independently of model randomness.

## Rendering and functional evidence

The operator serves the run folder with an ordinary static server and inspects each case in Chromium at desktop 1440 × 1000 and mobile 390 × 844, using the same locale, time zone, color scheme, and reduced-motion setting. Initial screenshots use the same capture policy. Relevant result/error/review screenshots are saved separately.

Functional checks are based on the shared behavior contract: glaze/quantity/cart feedback and unavailable stock; transfer validation, review totals, first-attempt failure, input retention, retry, and success. Browser errors, overflow, available keyboard focus, document semantics, and axe accessibility findings are recorded. Axe results are supporting automated evidence, not a complete accessibility certification.

Generated implementations are not repaired by the operator after they are submitted. Failure and partial completion remain in the record. Only the shared evaluation harness may be corrected, with the same correction applied to every case. Source hashes freeze submitted outputs.

An initial harness pass was corrected before review: transfer failure text can appear in the visible heading rather than only the status region, and retained values can remain in a failure summary when inputs are intentionally unmounted. The operator inspected the rendered error screen and recorded which retention evidence was actually observed. A shipping-inclusive calculated total is recorded as an optional diagnostic because the original product contract requires visible price/shipping but does not mandate that calculation. The revised harness is applied to all eight cases. Original implementation sources are unchanged.

## Review and reporting

Two fresh reviewer subagents receive anonymized screenshots, task context, and factual browser observations. Model and condition mappings are withheld. They score the nine dimensions in the repository rubric, retain initial independent ratings, identify task/accessibility blockers, and mark unsupported conclusions as unassessed. Visible condition labels inside a UI are recorded as a blinding limitation.

The final report presents per-dimension ratings, actual task behavior, failures, and disagreements. It does not hide tradeoffs behind a single taste score. A pair has only one generation per condition; any differences may reflect model sampling, tools, or implementation decisions rather than the skill alone. AI reviewers are not a substitute for independent human users.

## Deviations from the full benchmark methodology

The published methodology calls for at least three paired repetitions per prompt and independent reviewers. This pilot has one paired repetition per model/prompt and AI rather than human reviewers. It covers two of ten prompts. It is suitable for inspecting examples and planning a larger evaluation, not statistical or causal claims.

WSL was initially blocked by the default sandbox for c01 and c02. The operator supplied the already-authorized `require_escalated` Ubuntu launcher instruction. No UI files were changed before those bootstrap failures were resolved. Remaining agents receive that environment instruction up front. The c01 agent resumed after a bootstrap-only failure; this is recorded rather than silently restarting or excluding the case.

c04 encountered shell-quoting difficulty while writing files and received the neutral reminder that the direct workspace patch tool is permitted. Later assignments receive that same environment reminder. This is a tool-use intervention, not design feedback. No creator received screenshots, other conditions' outputs, reviewer judgments, or suggestions for improving its design.

## Provenance

The initial source revision, requested models, case mapping, prompt/fixture hashes, engine/knowledge versions, tool versions, source hashes, actual checks, and limitations are saved with the run. The skill snapshot is in `treatment/tasteforge`. The original vector asset and generated code use the repository MIT license; no external product photos or font binaries are included.

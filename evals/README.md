# Interface evaluation methodology

The ten prompts in `prompts.json` cover two cases each in fintech, education, e-commerce, portfolio, and healthcare. They are a benchmark specification. Recorded exploratory runs are listed below; they must be read with their own sample sizes, methods, and limitations. No general benchmark improvement claim is made.

## Recorded exploratory runs

- [3 November 2026 native OpenCode / Vilao host smoke](runs/2026-11-03-opencode-vilao-host-smoke/README.md): two configured models, exact beta.2 ZIP discovery/invocation, two maintained commerce UIs, independent task/product-specificity observations and browser/keyboard acceptance. Preserves a GLM quantity-state defect, one same-session correction, parent diagnostic corrections and separate resource categories. No held-out/unassisted condition, model winner or human-usability claim.

- [3 November 2026 beta.2 hardening/native host smoke](runs/2026-11-03-beta2-hardening/README.md): one actual native Windows Codex repo-skill ZIP invocation, a bounded maintenance correction of a supplied fixture, separate browser regression checks and release-helper review. Preserves the original invalid-total finding and raw startup error; not a fresh paired efficacy trial or all-host certification.

- [2 November 2026 four-skill landing-page comparison](runs/2026-11-02-four-skill-landing-comparison/README.md): two matched briefs × TasteForge, UI/UX Pro Max, Elaya and Impeccable, with eight runnable UIs, natural task/recovery captures, pinned resources and two independently frozen anonymous AI reviews. Separate visual craft, product specificity, task/access and observed resource coverage; controlled offline single-creator lane, not full native workflow efficacy or a universal ranking.

- [2 November 2026 lean-workflow probe](runs/2026-11-02-lean-workflow-probe/README.md): four old/lean outputs across Fast responsive correction and Standard transfer creation. Preserves natural-state checks, actual AGY usage/time, lower static instruction size, remaining accessibility/content findings and a separately labeled focused finalization. Initial-generation savings are not accepted-UI end-to-end savings; manual testing remains deferred.

- [2 November 2026 current-beta automated study](runs/2026-11-02-current-skill-automation/README.md): twelve fresh UIs across transfer/product tasks, Sol/Luna subagents and native Antigravity/Gemini, with/without the frozen released skill. Preserves 36 task traces, uniform corrected captures, separate-dimension independent AI ratings, narrow overflow and contrast findings, sequential quota-blocked OpenCode probes, and actual resource/CLI-evidence limitations. Local grouping gains and mixed narrow results do not establish general UX improvement; manual/human testing was deferred.

- [1 November 2026 Antigravity inventory pair](runs/2026-11-01-antigravity-inventory/README.md): two actual native Antigravity 1.4.12 submissions on pinned Gemini 3.8 Flash (Medium), with/without the current skill. Includes real task/recovery tests, two anonymous independent reviews, actual token/runtime metadata and disclosed bootstrap/preview deviations. Both reviewers favor assisted mobile grouping locally; neither design eliminates conventional panel composition. Separate host/model case study, not extra samples in the twelve-UI study.

- [1 November 2026 UX/layout study](runs/2026-11-01-ux-layout-study/README.md): twelve fresh UIs across three tasks, two creator models and no/current skill under equal offline CLI/catalog and self-render access. Two independent AI reviewers inspect neutralized layouts before authored styling. Includes paired dimension scores, actual task/recovery tests, a known neutralizer defect with post-hoc sensitivity analysis, and failed availability probes for the two requested OpenCode free models. Start with the [gallery](runs/2026-11-01-ux-layout-study/index.html) or [findings and limits](runs/2026-11-01-ux-layout-study/report.md); no general improvement claim.

- [1 November 2026 UI pilot](runs/2026-11-01-ui-pilot/README.md): eight UIs from two requested creator models, two prompts, and without/with TasteForge. Includes a comparison gallery, screenshots, actual browser checks, preserved design artifacts, and two independent anonymous AI reviews. There is one generation per condition for each model/prompt, so this is not the replicated benchmark described below. Start with the [results and limitations](runs/2026-11-01-ui-pilot/report.md) or [screenshot index](runs/2026-11-01-ui-pilot/screenshots.md).
- [1 November 2026 reference-led follow-up](runs/2026-11-01-reference-followup/README.md): one fresh transfer UI using the revised skill and bounded reference research. Includes a structural plan, actual browser checks, and a comparison viewer against the original assisted transfer. Reusing the old sample and changing research/tool context prevents a causal improvement claim; no new reviewer scores are assigned.

## Controlled comparison

The separate [catalog planning probe](runs/2026-11-01-catalog-probe/README.md) preserves one independent agent's source use and three retrieval defects, followed by a scoped operator regression check. It contains no implemented UI, rendered evidence or UX scores and is not part of the interface benchmark.

For each prompt, generate a baseline interface and a TasteForge-assisted interface using the same coding-agent model/version, framework, starting project, assets, task text, time/tool budget, and generation settings. Keep the original prompt unchanged; the assisted condition additionally receives the skill and local CLI. Record the coding-agent run identifier, tool versions, catalog version, brief, selected direction, seed, and deviations.

Use at least three paired runs per prompt with a declared seed schedule. Randomize presentation order and hide the condition from reviewers where practical. Separate model randomness from TasteForge's deterministic seed. Record failures and incomplete runs rather than silently excluding them. Do not let the baseline view the assisted output.

Review actual rendered interfaces and complete the stated primary task. Use identical narrow and wide viewports (for example 390px and 1440px), realistic content, keyboard navigation, zoom, reduced-motion preference, and relevant empty/loading/error states. Automated checks provide supporting evidence, not a substitute for task evaluation. Do not enter real financial, medical, or personal data.

## Rubric

Score each dimension from 1 to 5 with a short evidence-based note. Use 1 for a blocking failure, 3 for usable with material issues, and 5 for consistently strong behavior. Use 2/4 for intermediate cases. Mark unavailable evidence as unassessed rather than inventing a score.

| Dimension                 | Evidence to collect                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Task success and clarity  | Can a reviewer complete the named task and understand the result? Record errors and time, without treating speed alone as quality.                     |
| Information hierarchy     | Purpose, state, primary action, units, and supporting detail can be located and compared.                                                              |
| Context and identity      | Content and composition fit the audience and product; differentiation has a purpose. Novelty alone earns no credit.                                    |
| Typography and content    | Readability, role consistency, line length, concrete copy, and language/diacritic handling.                                                            |
| Layout and responsiveness | Grouping, rhythm, density, reflow, long content, and zoom preserve useful relationships.                                                               |
| Interaction completeness  | Relevant focus, hover, pending, empty, error, disabled, and success states; recoverability and feedback.                                               |
| Accessibility             | Semantics, accessible names, keyboard behavior, visible focus, color-independent status, contrast evidence, and motion preferences. Record test scope. |
| System coherence          | Tokens, components, typography, spacing, colors, and preserved existing constraints form a consistent whole.                                           |
| Evidence integrity        | Metrics, sample data, claims, and audit statements are honest and traceable.                                                                           |

Report dimension scores rather than hiding them in a single taste number. Accessibility and task blockers are gates: a visually distinctive but unusable result cannot be considered successful. If presenting an aggregate for exploration, predeclare its weights and also publish all dimensions and gate failures.

Have two independent reviewers score each output before discussing disagreements. Record disagreement, resolve with evidence, and preserve initial ratings. Report paired differences with uncertainty, sample size, failed runs, reviewer limitations, and model/tool versions. Small exploratory samples do not establish universal improvement.

## Evaluating structure and reference use

For the revised skill, separate task architecture from visual style. Before revealing typography/color, compare neutral wireframes or content/region maps on information order, navigation, overview/detail relationships, decision placement, disclosure, state/recovery flow, and narrow-screen priority. A new palette or the same card grid with different decoration is not structural diversity. A conventional interaction can still be the better choice; do not reward novelty without task benefit.

Use actual task evidence: can users locate the first useful action, compare related values, see the consequence at commitment, edit without losing context, and recover from errors? Record rendered states and human observations. A passing click path or absence of automated contrast findings does not establish those qualities by itself.

For a future comparison, distinguish baseline, the frozen original skill, and the revised reference-led skill. Give conditions equivalent browser/rendering capabilities and the same user-supplied references; log additional sources each agent actually inspects. Keep creation/model budgets comparable and report deviations. Freeze source URLs/revisions, the new skill snapshot, planning artifacts, and output evidence. This measures the complete workflow unless separate conditions isolate research, CLI, and instruction effects.

Do not rewrite the existing pilot's scores or frozen skill to make it represent the revision. New results require new runs. The worked planning examples are explanatory artifacts, not empirical proof that the revision improves UX.

## Result record

Create a dated run directory outside the curated catalog containing the prompt ID, condition, model/run identifiers, source revision, brief/DNA (assisted), seed/settings, screenshots with viewport/state names, task observations, check outputs, reviewer scores/notes, failures, and consent/licensing notes for any assets. This repository intentionally includes no empty score tables that could be mistaken for benchmark results.

# Interface evaluation methodology

The ten prompts in `prompts.json` cover two cases each in fintech, education, e-commerce, portfolio, and healthcare. They are a benchmark specification, **not recorded results**. No claim that TasteForge improves a score has been measured in this repository.

## Controlled comparison

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

## Result record

Create a dated run directory outside the curated catalog containing the prompt ID, condition, model/run identifiers, source revision, brief/DNA (assisted), seed/settings, screenshots with viewport/state names, task observations, check outputs, reviewer scores/notes, failures, and consent/licensing notes for any assets. This repository intentionally includes no empty score tables that could be mistaken for benchmark results.

# TasteForge Documentation

TasteForge is an open-source Agent Skill and deterministic TypeScript CLI for UI design intelligence. It provides context-aware design recommendations, Design DNA, CSS design tokens, and static CSS/JSX/TSX source audits. Core operations run locally without API keys or external LLM calls.

## Start here

- [Project overview and installation](../README.md): capabilities, requirements, source quickstart, and frequently asked questions.
- [CLI reference](cli.md): commands, brief fields, hard constraints, scoring configuration, exit codes, and audit rule coverage.
- [Agent Skill](../skills/tasteforge/SKILL.md): progressive-disclosure instructions for coding agents, with creation, redesign, and refinement workflows. The skill remains useful without the CLI.
- [Proportional UI workflows](lean-workflows.md): Fast/Standard/Explore effort, compact context, source-grounded copy and optional natural-state browser checkpoints.
- [Reference-led UX planning](reference-led-design.md): research real product/pattern sources, compare task structures before visual treatments, and understand what the current CLI does and does not automate.
- [Offline reference catalog](reference-catalog.md): 642 attributed records, seeded external style inspiration, task-tagged template observations, baseline review gates, and reproducible ingestion.
- [Composition field guide](../examples/composition-library/README.md): twelve original relationship cards, source observations, schematic previews and conditional inspiration selection.
- [Typography expansion](typography-expansion.md): six additional font families/pairs, pinned OFL files, sampled glyph/loading checks and known language limits.
- [Effect and layout research](effects-research.md): inspected Colorion, Codrops, layout and native-animation sources; purpose-based skill guidance and original runnable studies.
- [Surface purpose and targeted refinement](impeccable-informed-workflow.md): Impeccable-informed concepts, scoped edits, intentional exceptions, an annotated evidence gallery and a bounded independent forward-test.
- [GitHub releases](https://github.com/longhang2004/TasteForge/releases): tagged source, built package archives, standalone skill ZIP, checksums, and release notes. The npm packages are not yet published.
- [Standalone host evidence](host-integration.md): the observed native Codex ZIP discovery/invocation, isolated setup and remaining host coverage.
- [0.2.0-beta.2 notes](releases/v0.2.0-beta.2.md): proportional workflows, explained task compositions, hardening and artifact/evidence limits. [Beta.1 notes](releases/v0.2.0-beta.1.md) retain the previous release scope.

## Use and inspect the outputs

- [Example product brief](../examples/brief.json): fintech dashboard context with English/Vietnamese language requirements and accessibility constraints.
- [Generated Design DNA](../examples/generated/design-dna.json): a complete, versioned design specification with its original context, seed, rationale, typography, colors, scales, and tokens.
- [Generated CSS design tokens](../examples/generated/tokens.css) and [design guidance](../examples/generated/DESIGN.md): actual CLI output for the example brief.
- [Examples guide](../examples/README.md): reproduction commands and deliberately flawed source fixtures for static audit checks.
- [Inventory worked composition](../examples/inventory-workbench/README.md): runnable structural alternatives, a focused mobile task, actual render/revision evidence and explicit pending human-review status.
- [Annotated design gallery](../examples/design-gallery/README.md): four cases with unchanged captures, viewport/full-page distinctions and keyboard-accessible explanatory notes.
- [Explained composition pairs](../examples/composition-studies/README.md): operational, commerce, editorial and collection slices with conventional/adapted relationships and shared facts.
- [Four-skill comparison](../evals/runs/2026-11-02-four-skill-landing-comparison/README.md): eight runnable landing slices, separately frozen independent judgments and preserved limitations.

## Understand and extend TasteForge

- [Architecture and determinism](architecture.md): package boundaries, hard filtering, scoring, seeded sampling, DNA consistency, and filesystem reliability.
- [Knowledge extension guide](extending-knowledge.md): schemas, style compatibility, font language evidence, palette constraints, and versioning.
- [Contributing](../CONTRIBUTING.md): local development, checks, contribution scope, and source/licensing expectations.
- [Evaluation methodology and recorded runs](../evals/README.md): ten benchmark prompts, the full evaluation rubric, and an eight-UI exploratory pilot with screenshots and anonymous AI reviews. A replicated full benchmark has not been completed.
- [UX/layout study](../evals/runs/2026-11-01-ux-layout-study/README.md): twelve fresh UIs with neutral-first independent reviews, actual task evidence, localized improvements, mobile regressions and an explicit neutralization caveat.
- [Antigravity inventory pair](../evals/runs/2026-11-01-antigravity-inventory/README.md): actual Gemini 3.8 Flash (Medium) UI generation through native Antigravity CLI, with/without skill, task traces and independent layout reviews.
- [Release preparation](releasing.md) and [changelog](../CHANGELOG.md): packaging verification, release procedure, and version history.

## Scope and evidence

The recommendation engine uses transparent editorial heuristics. The static audit distinguishes verified source conditions, heuristic warnings, and items requiring human or rendered review; it does not certify visual quality or accessibility conformance. Font metadata records coverage evidence and limitations, while font delivery and target-platform rendering need separate verification. Host evidence is limited to the versions/tasks actually recorded; broad agent-host integration is not certified.

For the current implementation details, use the CLI reference, schemas, examples, and tests in this repository. For an immutable version, follow a GitHub release tag rather than assuming the default branch matches an older release.

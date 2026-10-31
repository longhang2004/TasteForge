# TasteForge Documentation

TasteForge is an open-source Agent Skill and deterministic TypeScript CLI for UI design intelligence. It provides context-aware design recommendations, Design DNA, CSS design tokens, and static CSS/JSX/TSX source audits. Core operations run locally without API keys or external LLM calls.

## Start here

- [Project overview and installation](../README.md): capabilities, requirements, source quickstart, and frequently asked questions.
- [CLI reference](cli.md): commands, brief fields, hard constraints, scoring configuration, exit codes, and audit rule coverage.
- [Agent Skill](../skills/tasteforge/SKILL.md): progressive-disclosure instructions for coding agents, with creation, redesign, and refinement workflows. The skill remains useful without the CLI.
- [GitHub releases](https://github.com/longhang2004/TasteForge/releases): tagged source, built package archives, standalone skill ZIP, checksums, and release notes. The npm packages are not yet published.

## Use and inspect the outputs

- [Example product brief](../examples/brief.json): fintech dashboard context with English/Vietnamese language requirements and accessibility constraints.
- [Generated Design DNA](../examples/generated/design-dna.json): a complete, versioned design specification with its original context, seed, rationale, typography, colors, scales, and tokens.
- [Generated CSS design tokens](../examples/generated/tokens.css) and [design guidance](../examples/generated/DESIGN.md): actual CLI output for the example brief.
- [Examples guide](../examples/README.md): reproduction commands and deliberately flawed source fixtures for static audit checks.

## Understand and extend TasteForge

- [Architecture and determinism](architecture.md): package boundaries, hard filtering, scoring, seeded sampling, DNA consistency, and filesystem reliability.
- [Knowledge extension guide](extending-knowledge.md): schemas, style compatibility, font language evidence, palette constraints, and versioning.
- [Contributing](../CONTRIBUTING.md): local development, checks, contribution scope, and source/licensing expectations.
- [Evaluation methodology](../evals/README.md): ten benchmark prompts and a rubric for comparing actual rendered interfaces. Benchmark improvement results have not been collected.
- [Release preparation](releasing.md) and [changelog](../CHANGELOG.md): packaging verification, release procedure, and version history.

## Scope and evidence

The recommendation engine uses transparent editorial heuristics. The static audit distinguishes verified source conditions, heuristic warnings, and items requiring human or rendered review; it does not certify visual quality or accessibility conformance. Font metadata records coverage evidence and limitations, while font delivery and target-platform rendering need separate verification. Agent-host integrations have not been certified.

For the current implementation details, use the CLI reference, schemas, examples, and tests in this repository. For an immutable version, follow a GitHub release tag rather than assuming the default branch matches an older release.

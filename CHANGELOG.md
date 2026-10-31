# Changelog

## 0.1.0 — 2026-10-31

First public MVP of TasteForge: local design intelligence for AI coding agents.

- Add `init`, `suggest`, `generate`, and `audit` commands with non-interactive and JSON output support.
- Validate briefs and apply hard constraints before transparent weighted ranking and deterministic seeded exploration.
- Curate 20 styles, 32 font pairings, 20 palettes, 16 design principles, and 14 contextual anti-patterns in versioned JSON.
- Generate internally validated Design DNA, semantic CSS tokens, and project design guidance.
- Parse CSS and JSX/TSX for verified source conditions, heuristic warnings, and items requiring rendered or human review.
- Add a progressive-disclosure agent skill with three workflows and seven focused references.
- Protect local state with project boundaries, linked-output rejection, explicit overwrite flags, staged writes, dry runs, and cooperative write locks.
- Include 34 tests, example artifacts, ten benchmark prompts, an evaluation rubric, MIT licensing, and CI for Node 20/22/24.

### Validation

Local verification used Ubuntu on WSL2 with Node 24. Build, strict typechecks, lint, formatting, all 34 tests, skill validation, production dependency audit, and offline installed-package verification passed.

### Limits

Audits inspect source, not screenshots or rendered interfaces, and do not resolve the full CSS cascade, arbitrary computed styles, utility frameworks, or component runtime behavior. Font files are not bundled; target-language rendering and fallback coverage need verification. Agent-host integrations have not been certified. No benchmark improvement results are claimed.

This is a GitHub source/artifact release. The `tasteforge` and `@tasteforge/*` packages have not been published to npm.

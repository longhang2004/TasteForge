# TasteForge

**Less slop. More taste.**

TasteForge is a local design intelligence layer for AI coding agents: a lightweight Agent Skill plus a deterministic TypeScript CLI. It turns a product brief into compatible design directions, explainable recommendations, Design DNA, and semantic CSS tokens. A source audit catches practical implementation issues and identifies questions that need human or rendered review.

This is a working **0.1.0 MVP**, not a component library, prompt dump, visual judge, or accessibility certification tool. No API keys, LLM calls, database, or cloud service are required. Core operations make no network requests.

## Quickstart (from source, under five minutes on a normal connection)

Requires Node **20.19+** and **pnpm 10.13.1**. Node 22 or 24 is recommended for development. Package names are reserved here as the intended release names; a registry release has not been published or verified.

```bash
git clone https://github.com/longhang2004/TasteForge.git
cd TasteForge
pnpm install
pnpm build
pnpm tasteforge --help
```

Point the built CLI at an existing project:

```bash
node /absolute/path/to/tasteforge/packages/cli/dist/index.js --project /path/to/project init
# Edit /path/to/project/.tasteforge/brief.json with actual product context.
node /absolute/path/to/tasteforge/packages/cli/dist/index.js --project /path/to/project suggest --count 3 --seed 42 --format json
node /absolute/path/to/tasteforge/packages/cli/dist/index.js --project /path/to/project generate --direction swiss-editorial --seed 42
node /absolute/path/to/tasteforge/packages/cli/dist/index.js --project /path/to/project audit --path src --format json
```

Choose a direction returned for **your** brief; `swiss-editorial` is an example and may be incompatible. The built file also has a Node shebang and executable mode on POSIX. In this checkout, `pnpm tasteforge` is the convenient alias. After a coordinated package release, the `tasteforge` package provides the executable of the same name.

## What it does

- **`init`** creates `.tasteforge/brief.json` and `config.json`; existing files require `--force`. Both initialization and generation support `--dry-run` without writing files.
- **`suggest`** validates context, filters hard constraints, ranks compatible styles, and samples distinct candidates using a seed and creativity-dependent temperature. Results include full style guidance, font pair, palette, scoring breakdown, weights, explanations, and engine/knowledge versions.
- **`generate`** creates `design-dna.json`, `tokens.css`, and `DESIGN.md` from the same context, direction, and seed. The font/palette choice matches `suggest` for that direction. Existing artifacts require `--force`; inspect them before replacing them.
- **`audit`** parses CSS with PostCSS and JSX/TSX with TypeScript. It reports explicit source conditions, contextual heuristics, and review items separately. If Design DNA is present, its tokens and contrast target inform the audit. CSS-local root tokens are also recognized.

Import generated tokens in your app and apply semantic roles:

```css
@import '../.tasteforge/tokens.css';

body {
  font-family: var(--tf-font-body);
  color: var(--tf-color-foreground);
  background: var(--tf-color-background);
  line-height: var(--tf-line-height-body);
}
```

Fonts are **not downloaded or bundled**. Load appropriately licensed font files yourself or use the provided fallbacks. Font metadata documents Latin/Vietnamese subset declarations; actual loading, diacritics, layout shifts, and fallback coverage need verification on the target platform. System-only pairs are available for English; Vietnamese system coverage is deliberately unverified.

## Brief and design constraints

See [the complete sample brief](examples/brief.json). Include product type, industry, audience tags, goals, brand personality, constraints, accessibility requirements, creativity from 0 to 1, and optionally a uint32 seed. Useful vocabulary and supported fields are documented in [the CLI reference](docs/cli.md).

```json
{
  "productType": "dashboard",
  "industry": "fintech",
  "audience": ["professionals", "operators"],
  "goals": ["Compare positions and monitor data quality"],
  "brandPersonality": ["precise", "trustworthy"],
  "existingConstraints": { "density": "dense", "maxComplexity": "medium" },
  "accessibility": { "languages": ["en", "vi"], "minContrast": 4.5 },
  "creativity": 0.2,
  "seed": 42
}
```

With a named existing design system and `preserveExisting: true` (the default), suggestions and generation refuse replacement directions. Use the skill's refinement workflow. Explicitly authorized redesign can set `preserveExisting` to false and retain applicable fixed constraints. Unknown brief fields are rejected to expose typos. Impossible combinations return reasons rather than silently relaxing accessibility.

The initial scoring weights are product/industry 30%, brand 25%, audience/usability 20%, technical simplicity 15%, and distinctiveness alignment 10%. These are **editorial heuristics, not scientifically validated measurements**. Edit weights in `.tasteforge/config.json`; they must sum to one. See [architecture](docs/architecture.md) for the exact ranking and sampling behavior.

## Agent Skill

The entrypoint is [skills/tasteforge/SKILL.md](skills/tasteforge/SKILL.md). It routes creation, redesign, and refinement to focused workflows and loads principles only when relevant. It remains useful without the CLI and preserves established design systems.

Copy the whole `skills/tasteforge` folder into the skill discovery location documented by your agent, preserving references and workflows. Then invoke `tasteforge` using the agent's supported skill mechanism or explicitly ask it to follow `SKILL.md`. The CLI package includes the same skill folder for distribution.

Automated verification in this repository covers the skill's frontmatter, reference files, and CLI integration workflow. **End-to-end integration inside Codex, Claude Code, Cursor, or other agent applications has not been certified.** Consult each host's current installation instructions; no universal compatibility claim is made.

## Audit evidence and exit codes

Each finding has a rule ID, severity, confidence, category, file/location when available, explanation, and remediation:

| Category    | What it means                                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verified`  | The named source condition is established, such as syntax, a missing generic fallback, or a numeric contrast ratio for an explicitly declared pair. Runtime impact may still need inspection. |
| `heuristic` | A potentially inappropriate pattern, such as repeated gradients, three card-like ancestors, type drift, or hardcoded token values. Context may justify it.                                    |
| `review`    | The source cannot resolve the question, such as computed styles or layered contrast.                                                                                                          |

Default audit exit codes: **0** for a completed audit without errors, **1** for findings at the selected failure threshold, **2** for usage, validation, filesystem, or operational failures. `--fail-on warning` also fails on warnings; `--fail-on never` reports all source findings without failure. Other commands use 0 for success and 2 for failure. JSON results go to stdout and operational JSON errors to stderr; Commander usage errors are human-readable on stderr.

```bash
pnpm tasteforge audit --path examples/source --format json
pnpm tasteforge audit --path examples/source --fail-on warning
pnpm check
```

A static audit does **not** inspect screenshots or establish visual quality, full contrast compliance, or accessibility conformance. It does not resolve the full CSS cascade, utility classes, CSS-in-JS template strings, component internals, data truth, or runtime interactions. Review [the audit scope](docs/cli.md#audit-scope).

## Repository

```text
packages/
  knowledge/src/          Zod schemas and versioned curated JSON
  core/src/               Pure ranking, sampling, DNA, tokens, static audit
  cli/src/                Commander interface and bounded filesystem operations
skills/tasteforge/
  SKILL.md                Progressive-disclosure entrypoint
  references/             Seven focused design references
  workflows/              Create, redesign, audit/refine
examples/                  Brief, generated artifacts, deliberately flawed source
tests/                     Unit and end-to-end CLI tests
evals/                     Ten benchmark prompts and an unscored evaluation rubric
docs/                      Architecture, CLI, knowledge extension, release guide
.github/workflows/ci.yml    Build, checks, tests on Node 20/22/24
```

## Development and troubleshooting

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
```

- **Module missing / executable missing:** run `pnpm install && pnpm build` from the monorepo root. Packages build in dependency order.
- **Slow integration tests on WSL:** repeated Node launches were substantially slower on the Windows-mounted checkout used during development. The suite caps workers at two and allows 120 seconds per multi-command workflow; each CLI subprocess is limited to 20 seconds.
- **No directions meet constraints:** read the per-style reasons; inspect allowed IDs, complexity, density, font delivery/languages, fixed palette, and contrast. Preserve access requirements. A 7:1 target is intentionally restrictive.
- **Existing artifacts:** review `DESIGN.md`/DNA, use `--dry-run`, and use `--force` only for an intended replacement. `init --force` resets the brief and config; `generate --force` replaces the three generated files.
- **Write lock remains after a crash:** ensure no TasteForge writer is active, inspect `.tasteforge/.write-lock`, then remove the stale lock manually and regenerate the artifact bundle. Individual files are atomic; the bundle is not a crash-atomic transaction.
- **No audit findings:** confirm the path contains `.css`, `.tsx`, or `.jsx`. Dynamic/utility-driven styling may require rendered review. An empty report is not a design-quality score.
- **Path or symlink rejected:** keep inputs inside `--project` and `.tasteforge` as a real local directory. Intentional external projects can be selected explicitly with `--project`.

See [CONTRIBUTING](CONTRIBUTING.md), [knowledge extension](docs/extending-knowledge.md), [release preparation](docs/releasing.md), and [benchmark methodology](evals/README.md). Original code and prose use the [MIT license](LICENSE); no font binaries or third-party source text are bundled.

Next priorities: gather real agent-integration evidence, expand AST-aware audit coverage with project token imports, validate more languages, and run the published benchmark methodology with independent reviewers. No benchmark improvement results are claimed.

# TasteForge — UI Design Intelligence for AI Coding Agents

**Less slop. More taste.**

TasteForge is an open-source **Agent Skill and TypeScript CLI for context-aware UI design**. It helps AI coding agents choose design directions, generate CSS design tokens, and audit CSS, JSX, and TSX source. Recommendations use product context, accessibility constraints, and seeded sampling to produce reproducible design decisions with explanations.

The local design intelligence engine turns a product brief into **Design DNA**: a versioned specification of typography, colors, spacing, layout, motion, and accessibility constraints. The bundled skill guides an agent through UI creation, redesign, and refinement while preserving an existing design system when appropriate.

The beta.2 skill uses [proportional workflows](docs/lean-workflows.md): Fast for bounded corrections, Standard for a clear new screen/flow, and Explore when structure is genuinely undecided. It loads references as needed and can reuse an optional browser checkpoint helper with existing Playwright. No model service or new CLI command is required.

[Documentation](docs/README.md) · [CLI reference](docs/cli.md) · [Agent Skill](skills/tasteforge/SKILL.md) · [Releases](https://github.com/longhang2004/TasteForge/releases)

## TasteForge at a glance

| Property            | Details                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Purpose             | UI/UX design guidance and reproducible design decisions for AI coding agents                          |
| Interfaces          | Portable Agent Skill, `tasteforge` CLI, and TypeScript packages                                       |
| Commands            | `init`, `suggest`, `generate`, `audit`, `catalog`, `inspire`                                          |
| Design knowledge    | 20 style profiles, 32 font pairings, and 20 color palettes in versioned JSON                          |
| External references | 172 style documents/rows, 357 contextual rule records, 113 template/structure records                 |
| Generated artifacts | `design-dna.json`, semantic `tokens.css`, and project `DESIGN.md`                                     |
| Static audit scope  | CSS declarations and literal JSX/TSX styles; verified source conditions, heuristics, and review items |
| Runtime             | Node.js 20.19+; pnpm workspace; local filesystem state                                                |
| License and status  | MIT; 0.2.0-beta.2 source; npm packages unpublished                                                    |

No API keys, external LLM calls, database, or cloud service are required. Core operations make no network requests. Static source checks identify implementation issues and review questions; rendered UI inspection and accessibility testing remain separate work.

## Quickstart from source

Requires Node **20.19+** and **pnpm 10.13.1**. Node 22, 24 or 26 LTS is recommended for development; Node 20 is retained for compatibility. Package names are reserved here as the intended release names; a registry release has not been published or verified.

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
- **`catalog`** searches 642 attributed offline reference records from 18 pinned sources and reads selected documents with provenance and license notices. **`inspire`** samples distinct external visual references with task-matched structural examples and fixed review gates. These are reference inputs, not additional validated token-generating profiles. See [catalog scope and commands](docs/reference-catalog.md).

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

For substantial new UI or redesign, the skill now uses [reference-led structural planning](docs/reference-led-design.md) before visual style selection. It can research public designs/repositories or use [the offline catalog](docs/reference-catalog.md), record sources, compare task/layout alternatives, and write a `UX_PLAN.md`. Imported reference IDs do not generate tokens; `suggest`/`generate` retain their validated 20-profile pool. [Worked plans](examples/ux-plans/transfer.md) show the distinction between structural choices and a font/palette change.

Copy the whole `skills/tasteforge` folder into the skill discovery location documented by your agent, preserving references and workflows. Then invoke `tasteforge` using the agent's supported skill mechanism or explicitly ask it to follow `SKILL.md`. The CLI package includes the same skill folder for distribution.

Optional [effect/composition guidance](skills/tasteforge/references/effects-and-composition.md) researches text emphasis, image treatments, responsive layouts and motion by task purpose, with static/reduced-motion and source/reuse checks. [Three original effect studies](examples/effects-lab/README.md) demonstrate these mechanics. This reference list is separate from CLI catalog ingestion and seeded sampling.

[Surface purpose and targeted refinement](docs/impeccable-informed-workflow.md) identify the visitor's success on each screen and guide scoped edits that reduce clutter, clarify meaning, adapt context or adjust emphasis. The [annotated gallery](examples/design-gallery/README.md) explains actual repairs, retained choices and structural tradeoffs using preserved captures. These are skill workflows and authored examples, not new CLI commands or a runtime detector.

For substantial undecided layouts, [the revision workflow](skills/tasteforge/workflows/structure-and-revise.md) compares runnable task slices, then records actual render findings and rechecked edits. The [inventory worked composition](examples/inventory-workbench/README.md) demonstrates this with a compact desktop table and retained mobile detail/review/recovery. It is agent-authored; human design approval and representative-user testing remain pending.

Automated verification covers skill resources and the CLI integration workflow. A beta.2 smoke completed one native Windows Codex explicit repo-skill invocation; a later native OpenCode 2/Vilao smoke loaded the same standalone ZIP and produced two checked UI slices. [Host evidence and limits](docs/host-integration.md) record the exact scopes and remaining coverage. Broad integration across agent applications is not certified.

## Frequently asked questions

### Does TasteForge require an API key or an internet connection?

The CLI's recommendation, generation, and source-audit operations run locally without API keys or LLM calls. Initial dependency installation may access the package registry. Font delivery is configured separately; TasteForge does not download font files.

### How do I install the CLI or the standalone Agent Skill?

Use the [source quickstart](#quickstart-from-source) for the CLI. For the 0.2 beta skill, copy the current `skills/tasteforge` folder or use the matching skill ZIP from [GitHub releases](https://github.com/longhang2004/TasteForge/releases). Preserve the folder's references/workflows/scripts. The v0.1.0 release contains the older four-command MVP and does not include the beta workflows. The npm packages are not yet published.

### Can I use TasteForge with Codex, Claude Code, or Cursor?

TasteForge provides a portable `SKILL.md` with references and workflows. Use a host's supported skill mechanism or explicitly supply the instructions. Native Windows Codex and OpenCode 2/Vilao explicit repo-scope ZIP invocations were observed; implicit triggering and broader host coverage remain unassessed. See [host integration evidence](docs/host-integration.md) for installation scope, repeat steps and limits.

### Will TasteForge preserve my existing design system?

The skill's refinement workflow preserves established tokens and components. If a brief names an existing design system and `preserveExisting` is true, the engine refuses to propose a replacement direction. An authorized redesign can change that setting while retaining fixed constraints. See [brief and design constraints](#brief-and-design-constraints).

### Does TasteForge perform a visual or complete accessibility audit?

The audit parses supported source files and reports evidence about their declarations and structure. It does not inspect screenshots, resolve the complete CSS cascade or utility classes, or test runtime interaction. Contrast findings describe statically resolved color pairs. Review the [audit scope](docs/cli.md#audit-scope) and inspect the rendered interface separately.

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

An [exploratory UI comparison pilot](evals/runs/2026-11-01-ui-pilot/README.md) preserves eight actual interfaces generated by two models, without and with TasteForge. Inspect its [screenshots](evals/runs/2026-11-01-ui-pilot/screenshots.md), comparison gallery instructions, and [results with limitations](evals/runs/2026-11-01-ui-pilot/report.md). One generation per condition is an example study, not a general improvement claim.

```text
packages/
  knowledge/src/          Zod schemas and versioned curated JSON
  core/src/               Pure ranking, sampling, DNA, tokens, static audit
  cli/src/                Commander interface and bounded filesystem operations
skills/tasteforge/
  SKILL.md                Progressive-disclosure entrypoint
  references/             Eleven focused design/research references
  workflows/              Research/plan, create, redesign, audit/refine
examples/                  Brief, generated artifacts, deliberately flawed source
tests/                     Unit and end-to-end CLI tests
evals/                     Ten benchmark prompts and an unscored evaluation rubric
docs/                      Architecture, CLI, knowledge extension, release guide
.github/workflows/ci.yml    Build, checks, tests on Node 20/22/24/26
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

See [CONTRIBUTING](CONTRIBUTING.md), [knowledge extension](docs/extending-knowledge.md), [release preparation](docs/releasing.md), and [benchmark methodology](evals/README.md). Original code and prose use the [MIT license](LICENSE); bundled external references retain their upstream notices. The CLI packages and standalone skill do not bundle font binaries or UI image assets. Evaluation source archives include local OFL font fixtures and original SVGs with asset-specific manifests/notices.

Next priorities: gather real agent-integration evidence, expand AST-aware audit coverage with project token imports, validate more languages, and run the published benchmark methodology with independent reviewers. Exploratory results and their limitations are recorded; no general UX improvement is established.

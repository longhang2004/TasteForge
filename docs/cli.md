# CLI reference

Global options work before or after the command: `--project <existing-directory>` (default `.`), `--format text|json`, `--version`, `--help`.

| Command        | Options                                                                                                                                            | Output                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `init`         | `--force`, `--dry-run`                                                                                                                             | `.tasteforge/brief.json`, `config.json`                                                                        |
| `suggest`      | `--brief <file>`, `--count 1..20` (3), `--seed 0..4294967295`                                                                                      | Compatible directions, full metadata, scores, weights, rationale                                               |
| `catalog [id]` | `--kind style\|rule\|template`, `--task <task>`, `--source <id>`, `--query <text>`, `--limit 1..100` (20), `--offset <n>` (0), `--include-retired` | Metadata search or a complete attributed stored reference                                                      |
| `inspire`      | `--task <task>` required, `--brief <file>`, `--count 1..20` (3), `--seed <uint32>`, `--query <text>`, `--source <id>`                              | Seeded external style references, task-tagged structures, contextual rules, fixed review gates and limitations |
| `generate`     | `--direction <id>` required, `--brief <file>`, `--seed <uint32>`, `--force`, `--dry-run`                                                           | DNA, CSS tokens, DESIGN.md                                                                                     |
| `audit`        | `--path <source>` (`src`), `--resolve-imports`, `--fail-on error\|warning\|never`                                                                  | Static source report, locations and evidence categories                                                        |

Brief paths default to `.tasteforge/brief.json`. Inputs must be project-local; absolute inputs within `--project` are accepted. No interactive prompts are required. Commands never silently overwrite output. Dry runs print planned filenames and validate inputs but do not expose a full rendered artifact preview.

## Brief contract

Required: nonempty `productType`, `industry`, `audience[]`, `goals[]`, `brandPersonality[]`. Values are free-text with exact tag/word matching; use the catalog's vocabulary for useful results:

- Product: `service`, `dashboard`, `tool`, `documentation`, `education`, `publication`, `portfolio`, `commerce`, `community`, `marketing`.
- Industry: `fintech`, `education`, `healthcare`, `technology`, `public`, `media`, `culture`, `creative`, `fashion`, `retail`, `craft`, `hospitality`, `wellness`, `environment`, `science`, `entertainment`.
- Audience: `general`, `professionals`, `experts`, `operators`, `beginners`, `seniors`, `students`, `teachers`, `families`, `readers`, `buyers`, `creators`, `enthusiasts`.
- Brand: choose concrete tags such as `precise`, `trustworthy`, `inclusive`, `warm`, `calm`, `refined`, `bold`, `playful`, `expressive`, `technical`, `rational`, `restrained`, `thoughtful`, `optimistic`, `direct`.

Optional `schemaVersion` defaults to `1.0`; creativity defaults to 0.35; seed defaults to 42 unless overridden. Free prose is retained, but lexical matching does not understand all synonyms.

`existingConstraints`: `preserveExisting` (true), optional `designSystem` description, optional `allowedDirections[]` (an empty array deliberately allows none), `excludedDirections[]` ([]), optional fixed `fontPairId` / `paletteId`, `maxComplexity` (low/medium/high; medium), optional `density` (spacious/balanced/dense), `fontDelivery` (any/system; any).

`accessibility`: `languages` (nonempty subset of en/vi; en), `minContrast` (4.5 or 7; 4.5), `reducedMotion` (true). Fonts with unverified requested languages are excluded. Every direction supports reduced motion; a true preference sets the generated default motion duration to zero. The CSS media query always honors the OS preference even when the brief permits motion.

All schemas reject unknown fields and bound text/array sizes. The catalog IDs are in `packages/knowledge/src/data/knowledge.json`. Incompatible IDs produce per-style explanations rather than silent fallback.

## Audit scope

The default audit remains source-only. Opt in to a bounded static CSS graph when imported tokens are relevant:

```sh
tasteforge audit --path src/entry.css --resolve-imports --format json
```

Leading unconditional local CSS `@import` statements can supply unambiguous top-level `:root` tokens, aliases and missing-variable fallbacks to files in that entry. Reports include loaded files, import edges/status, entry contexts and optional definition/provided/fallback provenance. Text output includes source locations; JSON retains structured evidence. Each selected CSS file is a separate entry; prefer an entry file over directory selection for application context. JSX/TSX retains its existing inline source audit and its module imports are never followed.

Missing, remote, conditional, cyclic, scoped, conflicting or otherwise unsupported context stays review. The CLI performs bounded project-local reads without execution or fetching, rejects linked imports and excludes dependency/build/VCS directories. See the [supported syntax, bounds and limitations](audit-imports-rfc.md) and [runnable fixture](../examples/audit-imports/README.md). This option does not establish the runtime cascade or rendered accessibility.

| Rule                        | Evidence                                     | Scope                                                                                                                                     |
| --------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `parse-error`               | Verified error                               | PostCSS syntax or JSX/TSX syntax diagnostic                                                                                               |
| `contrast-pair`             | Verified numeric pair; warning               | Same declaration scope, literal opaque hex/black/white, optionally resolved variables; does not establish cascade or text-size exceptions |
| `font-fallback`             | Verified declaration condition; warning      | Font-family stack lacks a terminal unquoted CSS generic                                                                                   |
| `malformed-token`           | Verified supported-contract violation; error | Malformed var name or unsupported TasteForge scalar value                                                                                 |
| `unknown-token`             | Heuristic warning                            | Referenced `--tf-*` token unavailable in DNA or local root declarations; external imports may supply it                                   |
| `hardcoded-token`           | Heuristic warning                            | A supported literal duplicates an available generated semantic token                                                                      |
| `off-scale-value`           | Heuristic warning                            | A supported color/length differs from available role tokens; length conversion assumes 16px root                                          |
| `repeated-gradients`        | Heuristic warning                            | Three or more gradient functions in one file                                                                                              |
| `nested-cards`              | Heuristic warning                            | Three static card-like JSX ancestors; conventions may be intentional                                                                      |
| `typography-drift`          | Heuristic warning                            | More than three declared font-family stacks in one file                                                                                   |
| `contrast-review`           | Human/rendered review                        | Unresolved same-scope pair or compositing effect                                                                                          |
| `dynamic-style-review`      | Human/rendered review                        | Recognized JSX styles contain computed values, spreads, or references                                                                     |
| `import-resolution-review`  | Static context review, opt-in                | Unsupported, missing, cyclic or over-depth stylesheet import                                                                              |
| `stylesheet-context-review` | Static context review, opt-in                | Escaped bindings/registrations or CSS Module roots make the context incomplete                                                            |
| `token-resolution-review`   | Static context review, opt-in                | A variable-valued declaration cannot be resolved safely within its entry context                                                          |

Unsupported styling is not executed or reverse engineered. Remote CSS token imports, Tailwind classes, CSS-in-JS template literals, Sass, CSS modules' runtime composition, property inheritance, alpha colors, general color functions, pseudo-element text, and arbitrary component behavior remain outside the analysis. Local CSS imports require the opt-in subset above. JSX card detection recognizes literal `className` values and `Card` component names. It does not inspect component internals.

Contrast uses the WCAG sRGB relative-luminance formula; see [W3C's definition](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum). CSS parsing uses [PostCSS](https://postcss.org/api/); JSX parsing uses the [TypeScript compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API). The report always says it inspected source only.

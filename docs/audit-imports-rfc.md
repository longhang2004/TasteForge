# Bounded static stylesheet resolution — v1

Status: implementation candidate for LON-98, after beta.2. This is an opt-in source audit, not a runtime cascade or rendered accessibility engine.

## Contract

`audit --resolve-imports` follows a selected CSS file's static local `@import` relationships. The default command and `auditSource` keep their existing output/behavior. The pure core API accepts supplied CSS strings; only the CLI reads files. No application, stylesheet, JavaScript or upstream code is executed, and no network/package resolution occurs.

V1 supports top-level, unconditional, leading `@import "tokens.css"` and `@import url("./tokens.css")`, including nested local stylesheet imports. Plain relative URL paths can contain spaces/Unicode. Query/fragment/escaped/encoded URLs, external/absolute URLs, conditional/layer imports, late/nested imports and CSS Modules are review items. JSX/TSX retains its existing source-only inline audit; its JavaScript/module import graph is not followed. Unimported sibling stylesheets never silently supply variables.

The new report uses mode `static-imports` and resolution version `1.0`, with roots, loaded files, import edges/status, findings and token provenance. Generator engine/knowledge, DNA schema and reference sampling contracts are unchanged. Findings retain verified numeric/source conditions, heuristic suggestions and review items; the new API adds optional provenance without widening the legacy finding schema.

## Conservative value resolution

Each selected stylesheet is an explicit entry. Its dependency closure supplies simple custom-property names from unconditional, top-level literal `:root` rules to every file within that entry, including imported components. Acyclic aliases and missing-variable fallbacks are resolved within that closure. Independent entries do not exchange definitions. Findings identify their `entries`; identical findings merge entry lists, while a shared file can have different findings under different entries. The result's `contexts` records each entry's files and completeness. Directory selection treats every selected CSS file as an entry; use `--path entry.css` when reviewing an application's stylesheet entry. Available generated DNA tokens remain explicit supplied context, rather than evidence that an application loaded them.

Conflicting definitions, scoped/conditional definitions, import cycles, incomplete imports, alias cycles/depth limits and unsupported values remain unresolved. A fallback is not used to hide a blocked/ambiguous definition. A missing variable can use a fallback only when the stylesheet context is complete. Literals can still establish a numeric declared pair, but resolved source relationships do not prove selector matching, inheritance, ordering across application entries, composition or computed browser values.

Escaped property/at-rule names and CSS Module roots make the context incomplete, because they may hide bindings. Escaped values and adjacent variable tokens requiring CSS grammar validation stay unresolved. String substitution must not invent a valid color or dimension by joining tokens.

This boundary follows the [CSS variable substitution model](https://www.w3.org/TR/css-variables-1/#using-variables): substitution preserves CSS tokens, so adjacent tokens cannot simply be joined into a new color/dimension. Function-name handling follows [CSS functional notation](https://www.w3.org/TR/css-values-4/#functional-notation); custom-property names retain case.

Provenance identifies the actual definition/import/use declaration's file/line/column, or explicit supplied context. These are declaration starts, not substring offsets within multiline `var()` values. Source locations remain project-relative. The implementation does not concatenate/rewrite source before parsing findings, so diagnostics keep original locations.

## Bounds and filesystem boundary

- At most 256 supplied/loaded CSS files, 1024 import edges, 16 import hops, 16 alias/fallback expansion levels and 5000 custom-property definitions; 2 MB per file and 16 MB aggregate UTF-8 input. Analysis caps 20000 declarations, 2000 findings and 512 distinct file/context audits. Equivalent contexts reuse source results. Expanded values stop at 4096 characters and provenance at 32 origins per resolution, preventing alias fan-out from growing indefinitely.
- Existing default traversal limits remain unchanged. Opt-in over-budget roots/input fail explicitly; an unresolved imported edge is reported as review, not silently counted as complete.
- The CLI resolves local CSS imports inside the canonical project root, rejects symlink components, hardlinked stylesheet files and excluded dependency/build/VCS directories, and uses the existing bounded regular-file reader. Generated `.tasteforge/tokens.css` can be followed as an explicit local import.
- There is no automatic install, remote fetch, package alias resolution or JavaScript evaluation. The project must be controlled by the caller; checks are not a defense against malicious concurrent filesystem mutation.

## Acceptance evidence

Tests must cover useful cross-file contrast/font/token hints and provenance; nested aliases/fallbacks; sibling isolation; duplicates/conflicts and scoped/conditional definitions; malformed, missing, remote/conditional/late imports; cycles and resource bounds; path escapes, symlink components and generated-token imports; legacy JSON/exit behavior and packed CLI execution. A bounded synthetic graph records performance separately from correctness assertions. Frozen evaluation runs are not edited or rerun as new quality evidence.

The supported subset and unresolved reasons are part of the result. A clean report does not establish human usability, visual quality or accessibility conformance. JavaScript token exports, bundler graphs, Sass/Tailwind, CSS Modules and full cascade/render analysis remain separate work.

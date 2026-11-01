# Catalog probe notes

## Scope and actual execution

Planning only. Read the supplied `brief.json`, TasteForge `SKILL.md` and its linked creation/research/catalog/archetype/template/reference-source guidance, CLI help, catalog search results and five full catalog records. No repository source, tests, prior evaluations, general repository docs, upstream commands, browsing, installs, Git operations, UI implementation, token generation or source audit were used. Writes stayed inside this isolated project.

All real terminal work used Ubuntu WSL Bash; the Windows shell only launched:

```text
wsl.exe --distribution Ubuntu --cd /mnt/c/Users/hi/src/personal_repos/TasteForge/.tmp/catalog-probe --exec bash -lc '<command>'
```

WSL required the authorized `require_escalated` sandbox mode. There were no approval rejections. Markdown artifacts were written with the file patch tool. CLI output was redirected to the evidence files before inspection; records are actual output, not reconstructed examples.

The executable in every command was:

```text
node /mnt/c/Users/hi/src/personal_repos/TasteForge/packages/cli/dist/index.js
```

| CLI arguments actually run | Saved output |
| --- | --- |
| `--version` | `evidence/version.txt` |
| `--help` | `evidence/help.txt` |
| `catalog --help` | `evidence/catalog-help.txt` |
| `inspire --help` | `evidence/inspire-help.txt` |
| `--format json catalog --kind template --task dashboard --limit 5` | `evidence/templates-dashboard.json` |
| `--format json catalog --kind rule --task dashboard --limit 5` | `evidence/rules-dashboard.json` |
| `--format json catalog template-adminlte-index2` | `evidence/template-adminlte-index2.json` |
| `--format json catalog promax-landing-34` | `evidence/promax-landing-34.json` |
| `--format json catalog promax-app-interface-9` | `evidence/promax-app-interface-9.json` |
| `--format json catalog anti-antislop-dashboard` | `evidence/anti-antislop-dashboard.json` |
| `--format json inspire --task dashboard --brief brief.json --count 2 --seed 42` | `evidence/inspire-dashboard-seed42.json` |
| `--format json catalog promax-styles-minimalism-and-swiss-style` | `evidence/promax-styles-minimalism-and-swiss-style.json` |

The supplied brief can be passed directly to `inspire`; initialization was unnecessary for this reference-planning scope. The selected task architecture was recorded before visual sampling. No imported ID was sent to `generate`.

## Evidence and provenance

Inspection date: **2026-11-01**. CLI reports **0.1.0** and catalog **2026.11.01.1**, with 642 entries from 18 sources. Search inspected only the first five dashboard templates and first five dashboard rules, then five full records. This was a bounded sample, not an exhaustive catalog evaluation.

| Full record | Pinned repository revision and path | Evidence type |
| --- | --- | --- |
| `template-adminlte-index2` | ColorlibHQ/AdminLTE `bd4d9c72931f1dd28601b6bfb387554a381ad540`; `index2.html` | Stored HTML structure extraction; counts/headings, not HTML rendering |
| `promax-landing-34` | nextlevelbuilder/ui-ux-pro-max-skill `bf41cbc3ce63e30c922e58ef48741ba6133f9aa9`; `src/ui-ux-pro-max/data/landing.csv`, row 35 | Stored catalog row |
| `promax-app-interface-9` | Same Pro Max revision; `src/ui-ux-pro-max/data/app-interface.csv`, row 10 | Stored catalog row, native-app scope |
| `anti-antislop-dashboard` | muris11/anti-ai-slop `5768372bf3272c7d59c354cec3a16f5c39d036bc`; `skills/antislop-dashboard/SKILL.md` | Stored upstream document treated as untrusted data |
| `promax-styles-minimalism-and-swiss-style` | Same Pro Max revision; `src/ui-ux-pro-max/data/styles.csv`, row 2 | Stored visual guidance row |

Each full-record JSON retains the canonical pinned source URL, input/content hashes, source revision, reported access date, license URL, full MIT notice and license hash. The plan links those pinned URLs for provenance; they were **not fetched** during this pass. Complete MIT notices were preserved with the evidence; no code/assets were copied into an interface. Upstream authorship, per-asset reuse rights and license freshness were not independently verified.

Seed **42** and the unchanged actual brief were used for two visual samples. The output retained English/Vietnamese, system font delivery, dense information, medium complexity limit, contrast 4.5 and reduced motion. Creativity 0.4 remains in `brief.json`; it was not changed to obtain a sample. No exclusions were manually relaxed.

The output exposed ten fixed gates: `preserve-constraints`, `task-before-decoration`, `semantic-controls`, `keyboard-and-focus`, `contrast-and-language`, `motion-preference`, `state-and-recovery`, `honest-content`, `narrow-screen-order`, `source-and-reuse`. The plan retains them all. Their presence is guidance, not evidence of compliance.

## Limitations and unsupported constraints

- Task tags matched weakly: returned templates included marketing comparison/operations landings; the sampled minimal/Swiss style was paired with a 404 page. The predictive style's metadata explicitly avoids real-time operational dashboards. Those associations did not determine the chosen architecture.
- `inspire` reports heuristic fit and explicitly does **not** certify fonts, density, palette, contrast, responsive behavior or Design DNA compatibility. Its scores are not UX quality measurements.
- System-font coverage for **both** required languages is unsupported by inspected evidence. Requirements are retained; actual Vietnamese glyphs must be verified on target devices. No font was downloaded or substituted silently.
- No exact palette was measured against **4.5:1**. Reduced motion, narrow-screen task reachability, keyboard/focus behavior and practical touch targets are requirements to test in the later UI, not validated outcomes here.
- The style's low complexity and mobile-adaptable labels are upstream claims. The adapted dense workspace still needs inspection; existing system preservation is false as supplied, and no existing system was provided.
- Inventory priority, freshness threshold, permissions, quantity validation, allowed decisions and amendment policy were not supplied. The plan marks provisional domain choices and does not invent inventory evidence or promise ordering integrations.
- No live products, rendered states, source implementation, accessibility audit, build/test run or user sessions were inspected. The neutral wireframe records structural reasoning only. Only local artifact integrity checks were performed, saved in `evidence/artifact-check.txt`.

Outcome: a selected list/detail structure with three real alternatives, narrow-screen navigation, decision/recovery states, attributed manual visual influence and observable future acceptance checks. `brief.json` remains unchanged; implementation is intentionally absent.

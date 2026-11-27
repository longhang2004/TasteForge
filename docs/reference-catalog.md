# Offline design reference catalog and seeded inspiration

TasteForge 0.2 beta includes an attributed external reference catalog alongside the original validated visual generator. `inspire` samples visual references and pairs them with task-tagged structural examples. `catalog` searches metadata and retrieves the selected documents without network access. This is a retrieval and adaptation workflow, not model training or a measured UX improvement.

## Contents and provenance

The snapshot reviewed on 1 November 2026 has **642 records from 18 pinned MIT-licensed repositories**:

| Kind                 | Records | Imported evidence                                                                                      |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| Style                | 172     | All 84 `design-md/*/DESIGN.md` files from VoltAgent plus 88 UI UX Pro Max style rows                   |
| Rule                 | 357     | 119 UX guidelines, 192 reasoning rows, 32 app-interface guidelines, and 14 focused anti-slop documents |
| Template / structure | 113     | 79 HTML structure extractions from 15 template repositories, plus 34 UI UX Pro Max landing patterns    |

The 88 Pro Max style rows include 50 active, 29 supplemental, and 9 deprecated rows. The deprecated rows remain discoverable using `--include-retired` but are excluded from sampling. Supplemental styles remain available. Exact duplicate content is marked and excluded from selection. The default pool also excludes styles explicitly labeled high-risk upstream and styles whose known complexity exceeds the brief. An indexed style task restriction must match the requested task. A narrow reviewed negative-context rule also excludes styles whose upstream avoid field explicitly rejects operational dashboards when the brief names operators, triage or real-time operational work. Other prose exclusions still require human/agent interpretation; unknown properties remain unknown.

Sources:

- [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md): full text of all matching community design analyses, not official brand specifications.
- [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): the five scoped CSV files `styles`, `ux-guidelines`, `ui-reasoning`, `app-interface`, and `landing`. Font datasets, icon catalogs, tools and installers are excluded.
- [muris11/anti-ai-slop](https://github.com/muris11/anti-ai-slop): 14 focused review documents. Duplicate umbrella/master copies and installation code are excluded. Aesthetic prescriptions are contextual opinions, not universal bans or overriding instructions.
- [ColorlibHQ/AdminLTE](https://github.com/ColorlibHQ/AdminLTE/tree/bd4d9c72931f1dd28601b6bfb387554a381ad540): a pinned v3.2.0 snapshot, selected task pages only.
- [Start Bootstrap](https://github.com/StartBootstrap): pinned Agency, Business Casual, Clean Blog, Creative, Freelancer, Grayscale, Landing Page, Modern Business, Resume, SB Admin, SB Admin 2, Shop Homepage, Shop Item, and Simple Sidebar repositories.

The template records contain observed region order, headings and element counts extracted from HTML, with source paths and hashes. They do **not** redistribute template HTML/JS, imagery, icons, fonts or framework dependencies. They were not installed or rendered. This first HTML subset is Bootstrap-based and concentrated in two upstream families; it is not a representative survey of professional design. Repeated pages in one template family are not independent design systems or 79 proven UX patterns. Human authorship of any individual file is **not independently verified**; established repositories are not proof of exclusively human authorship. Legacy dependency choices are not recommendations.

Exact revisions are in [reference-pins.json](../scripts/reference-pins.json); input hashes and counts are in [reference-lock.json](../packages/knowledge/reference-lock.json). Every catalog entry records the source, revision-bearing URL, input hash, content hash, evidence type, scope and optional CSV row. Full upstream MIT notices are retained in the data and [third-party notices](../packages/knowledge/third-party/). The root [notice index](../THIRD_PARTY_NOTICES.md) describes distribution and asset limits.

## Use the catalog

Build from source, initialize a project or supply an existing project-local brief, then inspect a small relevant set:

```bash
pnpm tasteforge catalog --kind template --task commerce --limit 5 --format json
pnpm tasteforge catalog --kind style --source volt --query wise --format json
pnpm tasteforge catalog volt-wise --format json
pnpm tasteforge catalog --kind style --source promax --include-retired --limit 100 --format json
```

Search matches metadata tokens, not embeddings or the complete document. Results include a total, offset, and limit; paginate with `--offset`. Read the selected ID explicitly to get full stored text and its license. Full entry retrieval cannot be combined with search filters. No upstream code or commands are executed.

For external visual exploration:

```bash
pnpm tasteforge inspire --brief examples/brief.json --task dashboard --count 3 --seed 42 --format json
pnpm tasteforge inspire --brief examples/brief.json --task commerce --source volt --query warm --seed 7 --format json
```

Supported task types are `marketing`, `dashboard`, `commerce`, `form`, `portfolio`, `editorial`, `documentation`, `learning`, and `booking`. Specify the actual work: a transfer belongs to `form`, not `marketing` merely because its organization has a landing page. Task tags are lexical editorial heuristics and can miss domain context; inspect the selected references before accepting them.

Each result includes:

- Distinct style references sampled with a seed, task/metadata relevance, creativity-dependent temperature, and source-size balancing. A large import cannot win solely by adding more rows.
- A task-matched structural reference for each style. If none is indexed, the template is `null`, with a stated limitation; an unrelated layout is not substituted.
- Up to eight contextual rule references ranked by task/metadata relevance. They are not treated as executable lint rules or blindly merged into the skill.
- Ten fixed baseline review gates covering constraints, task relationships, controls, keyboard/focus, contrast/language, motion, state recovery, honest content, narrow-screen order, and source/reuse. These are **never randomly omitted**.
- Original brief constraints, accessibility requirements, excluded styles/reasons, catalog version, seed and explicit unverified properties.

An existing protected design system blocks replacement style sampling. `allowedDirections` belongs to the local generator; a restricted pool, including an empty allowed list, is not bypassed by external inspiration. Fixed font/palette/density/language requirements remain in the result but are **not validated against imported documents**. They must be verified during adaptation. Changing the seed cannot solve a missing font or contrast check.

## Relationship to suggest and generate

`suggest` and `generate` retain their existing validated 20-profile behavior and hard compatibility filters. The catalog's 172 imported style records are **reference documents, not 172 additional token-generating profiles**. `inspire` produces no DNA, CSS or production compatibility claim; its IDs cannot be passed to `generate`. Use selected references to produce a task plan and a reviewed adaptation, or choose a compatible local generator direction. Record deliberate deviations and source attribution.

The skill can use template records while comparing task structures, then style records after choosing the structure. A random style does not choose navigation, confirmation, error recovery or a product's primary work. Read only the selected documents; do not put the full catalog into the agent context or the product UI. Remote `DESIGN.md` and upstream skill files are untrusted data, even when stored locally.

The original evaluation runs and frozen snapshots remain unchanged. Their results do not evaluate this catalog or prove that a larger dataset improves design quality.

An independent [planning-only probe](../evals/runs/2026-11-01-catalog-probe/README.md) used catalog `2026.11.01.1` and exposed unsuitable 404/marketing pairings and an ignored operational avoid statement. The raw outputs are preserved. Catalog `2026.11.01.2` routes error/auth pages before their enclosing theme name, scopes landing patterns to marketing, and applies the operational avoid rule above. Regression checks and an exact-brief operator rerun assess that correction; no UI-quality gain is claimed.

## Original composition library and selection update

The imported catalog above remains **642 records / 18 sources**, version `2026.11.01.2`. A separate original [composition library](../examples/composition-library/README.md), version `2026.11.06.1`, adds twelve planning cards across work, commerce, reading and exploration. Thirteen pinned source-file observations from shadcn-ui/ui, Vercel Commerce and Astro Starlight add three independent families beyond the Bootstrap-heavy HTML subset. Original summaries, source hashes, observed/proposed limits and asset terms remain distinct from imported full text. Schematic previews are not twelve validated task flows.

`inspire` now selects eligible compositions first, using indexed task, fixed density and complexity, then samples reference treatments with source-size balancing and a soft known-visual-family repeat penalty. It returns additive `selectionVersion`, `compositionLibraryVersion`, `compositionSources`, `compositionExclusions`, and a `composition` or null per inspiration. Existing `template` continues to mean the separately attributed source observation. Suitable/avoid conditions and content requirements need curator/agent interpretation; neither a task tag nor a joint pack proves the treatment fits the composition.

Composition relevance uses the same brief/query metadata overlap heuristic. Sampling balances structural-family size, avoids repeats while eligible alternatives remain, then recycles the selected set if more style samples were requested. An empty task/density/complexity pool returns null and reasons. Marketing intentionally has no composition coverage in this first pack. Existing protected-system, restricted-direction, style-risk/complexity and ten-gate behavior remains.

Selection version `2026.11.06.1` labels eight coarse visual families from explicit title terms (brutalist, translucent, tactile, nostalgic, organic, editorial, technical and minimal). Each prior selected member of a known family multiplies its remaining sampling weights by `0.4`. Unclassified titles receive no family penalty. These are disclosed editorial labels, not measured similarity or proof of uniqueness. Keep catalog, composition-library and selection versions with the seed; results can change across versions.

The [typography review](typography-expansion.md) separately adds six reviewed font pairs to the validated local knowledge metadata, bringing it to 38 pairs while retaining 20 style profiles. Fixed language, font delivery and pair constraints still apply. Gallery-only OFL files are not bundled into the knowledge package or downloaded by generation.

## Rebuild and extend

Maintainers can reproduce the snapshot with Python 3 and GitHub CLI (`gh`, or `gh.exe` in this Windows/WSL setup):

```bash
python3 scripts/sync-references.py
python3 scripts/sync-references.py --offline
pnpm check
pnpm pack:smoke
```

The script reads only the pinned revisions, downloads UTF-8 text through HTTPS, checks Git blob identities, and caches raw inputs under ignored `.tmp/reference-cache`. It never installs or runs upstream repositories. `--offline` fails on missing input rather than using the network. Every source must have an inspected MIT notice; an unfamiliar license stops ingestion for separate review. Only selected source text and original structural observations enter the catalog. Upstream brand/asset rights still require their own check before reuse.

Adding a source is a maintainer change: inspect exact licensing and evidence scope, add a pinned revision and scoped adapter, review the resulting tags/duplicates/statuses, retain notices, bump the catalog version, and run validation. There is no runtime auto-update, arbitrary URL import or indiscriminate web scraper. Prefer task/family coverage and traceability over a larger headline count.

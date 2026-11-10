# 16 — Rendered evidence annotations: RFC and controlled prototype

Date: 2026-11-10. Status: draft RFC; a controlled example is authorized by the owner's request to continue. Production integration remains a separate decision. Issue: [LON-105](https://linear.app/long-hang/issue/LON-105/rfc-rendered-auditannotation-workflow-with-traceable-evidence). Baseline: `ee88336f3a08a4874133fa9ea77c1359cf1a37ad`, on top of [PR #6](https://github.com/longhang2004/TasteForge/pull/6).

## 1. Question and recommendation

Can an authored, source-bound annotation explain what existing UI evidence does and does not establish, with less repeated detective work and without inventing a browser detector?

The [copy/state retrospective](../../research/2026-11-10-copy-state/retrospective.md) exposed a concrete distinction: cabinet's source contains a lower empty-state reset, while its retained viewport visibly contains a different top reset. Proofdesk's failed-approval capture retains paper/copies, while the source establishes an in-memory lifetime rather than an account save. A source selector, screenshot and historical behavior result answer different questions.

Recommend an **agent-workflow example using immutable snapshots**. Keep the public static audit and its bounded source/CSS-import contract unchanged. An annotation is a presentation of an observation and a decision, not automatic detection or proof that a problem exists. A useful outcome can be keep or unassessed.

## 2. Approaches considered

| Approach                                         | Benefit                                                             | Limitation                                                                                | Decision                              |
| ------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------- |
| Text findings linked to existing images          | Already available and cheap                                         | Readers repeatedly reconstruct region, state and evidence scope                           | Retain as the minimum fallback        |
| Authored snapshot annotations                    | Makes target and evidence kind explicit; reuses available artifacts | Requires exact byte/coordinate binding; judgments remain authored                         | Prototype this bounded workflow       |
| Live DOM overlay or extension                    | Can inspect current geometry and interaction                        | More permissions, host variation, privacy, dynamic-state and integration work             | Defer until a named decision needs it |
| Extend `tasteforge audit` into a visual detector | One public entry point                                              | Changes architecture/contracts; cannot infer UX quality from source or a screenshot alone | Outside this RFC                      |

No universal slop score, AI-authorship label, mandatory panel or automatic repair follows from this design. Source synthesis and retained evidence can complete the RFC. An actual claim about users needs suitable user evidence.

## 3. Preserved architecture and scope

**RA-01:** no new public CLI command/flag/export, strict brief/config/DNA field, core filesystem/network dependency, engine/knowledge version change or release. The prototype lives under `examples/rendered-evidence/`, outside the packaged skill/runtime. Existing capture primitives remain the preferred way to collect new evidence when needed; this example does not rebuild a capture runner.

The controlled prototype reads two already retained 320-pixel-wide PNGs, their exact source HTML and historical check reports. It produces one self-contained static HTML file with embedded images and SVG rectangles. It does not execute the captured HTML, inject into any deployed site, change CSP on another app, run remote instructions, install dependencies or modify old evidence.

Python 3.10+ is an optional developer requirement for this example, not a requirement of normal TasteForge CLI use. The renderer uses the standard library. A native checkbox toggles authored rectangles; companion text carries every observation without relying on color or the overlay. No browser JavaScript is needed in the generated viewer.

## 4. Evidence kinds and decisions

| Kind                   | Establishes within declared scope                         | Cannot establish alone                                |
| ---------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| `source-fact`          | Literal content/logic in exact bound source               | Visibility, successful execution or perceived clarity |
| `rendered-observation` | What the author inspected in a named capture              | Behavior outside that capture or user comprehension   |
| `historical-runtime`   | A named observation/check recorded by a bound earlier run | A fresh rerun, all behavior or a current environment  |
| `contextual-judgment`  | An explained task-fit/copy/craft interpretation           | A mandatory defect or measured user effect            |
| `unassessed`           | A named question without sufficient evidence              | A pass or a failure                                   |

Keep the kind separate from `decision`: `keep`, `adapt`, `remove`, `unassessed`. A rectangle can point at a legitimate control. Byte verification is another separate state: it establishes which artifact was read, not whether the judgment is right.

**RA-02:** each finding names target/capture, observation, consequence, applicability, decision, recheck and limits. The annotation author is an AI agent in this example. No new human review is implied. A source hint is display-only supporting context, never an instruction to execute a selector or a claim that a live DOM node was found.

## 5. Prototype record contract

The provisional JSON format is `tasteforge.rendered-evidence.prototype.v1`. It is separate from DNA `1.0` and from the proposed research registries in spec 13. It is not a stable public interchange API or a claim of Web Annotation conformance.

Top-level fields are `format`, `sourceRevision`, `captures`, `findings`. Unknown fields and unsupported versions are rejected by the prototype, rather than silently discarded.

Each capture has:

- `id`: unique lower-case identifier, at most 64 characters.
- `image`, `source`, `report`: each has a repository-relative POSIX `path` and exact lowercase SHA-256 `sha256`.
- `state`: the exact historical capture state; `viewportWidth`: its recorded CSS viewport width.

The renderer binds the selected image to exactly one `report.captures` entry by image basename, state and width, and checks `report.sourceSha256` against the declared source hash. The image must be next to that report in its retained capture directory. This prevents accidentally joining a cabinet image to a proofdesk report simply because both are 320 pixels wide.

The actual report supplies browser version, framing, scroll Y and active-element trace where recorded. Missing fields remain explicitly unrecorded. In the selected inputs, cabinet empty has scroll Y 0 and proofdesk failure has scroll Y 562. Scroll X, image-time DPR and per-capture CSS viewport height are not directly recorded in those capture entries. Harness configuration is supporting context; it must not silently become newly measured metadata.

Each finding has `id`, `captureId`, `kind`, `title`, `observation`, `consequence`, `applicability`, `decision`, `recheck`, `limits`, `sourceHint`, `rect`. `sourceHint` is text or null. `rect` is either null or `[x, y, width, height]` in **capture-image pixels**. The other prose fields are nonempty strings; `limits` is a nonempty string explaining the remaining scope. Finding IDs are unique and every `captureId` must exist.

The small prototype caps are four captures, eight findings, a 256 KiB input manifest, and 2 MiB per referenced file. Text fields are at most 4096 characters. These are operating choices for a controlled example, not production CLI scan limits or research-derived optimal budgets.

## 6. Coordinates, scaling and stale targets

**RA-03:** `(0, 0)` is the upper-left of the exact PNG. Rect coordinates are integers; x/y are nonnegative, width/height positive, and the whole region must fit inside actual PNG dimensions. Booleans and nonfinite/fractional values are invalid coordinates. A source-only/unlocated finding uses null and draws no rectangle.

SVG `viewBox` uses actual image pixel dimensions. The image and overlay share the same aspect-preserving stage, so resizing the viewer scales them together. Capture pixels are not assumed to be CSS pixels. A 640-pixel image can represent a 320-CSS-pixel viewport; this example does not infer DPR from a ratio or use document coordinates for a naturally scrolled screenshot.

Authored rectangles identify a region, not a computed element bounding box. No rectangle is drawn for the lower source-only reset. A missing selector or changed source/capture invalidates a stronger mapping claim; a future live workflow must create a new record rather than transfer coordinates silently.

Byte mismatch, unsupported PNG metadata, ambiguous capture/report association, invalid geometry or unresolved references stop rendering before output creation. They are evidence-integrity failures, not UI defects. The operator repairs the record or chooses a new artifact; no permissive “best effort” verified badge is shown.

## 7. Offline renderer and output behavior

Prototype interface:

```bash
python3 examples/rendered-evidence/render.py \
  --root . \
  --annotations examples/rendered-evidence/annotations.json \
  --out .tmp/rendered-evidence/view.html
```

`render(document: dict, root: pathlib.Path) -> str` validates the bounded records/assets and returns deterministic escaped HTML. `write_new(output: pathlib.Path, html: str) -> None` writes only a new file. The CLI reads the manifest within the declared root, renders fully, then writes; validation failure leaves no partial output.

Inputs are regular, singly linked files inside the declared root. Reject absolute paths, backslashes, dot/traversal components, symlink components, nonregular files and hardlink aliases. Reads are capped. Paths are resolved inside a workspace the operator controls; this is not a sandbox against a hostile racing process. The renderer never evaluates source code or dereferences a URL.

Output is an explicitly selected new file. Refuse an existing output and linked parent components; do not truncate or recursively delete anything. Create ordinary missing parent directories only after successful rendering. Exit 0 means generation succeeded; exit 2 means rejected input/output or an I/O failure, with a readable error. These are example-tool results, not new public `tasteforge` exit contracts.

The generated HTML embeds the exact verified PNG bytes. It has no remote images, scripts, fonts or requests. All authored text and source hints are escaped. Underlying screenshot controls are static evidence, not interactive viewer controls. Byte labels explain their scope; they do not certify accessibility or usability.

## 8. Controlled cases and false positives

The initial dataset has two retained captures and four authored findings:

1. Cabinet empty: mark the visible filter/reset region and keep its useful recovery; rendered observation.
2. Cabinet empty: record the lower reset declared in source without assigning it a visible rectangle; source fact, viewport conclusion unassessed.
3. Proofdesk failure: mark retained selection and failure/retry context; historical-runtime evidence names the earlier check scope rather than claiming a rerun.
4. Proofdesk failure: explain the in-memory lifetime wording as a contextual craft judgment, not a demonstrated data-loss defect; no fabricated DOM rectangle.

A reviewer can reject or contest a judgment while keeping its artifact binding. Keep/change decisions need the actual task and exceptions: conventional controls, cards, brand type and meaningful labels remain valid. A detector warning or count alone does not authorize deleting content/actions. No aggregate winner or conformance score is computed.

## 9. Verification plan

Meaningful standard-library tests must fail before implementation, then pass: valid deterministic render; escaped untrusted text; stale image/source/report; wrong source/report join; duplicate/unresolved IDs; out-of-bounds/fractional/bool geometry; traversal/symlink/hardlink input; manifest/asset limits; unknown fields/version; existing-output preservation and linked output parents. Tests use controlled local fixtures and actual hashes, not mocks of hashing or filesystem behavior.

Viewer checks use existing installed Playwright/axe tooling only. Inspect at 320/390/1440 CSS widths and one high-DPR context, verify overlay/image scaling, native keyboard toggle, companion text, source-only absence of rectangles, no remote requests/page errors, and applicable available accessibility checks. Record incomplete/unassessed checks separately. These checks test the viewer, not the apps shown inside its images.

Verify the old pilot remains byte-identical. Repository checks stay separate from prototype checks. An independent reviewer receives a pinned public snapshot and declared scope. No fresh target-app A/B, recruitment, browser extension or live-site execution is needed to complete this RFC.

## 10. Decision and stop conditions

Provisional recommendation: keep authored evidence annotations as an optional agent-workflow example. Do not extend the CLI/catalog/DNA. Adoption is justified only if the prototype makes the existing source/viewport/runtime distinction inspectable without hiding unknowns. Report demonstrated limitations and rejected approaches.

Stop if plain text answers the question equally well, the annotation cannot bind its actual target, rights are unclear, or the viewer suggests automated judgment/conformance that it does not perform. Future live extraction, annotation editors, external-project ingestion and registry/packet services need a separate demonstrated need and design.

The RFC can be review-ready with honest negative or limited findings. LON-105 moves to In Review for the concrete RFC/prototype; production detector adoption and broader user outcomes are not marked Done by this work.

## 11. Source grounding

Read on 2026-11-10, primary sources only:

- [W3C Web Annotation Data Model, Fragment Selector](https://www.w3.org/TR/annotation-model/#fragment-selector) separates a resource, its selected segment and annotation content. This informs the conceptual separation; the prototype does not implement its JSON-LD vocabulary or claim interoperability.
- [W3C Media Fragments, spatial dimension](https://www.w3.org/TR/media-frags/#naming-space) defines rectangular selection with a top-left origin and explicit pixel/percent units relative to the media. The prototype implements only integer image-pixel rectangles, with stricter rejection of invalid bounds.
- [Playwright screenshots](https://playwright.dev/docs/screenshots) distinguishes a full scrollable-page image from other screenshot scopes. Its [screenshot API](https://playwright.dev/docs/api/class-page#page-screenshot) also distinguishes CSS/device scale. This is why capture mode and coordinate basis remain explicit rather than inferred from a filename.

These sources define useful representation/capture concepts; they do not validate this viewer, an annotation's truth or a product's UX. Existing community research remains in the [copy/state source ledger](../../research/2026-11-10-copy-state/source-ledger.md), with its own evidence limits.

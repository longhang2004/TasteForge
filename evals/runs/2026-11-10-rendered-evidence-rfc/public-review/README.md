# Source-bound rendered evidence

A controlled example for [RFC 16](../../docs/superpowers/specs/2026-11-10-rendered-evidence-design.md) / [LON-105](https://linear.app/long-hang/issue/LON-105/rfc-rendered-auditannotation-workflow-with-traceable-evidence). It presents authored observations beside exact retained screenshots, source and historical report bindings. It is an optional developer workflow, outside the six-command CLI and packaged skill.

## Generate a local viewer

From the repository root, with Python 3.10+:

```bash
python3 examples/rendered-evidence/render.py \
  --root . \
  --annotations examples/rendered-evidence/annotations.json \
  --out .tmp/rendered-evidence/view.html
```

Choose a new output filename each time. The renderer refuses an existing output and linked parents. The resulting HTML is self-contained and can be opened locally: PNG bytes are embedded, source hints are text, and the native checkbox toggles only the authored SVG regions. Controls drawn inside a screenshot are static evidence.

`annotations.json` is the source of the four authored notes. Do not hand-edit a generated page and call it the same evidence record. Source/capture/report changes require updated verified bindings and a new output. Hash verification establishes byte identity, not the truth of an interpretation or a UX score.

## What the example distinguishes

| Record                   | Evidence                                                 | Decision                                            |
| ------------------------ | -------------------------------------------------------- | --------------------------------------------------- |
| Cabinet top reset        | A region visible in the exact empty-state PNG            | Keep useful recovery                                |
| Cabinet lower reset      | Markup in bound source; no region asserted               | Viewport conclusion unassessed                      |
| Proofdesk failure/retry  | A named check in the earlier report plus capture context | Keep the recorded contract; no fresh replay claimed |
| Proofdesk retry lifetime | A contextual interpretation of in-memory source behavior | Optional future copy refinement                     |

These are selected fictional teaching artifacts from the existing pilot. The PNGs remain unchanged. Recorded scroll Y is 0 for cabinet and 562 for proofdesk; missing DPR, scroll X and per-capture CSS viewport height remain unrecorded. Pixel coordinates belong to the PNG, independent of the viewer width or assumed browser DPR.

## Verify

```bash
python3 -m unittest discover -s examples/rendered-evidence -p 'test_*.py'
```

The tests exercise actual files/hashes and output effects: stale bindings, wrong report/source associations, geometry, references, path/link boundaries, limits, escaping, deterministic output and preservation of existing output. Browser verification uses the already installed project tooling; no dependency or browser installation is required by this example.

The [implementation record](../../docs/research/2026-11-10-rendered-evidence/report.md) contains the actual checks, viewer captures, resource attempts, review disposition and limits once delivery completes. Viewer checks are separate from historical checks of the apps shown in the images.

## Scope

The record format is provisional `tasteforge.rendered-evidence.prototype.v1`, not DNA or a stable public API. It does not implement the Web Annotation JSON-LD vocabulary, infer live DOM targets, repair a UI or certify conformance. The controlled recommendation is an optional authored-snapshot workflow; live capture/annotation products need their own demonstrated need and design.

# Rendered evidence prototype record

See the [implementation report](../../../docs/research/2026-11-10-rendered-evidence/report.md) and [example command](../../../examples/rendered-evidence/README.md).

- `viewer.html`: confirmed static page; original image bytes are embedded.
- `viewer-before-landmark-fix.html`, `browser-round1`: earlier viewer and its four failed landmark checks, retained as history.
- `browser-round2`: confirmation, 28/28 checks, zero reported axe violations; four incomplete contrast rule records remain unassessed.
- `browser-check-*.mjs`: exact executed checker snapshots. These are provenance records with the original workspace/tool paths, not a new public runner. To replay in another workspace, adjust only the imports, root/input/output paths at their top, use the already installed inventory-workbench Playwright/axe tools, and choose a new output directory. Do not overwrite this run.
- `builder`, `implement`, `public-*`, prompts and `run-agy.py`: raw AGY attempts using pinned public inputs; generated candidate retained as inert source, not executed implementation.
- `tests-*.log`: test-first and confirmation history, including the initial fixture cleanup error.
- `impeccable.json`: one detector pass, with contextual disposition in the report.
- `verify.py`, `integrity.json`: delivery file set and implementation/input hashes. Run `python3 evals/runs/2026-11-10-rendered-evidence-rfc/verify.py` from the repository root.

These viewer checks do not replay or certify the applications shown in the screenshots. Hashes establish bytes, not semantic truth, freshness or user outcomes. Final independent review records are appended before the delivery index is frozen.

# Warehouse decision workspace
Primary task: inspect LIN-115 evidence and review a simulated 8-piece replenishment decision.

Three viable structures: primary-detail workspace; expandable inline rows; separate list and form. Selected primary-detail preserves desktop list context and groups evidence with action. Inline rows push neighboring stock down during review; separate forms lose useful desktop context. Narrow screens show a focused detail with return retaining criteria. Flow: list → inspect → review → first-save failure → retry success. Edit preserves quantity.

Offline catalog 2026.11.01.2: read template-adminlte-index, AdminLTE revision bd4d9c72931f1dd28601b6bfb387554a381ad540. Actual source URL, stored structure and MIT notice in evidence/reference-template.json. Only stored structure inspected, not live product. Rejected unrelated dashboard regions; copied no code/assets. Frozen primary-detail and check-answers archetypes informed task order. No browsing performed.

Seed 42 suggestions returned no compatible system-font direction for en/vi. Requirements retained; manual Segoe UI/Arial/sans-serif fallback and navy/white/cool-neutral tokens. Amber signifies shortage; blue signifies actions. Not generated DNA. Vietnamese glyphs checked in initial screenshots only.

Checks target five initial rows, exact three-shortage filter, SKU/name search, clearable empty state, integer 1–50 input, review consequences, retained edit/error quantity, retry recovery and return criteria. Actual checks distinguished in implementation-notes.md.

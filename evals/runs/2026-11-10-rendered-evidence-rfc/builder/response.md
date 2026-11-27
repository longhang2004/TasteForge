Nothing important left.

### Why the Plan is Fully Specified

The design ([`RFC 16`](file:///C:/Users/hi/.codex/worktrees/copy-state-coherence/TasteForge/.tmp/rendered-evidence/public-builder/design.md)) and implementation plan ([`plan.md`](file:///C:/Users/hi/.codex/worktrees/copy-state-coherence/TasteForge/.tmp/rendered-evidence/public-builder/plan.md)) completely lock down all architectural boundaries, interfaces, contracts, test requirements, and delivery steps. Guessing is not required for any decision that would materially alter the plan:

1. **Scope and System Boundaries (RA-01, RA-02):**
   - The implementation is strictly an offline, standard-library prototype isolated in `examples/rendered-evidence/`.
   - Core CLI, DNA formats, engine versions, and public npm/CLI packages are frozen.
   - Remote requests, DOM execution, browser extensions, external dependencies, and new participant/A/B recruitment are explicitly prohibited.

2. **Data Model and Contract:**
   - Format identifier is fixed to `tasteforge.rendered-evidence.prototype.v1`.
   - Top-level schema (`format`, `sourceRevision`, `captures`, `findings`) and field types, constraints, and caps (4 captures, 8 findings, 256 KiB manifest, 2 MiB file limit, 4096-character prose limits) are specified.
   - Exact join semantics are defined: `report.captures` matched by image basename, state, and width, with `report.sourceSha256` validated against declared source hash.
   - Coordinate basis (RA-03) is explicitly integer capture-image pixels with `(0, 0)` at upper-left, strictly bounded within PNG dimensions, with unlocated/source-only findings set to `null` (drawing no rectangle).

3. **Renderer Interface and CLI Contract:**
   - CLI flags (`--root`, `--annotations`, `--out`) and exact function signatures (`render(document: dict, root: pathlib.Path) -> str`, `write_new(output: pathlib.Path, html: str) -> None`) are fixed.
   - Failure semantics and exit codes are specified: deterministic HTML on exit 0; exit 2 on validation failure, traversal/symlink/hardlink detection, or I/O error without creating or truncating output.
   - Output must be self-contained static HTML embedding verified PNG bytes with no external scripts, fonts, or network requests.

4. **Viewer Interaction and Accessibility:**
   - No browser JavaScript. Author overlay toggling is handled strictly via a native checkbox.
   - Observations must be fully understandable via accessible companion text without relying solely on overlay rectangles or color.

5. **Dataset and Controlled Scope:**
   - The initial dataset is pinned to two existing retained captures (`cabinet empty` with scroll Y 0, `proofdesk failure` with scroll Y 562) and four concrete findings (visible reset, lower source reset with null rect, selection retry context, and in-memory lifetime judgment).

6. **Test, CI, and Delivery Strategy:**
   - Test-first methodology with standard-library unit tests covering all edge/error cases (tampered hashes, bad joins, invalid geometries, path traversals).
   - CI step defined: add a prototype-unittest step to the existing Ubuntu CI workflow while preserving the Node matrix.
   - Local viewer verification using existing installed Playwright/axe tooling at 320/390/1440 CSS widths and one high-DPR context.
   - Non-regression gate: byte-identical check on 782 historical pilot artifacts.
   - Delivery target: stacked draft PR on PR #6 from baseline `ee88336`, updating LON-105.

Any remaining items (e.g., standard-library PNG header byte parsing via `struct`, specific CSS class naming, or visual card layouts) represent ordinary implementation decisions explicitly left to the builder during Task 2.


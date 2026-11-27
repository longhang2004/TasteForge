# Rendered evidence RFC implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for this bounded RFC/prototype. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing source/capture/runtime distinction inspectable through a reviewed RFC and a local authored-annotation example.

**Architecture:** A small Python standard-library renderer validates a bounded JSON recordset and exact local assets, then emits self-contained static HTML/SVG. It is an example workflow, outside the public CLI/runtime. Retained screenshots and source remain unchanged.

**Tech Stack:** Python 3.10+, unittest, HTML/CSS/SVG; existing installed Playwright/axe for viewer checks.

**Spec:** [RFC 16](../specs/2026-11-10-rendered-evidence-design.md), implementing WP-D/LON-105 from the existing roadmap. The owner's instruction to continue authorizes a reviewable controlled prototype, not production integration.

## Global Constraints

- No new public CLI command/flag/export, strict brief/config/DNA field, core filesystem/network dependency, engine/knowledge version change or release.
- Frozen historical runs, judgments, unblinding records and source bindings are immutable.
- Capture-image pixels are distinct from CSS viewport/document coordinates; missing metadata stays unrecorded.
- Rectangles are authored regions; byte verification is not a UX/conformance score.
- No remote execution, deployed-site injection, new dependency installation or recruited A/B panel.

## Review Focus

1. Natural scroll Y 562 in proofdesk must not be treated as a top-of-document capture.
2. Source-only lower reset must not acquire a fabricated visible rectangle.
3. Image/CSS scale differences must not assume DPR 1.
4. Invalid evidence must fail before output; old output/files remain intact.
5. Generated text/source hints remain data; screenshot controls are explicitly static evidence.

## Task 1: Review the concrete design

**Files:** This plan and RFC 16.

**Interfaces:** RFC 16 fixes provisional record fields, renderer signatures, limits and failure semantics consumed by Task 2.

- [ ] Publish a draft design snapshot on the new branch, then ask one fresh AGY builder reviewer for material unanswered planning questions, using only that public snapshot.
- [ ] Resolve ordinary builder questions in the RFC/ledger; keep production decisions proposed.

## Task 2: Build the controlled example with tests first

**Files:** Create `examples/rendered-evidence/render.py`, `test_render.py`, `annotations.json`, `README.md`. Add a prototype-unittest step to the existing Ubuntu CI workflow; preserve its Node matrix.

**Interfaces:** `render(document: dict, root: pathlib.Path) -> str`; `write_new(output: pathlib.Path, html: str) -> None`; CLI as in RFC 16. The input format is `tasteforge.rendered-evidence.prototype.v1`.

- [ ] Write CLI-oriented unittest scenarios for deterministic valid output, escaping, exact hashes/report association, identifiers/coordinates, path aliases/limits and output preservation. Run them against the missing renderer and observe assertion failures for the expected missing behavior.
- [ ] Implement the minimal renderer and rerun the same cases to green. Test actual files and hashes; no hashing/filesystem mocks.
- [ ] Populate two captures/four authored findings from exact existing images/source/reports, including recorded scroll and honest unknowns.
- [ ] Generate a new local HTML artifact. Document the command, implemented scope and future contracts. Expected: self-contained images, native toggle and companion text; no public runtime/package change.

## Task 3: Verify and deliver the RFC

**Files:** Create `docs/research/2026-11-10-rendered-evidence/report.md`, `resources.json` and exact evidence bindings; retain new viewer captures there when useful. The browser checker is local ignored test tooling unless it earns a reusable role.

**Interfaces:** Consume Task 2's validated HTML/JSON. Viewer checks do not replay the captured apps.

- [ ] Use existing Playwright/axe at 320/390/1440 and one high-DPR context. Check overlay scaling, keyboard toggle, source-only text, viewport reflow, remote requests/page errors and reported accessibility results. Inspect actual screenshots.
- [ ] Run prototype unittests, repository checks and old pilot integrity verification. Expected: relevant checks pass; 782 old artifacts remain unchanged. No package smoke repeat unless package/runtime files actually change.
- [ ] Obtain one fresh independent AGY review of a pinned public implementation snapshot; address demonstrated important gaps in one bounded pass and retain all attempts/unknowns.
- [ ] Deliver a separate draft PR stacked on PR #6. Update LON-105 and spec navigation with public links; keep production adoption separate and preserve the managed worktree.

## Execution record

This work reuses the existing managed worktree on a new branch from `ee88336`. A local ignored ledger preserves progress. Git Windows is called through WSL for the managed Windows-native Git metadata. No new participant recruitment or large comparison matrix is a prerequisite for this RFC.

# Rendered evidence RFC: implementation record

Date: 2026-11-10. Scope: [RFC 16](../../superpowers/specs/2026-11-10-rendered-evidence-design.md), [LON-105](https://linear.app/long-hang/issue/LON-105/rfc-rendered-auditannotation-workflow-with-traceable-evidence), [draft PR #7](https://github.com/longhang2004/TasteForge/pull/7), stacked on PR #6. The prototype is an optional developer example; production adoption remains proposed.

## Result and decision

The authored snapshot workflow makes a useful distinction inspectable: a visible reset, a different reset declared only in source, an earlier recorded retry check and a contextual lifetime judgment do not establish the same thing. Keep this as an optional workflow example. There is no demonstrated need here for a live detector, extension, public CLI command or annotation editor.

The [renderer and input records](../../../examples/rendered-evidence/README.md) produce one self-contained HTML page. It verifies exact image/source/report bindings, embeds the original PNG bytes, scales authored image-pixel regions with the image, and exposes all observations as text. One native checkbox hides/restores the regions. No captured application code is executed and no source hint is queried as a live selector.

The two images and four notes are selected authored teaching cases, not a representative sample or a new A/B comparison. No new participants were recruited. This work makes no measured claim about user comprehension, task success, reduced review time or quota savings.

## Retained evidence and replay

The [new run directory](../../../evals/runs/2026-11-10-rendered-evidence-rfc/) retains the exact generated pages, browser checker, before/after captures and reports, test logs, detector output and AGY attempts. Its integrity index binds the retained run files and the implementation/input files. Historical pilot files remain in their original directory and are referenced by exact hashes rather than modified or relabeled.

Generate a fresh output from the repository root using the command in the example README. The renderer refuses an existing output. The retained `viewer.html` is the confirmed generated page; `viewer-before-landmark-fix.html` preserves the earlier page that failed a viewer accessibility check. Neither page represents a fresh execution of the apps pictured inside it.

The first capture is cabinet empty at recorded scroll Y 0. The second is proofdesk failure at recorded scroll Y 562. Both PNGs are 320 × 900 image pixels. Missing image-time DPR, scroll X and per-capture CSS viewport height remain explicitly unrecorded. The report-source join, state, filename, width, directory and bytes are validated; the offline renderer does not authenticate Git history or determine whether an author's interpretation is true.

## Tests and viewer checks

The test-first checkpoint `bdc4962a69da9496ec17bb04c524c1be2ced9234` published 15 tests while the renderer was absent: 30 assertion failures, zero errors. The initial fixture-cleanup error is retained separately; a `finally` cleanup fixed that harness error before the clean RED run. Source review added guard cases, yielding 19 tests with 35 expected RED failures. A later typed-input regression run had three failures across 21 tests; strict capture-reference/viewport checks corrected them. The confirmed suite passes **21/21** using actual files, hashes and CLI output effects.

Coverage includes stale or incorrectly joined evidence, malformed references, bool/fractional/outside geometry, image pixels distinct from CSS width, path/link boundaries, read/count caps, escaped text, deterministic rendering and preservation of existing/dangling-link output. The PNG check validates header/dimensions; it is not a complete PNG decoder. Browser checks confirm the two selected images decode.

The browser checker exercised Chromium 156.0.8078.4 at 320, 390 and 1440 CSS pixels, plus 390 at DPR 2, each with a 900-pixel viewport height. It tested the viewer DOM, not the apps inside screenshot pixels. The initial run passed 24/28 checks; all four failures were the same axe `region` finding: the checkbox/help sat outside a landmark. Moving them into `main` and updating the CSS sibling selector fixed the demonstrated issue. The confirmation run passed **28/28**, with zero page errors, remote requests or reported axe violations. The primary agent inspected actual desktop/mobile/full-page captures.

Four axe incomplete rule records remain, one `color-contrast` record per context, covering SVG region labels and some source-hint code text. They remain **unassessed**, not converted to passes. Automated checks and visual inspection do not certify accessibility. The earlier pilot's separate incomplete records are unchanged.

One Impeccable detector pass reported three warnings: two zero-inset capture stages and a mobile heading-size step just below its ratio threshold. These are contextual non-actions: the stage intentionally shares the exact image/overlay bounds; adding inset would require changing that coordinate layout. The report's headings already use weight, spacing and section rules, and mobile inspection showed a readable hierarchy. These warnings do not justify changing the retained images or adding style changes without an observed problem.

Repository build, typecheck, lint and formatting checks passed, with **57/57** Node tests. The unchanged historical pilot verified **110 frozen inputs, 8 review files, 782 artifacts and 4 accepted cells**. The optional Python suite is a separate CI step across the existing Node 20/22/24/26 matrix. Package/runtime files are unchanged; no local package smoke repeat was needed, and CI retains its package smoke step.

The independent review and final integrity freeze are pending in this implementation checkpoint and will be recorded before delivery.

## AGY use and primary-agent responsibility

Only publicly published, pinned repository snapshots were sent to AGY. The task-scoped settings allowed packet reads and denied commands/writes. Raw invocations, packets, output streams and prompts are retained. No AGY test-execution claim substitutes for actual local checks.

| Attempt              | Requested model                      | Outcome                                                                   | Operator wall time |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------------- | ------------------ |
| Builder questions    | `gemini-3.8-flash-high`, high effort | No important unanswered planning question                                 | 181.032 s          |
| Single-file drafting | `claude-sonnet-4-6`                  | Generated a candidate; primary inspection required substantial correction | 142.479 s          |

The 628-line candidate was syntax-inspected as inert source and was not executed or integrated verbatim. It missed linked-parent/read-cap/output guards, exact image/report-directory association and the single global toggle, and its viewer needed simplification. The primary agent wrote the focused implementation, added demonstrated boundary cases and ran all checks. Draft generation is recorded as drafting assistance, not successful implementation.

CLI version was 1.5.3. Raw usage differs by model/provider; cache/thinking counters are retained without normalizing them into money or savings. No billing export or matched baseline exists. The [resources record](resources.json) and raw invocations are the accounting source of truth.

## Limits and follow-up

This is a controlled workspace example, not protection against a hostile process racing filesystem validation. Output validation does not create a partial file; an I/O failure during the later write can still leave a new incomplete output. No existing file is overwritten. All supplied manifests/assets must be inspected and their provenance understood by the operator.

The fixture does not validate an untrusted source's honesty, review a live DOM, infer a target from a selector or establish a universal slop/conformance score. Authored notes can be contested while their byte bindings remain valid. Production capture/annotation, an editor or external-project ingestion requires a separate demonstrated decision and design. Existing cost-replication and manual-review backlog items remain separate.

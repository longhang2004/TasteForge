# Retrospective copy/state inspection

Date: 2026-11-10. Lanes: E0 source synthesis and E1 retrospective inspection. Baseline: `79820b58088245c32902d85cb0b2f14abd967aad`; retained pilot artifacts originated in `6e1a91621176be699c3b41c19da6574b91e701f2`. Exact paths and SHA-256 values are in [evidence.json](evidence.json).

## Question and selection

Can the new copy/state questions identify useful keep/adapt distinctions in available material without requiring new UI generation or a recruited A/B panel?

Before judging, select proofdesk-baseline (print-work operations, retaining familiar controls) and cabinet-candidate (collection exploration with artifact-led identity), with six existing captures:

| Artifact           | Retained captures inspected                   | Source/check evidence                |
| ------------------ | --------------------------------------------- | ------------------------------------ |
| proofdesk-baseline | 320 initial, 320 failure, 1440 filtered-empty | Corrected HTML and matched-v3 report |
| cabinet-candidate  | 320 initial, 320 filtered-empty, 1440 detail  | Corrected HTML and matched-v3 report |

The integrating AI agent viewed the actual six retained PNGs and read relevant source functions. These are two selected task families and six **rereads**, not six new independent samples. No current browser replay, screen-reader test, native-speaker review, fresh generation or participant study occurred. The historical reports describe prior checks, not checks executed again here.

## Findings

### R01 — Keep a specific action explanation and conventional controls

**Target/state/width:** proofdesk initial, 320 CSS px. **Cases:** CS01/CS05/CS09.

**Rendered observation:** “Print queue” sits with “Check the artwork. Set the run. Approve with the paper in view.” Search/status controls, job IDs, format/ink and Vietnamese titles are visible. The eyebrow explains a queue-to-proof relationship rather than merely repeating the title.

**Decision:** Keep. The serif/paper treatment and ordinary form controls are not defects merely because they resemble a fashionable ingredient. The actual print artifacts and record task supply a content reason. This observation does not establish that the layout is optimal or faster for users.

**Recheck/limit:** No edit was made. Small diacritics are visibly present in this sample; font delivery, full script coverage and native-language comprehension are not established by it.

### R02 — Keep recovery truth; consider tighter lifetime wording in a future edit

**Target/state/width:** proofdesk failure, 320 CSS px. **Cases:** CS03/CS11.

**Rendered observation:** “Approval was not recorded” is shown alongside the selected paper and copies, a retry action, an edit action and a local-demonstration disclosure. The text distinguishes a failed approval from a completed external action.

**Source fact:** `approve()` increments an in-memory draft attempt counter, intentionally fails the first attempt and retains paper/copies in a JavaScript object. No account/backend save is established by this source inspection. The historical report records 87 passing assertions across its full prior scope; those are not 87 new tests in this increment.

**Decision:** Keep the retained choices/recovery contract. Craft note: “Your paper and copies are saved” could be tightened to “Your paper and copies are kept for this retry” if a future copy-only edit is authorized. That is a scoped wording proposal, not a demonstrated data-loss defect or a claim that the original local-demo disclosure is false.

**Recheck/limit:** If edited later, inspect the actual lifetime and run retry/edit/return behavior. This inspection did not test refresh persistence, announce behavior or user understanding.

### R03 — Keep filter scope and a direct way back

**Target/state/width:** proofdesk filtered-empty, 1440 CSS px. **Cases:** CS02/CS11.

**Rendered observation:** The unmatched query, status selector, zero-result count, “No jobs found”, contextual search advice and “Clear filters” remain visible. Paper-on-hand facts stay present. The main queue total and the filtered zero-result count have different scopes.

**Source fact:** `renderJobs()` filters the fixture and its clear handler resets query/status. This describes the code; the historical report supplies separate prior execution evidence.

**Decision:** Keep. The empty state preserves the task vocabulary and recovery. A new illustration, new composition or extra success toast is not needed to make it feel less generic.

**Recheck/limit:** A future change affecting filters should execute reset and retained-return behavior. No new task-success claim is made here.

### R04 — Keep personality when concrete information is nearby

**Target/state/width:** cabinet initial and filtered-empty, 320 CSS px. **Cases:** CS01/CS02/CS09/CS11.

**Rendered observation:** “Six panels. One cabinet.” is paired with “Explore the panels, inspect their details, and pin two to compare.” In the empty capture, query `SC-06`, material `Aluminium`, “0 panels found”, the top “Reset filters” control and “No matching panels” remain visible. “A different way through?” supplies voice; it is not the only explanation of the state.

**Source fact:** The empty block also contains search advice and another reset action. That lower advice/action is below the captured viewport; source presence alone does not prove current viewport visibility. The separate top reset is visible.

**Decision:** Keep the meaningful hierarchy and reset path. Do not remove a headline or eyebrow solely because a community list mentions that ingredient. A clearer lower heading is optional craft, with no observed user harm established.

**Recheck/limit:** This is a retained natural-viewport capture, not a full-page accessibility audit. Future edits should check the post-action scroll/focus and reset behavior at the supported minimum width.

### R05 — Keep actual record identity and evidence distinctions

**Target/state/width:** cabinet detail, 1440 CSS px. **Cases:** CS06/CS09/CS12.

**Rendered observation:** The Vietnamese title, record ID, metadata labels/values, supplied diagram, back action and pin action retain the collection's vocabulary and visual roles. The metadata label supplies actual attributes rather than decorative slogans.

**Source fact:** Detail source labels the supplied graphic as an original illustrative diagram and keeps recorded dimensions separately. The historical matched-v3 report records 66 passing assertions in its prior scope; it is not a fresh behavior run.

**Decision:** Keep. A diagram is not photographic evidence of material quality; an authored archive does not become historically authentic through styling. The explicit source disclosure should survive any later refinement.

**Recheck/limit:** The 1440 capture establishes this visible arrangement only. The selected packet does not establish every detail/error/compare state or all supported languages.

## Outcome and limits

The questions produce useful **keep** decisions and one optional lifetime-wording note in existing material. This supports the reference as a review aid with contextual counterexamples. It does **not** show that the reference improves future generations or that users perform better.

No historical artifact was edited to satisfy the new questions. No new demonstrated functional blocker was found within these selected observations; uninspected behavior/accessibility remains unassessed. The old pilot's overall 306 assertions/96 states and 84 axe incomplete records retain their original scope and limitations. Use a fresh comparison or targeted human study only for a later named question that available evidence cannot answer.

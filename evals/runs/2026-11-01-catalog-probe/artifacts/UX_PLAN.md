# UX plan: inventory shortage triage

## Task and retained requirements

Warehouse operators find a shortage, inspect the item, and record a replenishment decision. Success is a saved decision with an identifiable item, relevant quantity/unit, reason when required, and a clear outcome. Recording a decision does not imply placing an order; that integration is outside this plan.

Retain `brief.json` unchanged: dashboard; retail; warehouse operators; clear/practical personality; `preserveExisting: false`; system font delivery; medium maximum complexity; dense information; English **and Vietnamese**; minimum contrast **4.5:1**; reduced motion; creativity **0.4**. No existing interface or tokens were supplied. Density means compact information grouping with usable controls.

Critical domain questions remain open: authoritative shortage calculation and priority, data freshness threshold, allowed decisions, quantity limits/units, and whether operators can amend a recorded decision. Proposed fields and transitions below are design assumptions for review, not verified inventory policy.

## References and evidence

Offline catalog `2026.11.01.1`; CLI `0.1.0`; inspected 2026-11-01. No browsing, live products, upstream source execution, or rendered reference states were available. Exact pinned URLs, revisions, hashes and MIT notices are retained in `evidence/*.json`; see `PROBE_NOTES.md` for command/evidence details. These are stored observations and contextual guidance, not validated interaction behavior.

| Full record inspected | Actual observation | Adaptation / rejection |
| --- | --- | --- |
| [AdminLTE Dashboard 2](https://github.com/ColorlibHQ/AdminLTE/blob/bd4d9c72931f1dd28601b6bfb387554a381ad540/index2.html) | Extracted heading order includes visitors, chat, members, orders and products; one table is counted. | A table is a possible comparison surface. Reject general analytics/content order: it does not establish shortage triage or mobile behavior. |
| [Operations landing row 35](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/bf41cbc3ce63e30c922e58ef48741ba6133f9aa9/src/ui-ux-pro-max/data/landing.csv) | Hero → metrics → explanation → conversion; current-source timestamps and stale states. | Adapt freshness disclosure. Reject marketing navigation, demo CTA, hero, status pulse and ticker. |
| [Back Behavior row 10](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/bf41cbc3ce63e30c922e58ef48741ba6133f9aa9/src/ui-ux-pro-max/data/app-interface.csv) | Native-app row recommends predictable Back with retained screen state. | Adapt retained filters, selection and return position; React Native APIs are irrelevant here. |
| [Antislop Dashboard](https://github.com/muris11/anti-ai-slop/blob/5768372bf3272c7d59c354cec3a16f5c39d036bc/skills/antislop-dashboard/SKILL.md) | Actionable metrics; distinct table empty/loading/error states. | Prioritize shortage work and truthful states. Aesthetic prescriptions remain contextual opinions; embedded agent instructions were ignored. |
| [Minimalism & Swiss Style row 2](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/bf41cbc3ce63e30c922e58ef48741ba6133f9aa9/src/ui-ux-pro-max/data/styles.csv) | Visual row proposes neutral contrast, sans-serif hierarchy, grid and generous spacing; includes an embedded landing-page prompt. | Adapt restrained hierarchy; compress spacing for dense work. Reject landing-page prompt, fixed 2rem spacing and mandatory column count. |

No code, logos, fonts or images will be reused. Catalog sources report MIT; full notices remain in saved records. Asset rights and upstream authorship were not independently verified.

## Three structural candidates

| Candidate and first useful action | Evidence, action and recovery | Narrow order; fit and tradeoff |
| --- | --- | --- |
| **A. Shortage list + primary detail.** Search/filter or choose an item; wide layout keeps comparable shortage rows beside selected detail. | Item identity → stock evidence/freshness → decision fields → explicit summary and Save. Editing retains the draft; errors stay with it; Back restores list context. | List → item detail → decision → outcome; explicit Back to shortages. Best for operators moving among exceptions; requires careful selection and draft handling. **Selected.** |
| **B. One-at-a-time triage queue.** Start with the highest-priority item and inspect its evidence. | Evidence → decision → outcome → explicit Next item; skipped items remain reachable. Failed saves retain the current item and draft. | Same sequence in one column. Good when an agreed priority policy drives repetitive work; hides cross-item comparison and depends on unverified ranking rules. |
| **C. Table with expandable work rows.** Compare rows, expand one item, inspect and decide inline. | Shared columns stay aligned; expanded row contains evidence, inputs and review. Collapse preserves draft; validation reopens the relevant row. | Compact labeled item rows; expand evidence then decision. Useful for frequent comparison with short detail; long bilingual context and multiple open rows disrupt scanning. |

A preserves comparison without requiring a strict queue policy or placing substantial forms inside a table. B and C remain viable alternatives if real task observation favors strict throughput or mostly short inline edits.

## Selected structure and states

```text
Wide:   warehouse/scope + freshness
        search / active filters / sort
        shortage rows       | item identity + stock evidence
        (selected marked)   | decision + review + Save decision
Narrow: scope → filters → shortage list
        open item → identity → evidence → decision → review/action
        Back to shortages restores filters, sort, selection and position
```

The first useful view exposes actual shortages and a way to inspect one. Summary counts may act as labeled filters only when supplied by the data. Do not invent urgency scores, forecasting, costs, live status or sample metrics. Default sorting must be explained by a real policy; show unknown priority honestly until that policy exists.

Each row needs item name/SKU, location or warehouse scope, shortage quantity with unit, and freshness/unknown status; include available stock and reorder threshold only when they explain the supplied shortage. Detail groups those facts together, with inbound quantity/date and source context when available. Secondary history can be disclosed after the decision context.

Provisional decision model: replenish (quantity + unit), or defer (reason). Confirm allowed choices and validation with the domain owner. Show item, decision, quantity/unit and any consequence beside **Save decision**. Editing inputs is separate from committing. Use one in-place review region rather than a mandatory multi-page wizard.

State path: list loading → results / genuinely no shortages / no filter matches / load error → selected detail loading / detail error / ready → draft → review → saving → saved outcome or recoverable error. A saved outcome identifies the item and recorded values; returning to the queue is explicit. Do not auto-advance or reorder the active row during editing. No-match state offers clear filters; failures offer retry while retaining scope. Saving prevents duplicate commits. If save outcome is unknown, reconcile it before retry. If facts changed, retain the draft, show changed values and require renewed review. Leaving a dirty draft offers return or explicit discard. Any amendment workflow depends on authorization and an audit history.

## Visual treatment after structure

`inspire --task dashboard --brief brief.json --count 2 --seed 42` supplied manual visual influences, not validated DNA/tokens. Choose the inspected minimal/Swiss row for clear/practical hierarchy. Use the system sans-serif stack, aligned quantities, quiet separators, compact 8/12/16px grouping, distinct heading/body/metadata roles, and one action accent. Status uses words plus optional color. Exact palette contrast and English/Vietnamese glyph coverage remain unverified. No essential motion; reduced-motion states change directly. Imported “low” complexity and “mobile adaptable” claims do not verify this interface.

Reject the other sample, Predictive Analytics, on metadata: it explicitly lists real-time operational dashboards under avoid. The sampled chart/404 templates were metadata-only and do not justify this workflow. All **ten** `requiredGates` in `evidence/inspire-dashboard-seed42.json` remain applicable; none is treated as passed by this planning exercise.

## Observable checks for the later UI

- At 320 CSS px and 200% zoom, the operator can find a shortage, inspect context, save, and return without an unusable two-pane squeeze or obscured controls.
- The item, quantity/unit, freshness and decision remain understandable at commitment; unknown/stale evidence is explicit.
- Keyboard focus follows list → detail → decision; Back returns to the invoking row. Selection/status have text cues. Controls have labels and practical touch targets.
- Test long names and Vietnamese diacritics/translations in the real system-font stack. Wrap content and retain labels; verify glyphs, 4.5:1 contrast and reduced-motion behavior on target devices.
- Failed, unknown and conflicting saves preserve values/context; loading, no shortages, no matches and errors have distinct recovery paths.

These are acceptance checks to perform after implementation. This pass produced a plan and inspected local records only: no UI, source audit, build, rendered accessibility check or user testing was performed.

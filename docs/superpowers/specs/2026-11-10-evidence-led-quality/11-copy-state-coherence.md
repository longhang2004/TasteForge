# 11 — Information-bearing copy and coherent UI states

Date: 2026-11-10. Status: proposed P1 increment; part of [programme design 08](../2026-11-10-evidence-led-quality-design.md). This document specifies future guidance and its checks; it does not modify a product UI now.

## 1. Problem and desired behavior

Attractive initial screens can retain generic copy or lose their identity when a form fails, a collection is empty or a user returns to prior work. Existing TasteForge guidance already protects facts, task relationships and state behavior. The proposed increment makes **information value** and **continuity across states** explicit without adding a new mandatory workflow.

**COPY-01:** inspect what text tells this visitor about an action, object, condition, consequence or supporting evidence. Truthfulness is necessary but does not guarantee usefulness. A truthful slogan can still fail to explain an import restriction. Conversely, brand voice can be useful without placing all facts in the headline.

**STATE-01:** preserve terminology, hierarchy, content relationships, control meaning and recovery behavior across relevant states. A state may legitimately simplify its composition. Coherence does not require identical geometry or decorative elements on every screen.

## 2. Proposed skill surface

Candidate reference: `skills/tasteforge/references/copy-and-state-coherence.md`. Keep it short enough to read on demand, with a small number of original examples. Link it from the relevant art-direction/refinement location using a routing sentence. Do not add a mandatory planning stage, a seventh CLI command, research network calls or a requirement to read all eight design documents during generation.

Standard can use it when copy or state continuity is a named concern. Fast can select one relevant check for the requested correction. Explore can compare structural alternatives when uncertainty warrants it. Existing project/design-system truth, fixed wording and language constraints remain authoritative.

**COPY-02:** do not ban a font, slogan syntax, punctuation mark, eyebrow label or card shape merely because it appears in community complaints. The reviewer must connect the text to a missing distinction or task consequence. Do not manufacture specificity by inventing customers, metrics, capabilities, testimonials or backend behavior.

## 3. Copy inspection procedure

1. Identify the visitor's current question and the evidence available in the brief/product.
2. Classify content as required fact, action, condition, navigation, brand expression or supporting detail. Roles can overlap.
3. Try the substitution question: if an unrelated product name replaces this name, does the wording remain equally applicable? A “yes” invites investigation; it is not an automatic failure.
4. Find the missing product information, if any. Use verified facts or leave an explicit authoring gap.
5. Make the smallest edit that improves understanding while retaining approved voice and legal requirements.
6. Recheck factual support, hierarchy, translation length and the action's actual result.

Original fictional examples:

| Before                  | Context and proposed wording                                                                                             | Evidence requirement                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| “Your work, elevated.”  | In a local CSV import form: “Import a CSV file” with a visible size/type condition supplied by the actual implementation | Do not invent a size cap; confirm it before showing a number                                 |
| “Something went wrong.” | If a local validation rule rejected a missing column: name the missing column and explain how to retry                   | Actual validation must distinguish this error; otherwise use honest general recovery wording |
| “You're all set!”       | For a successful draft save: “Draft saved” and the actual next action                                                    | Confirm persistence scope; an in-memory preview is not a saved account record                |
| “No results.”           | For active filters: explain that no records match and offer the available filter reset                                   | Do not erase filters or claim the underlying collection is empty                             |

These are illustrative patterns, not copy templates to paste into unrelated products. Avoid replacing every slogan with a dense technical paragraph. Content hierarchy must preserve scanning and comprehension.

## 4. State inventory

Select only states that exist or are explicitly required. Do not add simulated account, payment, synchronization or backend states to satisfy a generic checklist.

| State            | Questions                                             | Preservation target                                  |
| ---------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Entry/default    | What is the primary action and actual data scope?     | Product nouns, required context and action hierarchy |
| Loading/pending  | Is progress real? What can be used or cancelled?      | Stable orientation; no invented progress percentages |
| Empty/first use  | Is the collection empty, unavailable or filtered out? | Correct explanation and available next step          |
| Invalid input    | Which field/rule failed and how can it be corrected?  | Labels, values, error association and focus behavior |
| Failed operation | What was preserved; what can be retried?              | Recovery route and truthful persistence boundary     |
| Success          | What actually changed and is it durable?              | Verified result and proportionate feedback           |
| Edit/return      | Can the user resume and understand prior choices?     | Selection, filters, state context and terminology    |

Use visible and programmatic feedback appropriate to the action. Relevant status messages may need assistive-technology exposure without moving focus. Do not add an `aria-live` region to every changing label or force a toast for every action. Refer to [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) for the applicable behavior.

## 5. Refinement retention contract

**STATE-02:** before changing an existing surface, inventory the specific content and behavior at risk. The inventory can be a few lines for a small fix. Record required facts, labels and units, routes/links, fields, actions, handlers/selectors/test hooks when relevant, submitted values, retained choices and recovery paths.

After editing, map each retained item to its resulting location/behavior. A deliberate removal must have an explicit task reason and authorization within scope. Do not delete a field, error message or difficult-to-fit action merely to clear a visual warning. Do not silently replace actual feedback with a decorative success state.

A useful record is `target → before evidence → intended change → retained contract → recheck → remaining unknowns`. This adapts the preservation idea from Hallmark in original wording and keeps TasteForge's conditional policy. It is not a full redesign manifest required for every typo correction.

## 6. Localization, responsiveness and accessibility

Inspect actual rendered language, including Vietnamese diacritics and realistic long labels when those are supported. Preserve encoding, existing translation keys and the font/delivery constraints. Do not solve a fit problem by removing accents, shortening required facts without approval or loading an unrelated remote font.

At declared minimum widths, required text and controls must remain visible or appropriately reachable. Natural viewport checks and keyboard/focus inspection supplement screenshots. Root clipping and a passing no-overflow assertion cannot establish retention. [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) explains the applicable 320 CSS px criterion and exceptions; use its actual scope rather than a universal “no horizontal scroll anywhere” rule.

Automated accessibility checks cover their reported rules only. Incomplete records stay unassessed until inspected. Good copy does not excuse inaccessible controls, and a zero-violation scan does not establish understandable copy.

## 7. Acceptance for a separately approved implementation

- The new reference adds a decision-relevant distinction beyond existing art-direction/anti-pattern/refinement advice; duplicated passages are avoided.
- Routing remains on demand and Fast remains bounded. Existing system and content constraints still win.
- Examples have explicit fictional or source provenance and no invented factual claims.
- Selected existing artifacts are inspected at identified revisions, states and widths under Spec 12. Findings keep source, mechanical and judgment evidence separate.
- Any edited fixture retains its named behavior contract and receives a new revision/regression record. Frozen historical fixtures and run outputs remain unchanged.
- Documentation and package/skill checks appropriate to changed files pass. No visual-quality benefit is claimed solely because these checks pass.

One bounded retrospective inspection is a reasonable initial lane. A fresh matched pilot is optional if a specific claim about future generation remains important and unanswered. Human A/B recruitment is not an entry or exit condition for this increment.

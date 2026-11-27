# Independent AI review — scoped presentation

Date: 2026-11-10. Reviewed public snapshot: `5956a1731938bebdb13912d9c625c502a7bd8b43`, compared with `79820b58088245c32902d85cb0b2f14abd967aad`. Requested AGY model: `claude-opus-4-6-thinking`; the CLI does not support an effort override for that model. [Resources](resources.json) retain both the rejected-flag attempt and the successful compatible invocation.

The response below is a presentation of the AI review with Markdown formatting normalized. Raw response/stdout/stderr/invocation hashes are retained in resources; this file is not a byte-identical raw archive. The six public packet files were hash-checked before/after review. Eight reads are reviewer-reported, not independently measured. There were no images in its packet. Technical/hash claims in the AI response are its own assessment; the primary agent's actual checks are recorded separately.

## Reviewer response

I have the remaining portion of the patch to read:
Now I also need the remaining portion of the cabinet HTML:
I now have all six packet files read (manifest.json, requirements.md, checks-summary.md, current-entry.md, retained-ui-source.md, changes.patch). Total reads: 8 (within the 32-read budget). Let me produce the review.
The artifact directory has a write restriction. I'll present the full review inline.

---

# Independent review — copy/state coherence increment

**Reviewer:** Fresh external AI reviewer. **Packet:** commit `5956a17` against baseline `7982…7aad`. **Lanes exercised:** E0 source synthesis, E3 bounded AI judgment. **Date:** 2026-11-10. **Reads used:** 8 of 32. **No images inspected; no behavior executed; no delegation.**

---

## 1 Spec alignment findings

| Spec requirement                                                          | Delivered                                                                                                    | Status |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------ |
| Spec 11 §2: candidate reference, short, original examples                 | 44-line file, four fictional examples labelled "conditional on the implementation"                           | ✔      |
| Spec 11 §2: routing from art-direction and refinement, no new CLI command | Two routing sentences added; no new command or mandatory stage                                               | ✔      |
| Spec 10 §3: 8–12 cases, ≥6 distinctions, ≥4 task contexts                 | 12 cases, 12 counterexamples, Decide/Work/Read/Explore across 5 contexts                                     | ✔      |
| Spec 10 §1 CASE-01: required case fields                                  | All present per case                                                                                         | ✔      |
| Spec 10 §2 CASE-02: no aesthetic-frequency ban                            | Every case includes a legitimate keep condition                                                              | ✔      |
| Spec 11 §5 STATE-02: retention contract                                   | Reference §3 inventories items at risk, maps to result, requires authorized removal                          | ✔      |
| Spec 11 §7: Fast bounded, system constraints win                          | Reference opens with "settled Fast correction… only the relevant check"; routing confirms                    | ✔      |
| Spec 12 EVAL-01/EVAL-04: lane selection, bound material, honest limits    | evidence.json declares E0/E1, binds 10 files with SHA-256, four explicit limitations                         | ✔      |
| Spec 12 §2 EVAL-02: include conventional baseline                         | proofdesk-baseline selected; R01 keeps its serif/paper/controls                                              | ✔      |
| Spec 11 COPY-02: no font/slogan/eyebrow/card ban                          | "No color/font/card quota"; CS09 keeps meaningful eyebrows; CS06 keeps editorial serif                       | ✔      |
| Spec 11 §6: Vietnamese, responsive, accessibility                         | Reference §3 addresses diacritics, reflow exceptions; CS12 covers locale sacrifice                           | ✔      |
| Historical fixture immutability                                           | No old artifact edited; hashes match manifest bindings                                                       | ✔      |
| No manufactured specificity                                               | CS04 and the case-bank preamble explicitly prohibit inventing metrics/customers                              | ✔      |
| Source/package boundary                                                   | Research under `docs/research/` excluded from skill package; 24 skill files match source/build/tarball bytes | ✔      |

**Minor observation:** Spec 10 asks for per-case status; cases carry IDs and revision but default status from the bank header. This is within "proposed" lifecycle and does not affect utility.

**Attribution:** Source ledger (S01–S10) records origin, kind, retrieval scope and limits. Community opinions labelled "selected opinion"; W3C pages labelled "informative explanation"; Hallmark aesthetic floors called "house choices." AGY role disclosed as "secondary draft" with corrections itemized.

---

## 2 Quality findings (ranked by real user effect)

| #   | Finding                                                                                                                                                       | Class     | Real effect                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | R02 notes a craft improvement ("saved" → "kept for this retry") without executing it; correctly labelled optional, flagged for future authorized edit         | **Minor** | No current user effect; the demo disclosure makes the word locally truthful. Reasonable operator could misread persistence scope in a real product, but the note is proportionate. |
| Q2  | Every "possible consequence" is labelled hypothesis; every counterexample is a keep condition; no defect class assigned without "demonstrated" qualifier      | Positive  | Reduces false mandatory fixes.                                                                                                                                                     |
| Q3  | Four reference examples are conditional, not templates; spec 11 §3 examples paraphrased, not duplicated                                                       | Positive  | Avoids duplicate passages (spec 11 §7 criterion).                                                                                                                                  |
| Q4  | R04 notes cabinet's lower reset button is below captured viewport, distinguishes source-presence from viewport visibility, but top reset is confirmed visible | **Minor** | A rendered check at 320px would strengthen this. The finding is honest about its limit.                                                                                            |
| Q5  | No new unit tests; justified as prose-only work; existing package/skill checks passed                                                                         | **Minor** | Proportionate. New tests would mirror wording.                                                                                                                                     |
| Q6  | CRLF archive issue encountered, diagnosed, resolved with both attempts recorded                                                                               | Positive  | Transparent infrastructure record.                                                                                                                                                 |

No **Critical** or **Important** findings.

---

## 3 Hypothetical application scenarios

### 3.1 Failed approval with in-memory paper/quantity — clearer retry copy

The source stores paper and copies in a JS `drafts` object. Survives within the page session only; `approve()` retains values after the deliberate first-attempt failure.

- **Wording:** Change "Your paper and copies are saved" to e.g. "Your paper and copies are kept for this retry" — reflecting in-memory lifetime. Do not claim account persistence. (Reference §1: state persistence scope.)
- **Retention:** Paper selection, copies value, retry button, edit button and local-demo disclosure must all survive.
- **Recheck:** Trigger the failure path; confirm retained values, retry action and announcement. Fast bounded: one check, no new research stage.

### 3.2 Active filter, no matches, populated collection, reset exists

- **Say:** The active filters produced no matches. Name the filter scope and available reset. Do not say "No panels in the cabinet" or imply the collection is empty. (Reference §1, third row; CS11.)
- **Keep:** Filter controls and their current values, result count ("0 panels found"), both reset paths, pinned-panel state. The collection identity should remain accessible or inferable.

### 3.3 Fixed brand serif, cards, eyebrow category, Vietnamese labels — one narrow-width label correction

- **Keep** the serif, cards and eyebrow. They are legitimate: CS06 (editorial type with content reason), CS09 (meaningful category label), CS05 (cards for independent items), COPY-02 (no font/eyebrow/card ban).
- **Act on only the label.** Inspect rendered text at minimum supported width. If a Vietnamese diacritic or required qualifier is clipped, fix wrapping/hierarchy — do not remove diacritics or shorten required facts. (Reference §3; CS12.)
- One correction, one recheck. No redesign, no serif removal, no new research stage. Record target/state/width → evidence → edit → recheck.

### 3.4 Playful headline with concrete instructions; recovery works; no defect found

- **Decision: Keep.** The headline with nearby concrete copy is the legitimate counterexample from CS01 and R04. Do not remove it because a community list mentions that ingredient.
- **Claim:** "No meaningful defect found within the inspected scope [state states, widths, behaviors checked]. The headline is paired with understandable task information; no copy-information gap was demonstrated." List what remains unassessed. Do not claim usable, accessible or improved.

---

## 4 Declined to judge (with reasons)

| Behavior                                   | Reason                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Rendered visual quality at 320/390/1440px  | No images in this packet; requires actual rendering                                                      |
| Keyboard/focus/screen-reader behavior      | Requires executed behavior traces                                                                        |
| Vietnamese native-speaker comprehension    | Requires human linguistic evidence                                                                       |
| Whether guidance improves future UIs       | Requires E4/E5, neither executed                                                                         |
| 87/66 historical assertion counts          | Accepted from recorded summaries without re-execution                                                    |
| Completeness of AGY curation corrections   | Can verify stated corrections are consistent with final bank; cannot inspect raw AGY output              |
| Full accessibility of either HTML artifact | No audit executed; 84 historical incomplete records remain unassessed per retrospective's own disclosure |

---

## 5 Verdicts

**Spec alignment: Pass.** Every material requirement of specs 10–12 is delivered within declared scope. Attribution is traceable, counterexamples prevent aesthetic bans, Fast stays bounded, research stays outside the skill package, historical artifacts are unmodified, and evaluation limits are honestly declared.

**Quality: Pass with minor notes.** The increment establishes a useful, well-bounded copy/state reference that adds a decision-relevant distinction without introducing mandatory workflows, aesthetic bans or unsupported improvement claims. Two minor findings (R02 craft note unexecuted; R04 viewport limit) are both honestly disclosed in the increment's own records. No critical or important issues found.

> This review is a bounded E3 AI judgment over source material. It does not establish that the guidance improves user outcomes, that artifacts are fully accessible, or that Vietnamese copy is linguistically adequate. Those claims require their own evidence lanes.

## Integrating-agent disposition

- No Critical/Important issue was demonstrated. The four qualitative applications align with the reference's retention, truthful-empty-state, bounded Fast and legitimate-keep distinctions; they are not a matched wording trial or proof of future agent performance.
- The per-case lifecycle note is clarified by explicitly applying status `reviewed` and revision 1 to CS01–CS12 in the bank header. This metadata clarification is an addendum after the reviewed snapshot, not a claimed new reviewed snapshot.
- R02's retry-lifetime wording remains an optional future fixture edit. The historical UI is preserved; no data-loss defect was established.
- R04's broader viewport/behavior evidence remains unassessed. The primary agent inspected the retained 320 capture and visible top reset; the external reviewer did not inspect images. A new rendered study is not required to complete this scoped E1 record.
- The absence of prose-mirroring unit tests is an intentional verification choice, not an outstanding product defect.
- Declined visual, keyboard/screen-reader, native-language, future-generation, raw-curation and full-accessibility judgments retain their recorded limits. Historical assertion counts were not re-executed by the reviewer. The reference makes no corresponding unsupported claim.

The reviewed skill/routing bytes are unchanged by this addendum. Later edits only clarify case lifecycle and record review/validation metadata.

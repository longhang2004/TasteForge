# UX/layout study — 1 November 2026

**There are localized UX improvements; this study does not establish that layouts reliably escape generic AI composition.** Twelve fresh interfaces compare the current skill against no skill on three tasks, with two creator models. Two independent AI reviewers inspect neutral layouts before authored styling. Exact task, fixture, starter, asset and resource access are matched within each task.

Start with the [comparison gallery](index.html) or [findings and caveats](report.md). Both neutral-stage scores and later authored qualifications are preserved. The gallery defaults to neutralized layouts and hidden condition labels; switch modes and reveal conditions deliberately.

## Findings to examine

- **Decision context improves more consistently than layout novelty.** After excluding the one block affected by a neutralizer defect, reviewers rate decision context higher with the skill in 3/5 and 4/5 pairs, respectively; the others tie. This is descriptive, not a population estimate.
- **Mobile is mixed.** One reviewer favors 4/5 remaining pairs, the other favors 1/5 with three ties and one regression. The skill-assisted Sol transfer still has a 342px document in the supporting 320px viewport. Do not claim universal responsiveness.
- **A real structural change exists in Sol inventory:** skill-assisted u07 switches mobile to focused detail/review while retaining filter/search context; baseline u01 keeps the list above the work. Both remain conventional list/detail designs and complete the scripted task.
- **The neutralizer introduced a defect.** It hid a visible target row in baseline Luna inventory u10. Both reviewers recognized the row in authored images. Raw scores remain frozen; a labeled post-hoc sensitivity check omits that entire pair rather than counting the artifact as an improvement.
- **Behavioral checks are supporting evidence.** All twelve cases complete the scripted main flows at 1440px and 390px after documented harness corrections. u12's missing selection hook remains a failed technical diagnostic; an actual SKU-row fallback was used. Several UIs retain contrast findings and u09 has label findings. No UX/accessibility certification or user-study claim.

The evidence supports better grouping/review in some outputs, not a wholesale transformation of the common form/card/product/list-detail shells. Familiar structure can be appropriate. The unresolved question is reliable task benefit for real users, rather than visual difference or a larger catalog.

## Inspect and reproduce

```bash
cd /path/to/TasteForge/evals/runs/2026-11-01-ux-layout-study
python3 -m http.server 8767 --bind 127.0.0.1
# Open http://127.0.0.1:8767/
```

- [Frozen protocol](protocol.md), [manifest and assignments](manifest.json), [machine-readable results](results.json).
- [Raw independent reviews](reviews/README.md), [ratings CSV](reviews/ratings.csv), [harness corrections](harness-notes.md).
- `cases/`: raw submitted UI, unchanged task/fixture, notes, self-review images, actual optional CLI artifacts. No operator repairs.
- `treatment/`: exact skill and external catalog supplied in this study. Generator and built runtime hashes are recorded in the manifest; exact backend model snapshots are not available.
- `evidence/<case>/`: actual Chromium captures, task checks, geometry, axe observations, focus traces and a supporting 320px capture.
- `reviews/packet/`: anonymized neutral/authored screenshots; original packets and hashes retained, including the flawed neutral row.

The isolated `tools` workspace pins Playwright 1.64.1 and axe 4.14.0. With its dependencies and Chromium 156.0.8078.4 available, run `node tools/check-gallery.mjs` to verify 96 viewer combinations. `node tools/verify.mjs` checks bound artifact hashes, frozen reviews, packet/input/source integrity and report consistency. The original pilot/follow-up/probe are separate runs and remain unchanged.

`capture.mjs`, `build-study.mjs` and `build-results.py` reproduce the operator transformations, but do not overwrite this preserved run to create new observations. Use a new dated directory if fonts/browser, prompts, source, skill or catalog change. Font substitution in neutral renders can change wrapping or occlude transparent overlays; always inspect authored evidence and recorded caveats too.

## OpenCode supplement availability

At the user's request, OpenCode 1.19.3 was checked for DeepSeek V4.1 Flash Free and GLM-5.3-Flash Free. Both IDs were listed, but both tiny no-tools calls reached the provider and received **“Free usage limit reached.”** No supplemental UI exists, no paid model was selected, and no existing credentials were used. Read the [actual call records and logs](evidence/opencode-availability/README.md); do not count these as model-quality failures or extra benchmark samples.

## Limits

One generation per cell and six heterogeneous pairs; soft creation budget; no controlled inference seeds, exact backend snapshots, token counts or matched compute. Both conditions had equal offline CLI/data and preview access, so this measures an instruction/workflow difference under available tools, not tool access alone. Actual tool use differed. AI reviewers are not representative operators/customers; condition blindness is best effort. One pair has compromised neutral evidence and is omitted in a post-hoc sensitivity interpretation. No causal/general benchmark improvement claim, task-time measurement, user comprehension study, full zoom/screen-reader evaluation or aggregate taste score.

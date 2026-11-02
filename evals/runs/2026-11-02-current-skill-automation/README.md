# Current-beta automated UI study — 2 November 2026

**TasteForge helped some grouping and decision-context judgments; it did not reliably solve narrow layout or accessibility.** Twelve fresh UIs form six matched pairs across two tasks and three creator models. All final primary-task traces completed, but two checkout outputs overflow at 320px. These are exploratory results, with one generation per cell and no human usability claim.

Open the [comparison viewer](index.html), [findings and limitations](report.md), [measured analysis](analysis.json), [browser results](results.json), or [individual ratings](reviews/ratings.csv).

## Actual scope

- Eight fresh subagent UIs: GPT-6.1 Sol and GPT-6 Luna × transfer/checkout × without/current skill.
- Four native Antigravity 1.4.12 UIs: pinned Gemini 3.8 Flash Medium under the same paired tasks and scoped permissions.
- OpenCode 1.19.3 tried DeepSeek V4.1 Flash Free, then GLM 5.3 Flash Free, sequentially. Both returned `Free usage limit reached`; there are zero OpenCode UI submissions. Eight optional planned cells remain availability-blocked, not quality failures.
- Current beta skill frozen from commit `449c90b`: all 20 Markdown resources, catalog `2026.11.01.2`, identical task/fixture/starter/assets and CLI/catalog availability within each pair. TasteForge sampling seed42 does not control model randomness.

## Executed checks

The 12 UIs have 36 complete browser traces at 1440×1000,390×844 and320×740. There are552/558 passed recorded assertions; the six failures describe two overflow defects across initial/review/cart states. Excluding18 supporting diagnostic assertions,534/540 passed. Counts repeat checks across widths and are not independent samples or a UX score.

Separately, the repository passed build/typecheck/lint/format and44 tests. Maintained inventory/effects/gallery examples passed77/95/108 checks respectively. The comparison viewer passed171 states at three widths. These check sets measure different artifacts and are not combined into a quality number.

## Read the evidence correctly

All state screenshots reset scroll to the page top. A viewport image is a top-of-page clip, not a natural post-click focus/scroll landing; full-page images include below-fold content. Neutral images preserve transparency/luminance but replace fonts and can reflow. Reviewers froze neutral notes before authored inspection, and retain null/unassessed recovery and disagreements.

Raw creator UIs and initial operator failures are unchanged. A uniformly corrected second harness pass handles hidden duplicate hooks and ordinary failure wording; [harness notes](harness-notes.md) explain the correction. [Scope clarification](reviews/capture-scope-clarification.md) and [c08's CLI clarification](evidence/c08/creator-clarification.txt) preserve evidence limits.

## Inspect locally

```bash
cd evals/runs/2026-11-02-current-skill-automation
python3 -m http.server 8770 --bind 127.0.0.1
# Open http://127.0.0.1:8770/
```

`node tools/verify.mjs` verifies preserved inputs/source/captures and the final hash set. Dependencies are pinned in `tools/`; the creation environment reused an ignored symlink to previously installed tools. Generation/capture scripts refuse to replace existing evidence: use a new dated run for future trials.

Human testing and manual assistive-technology review were deferred at the user's request, not passed. No general improvement, host ranking, accessibility certification or claim of eliminating AI slop follows from this study.

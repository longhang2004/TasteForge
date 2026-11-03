# Audit an interface

Start with the requested target and existing system. A technical source audit can inspect source directly; a visual critique starts with the task and actual renders, then reconciles detector results. Disclose when existing findings influenced the review.

Trace the first useful action, facts compared, consequence and edit/error/recovery path. Inspect affected states at relevant widths, including the product's minimum supported width. Read [accessibility](../references/accessibility.md), [interaction](../references/interaction-motion.md) or another reference only for an unresolved finding.

If useful and installed, run `tasteforge audit --path <project-local-source> --format json`; record completed exit/output evidence as described in [catalog use](../references/catalog-use.md). Keep findings distinct:

- **Verified source:** the named syntax/declaration condition is established; rendered impact may still be unknown.
- **Heuristic:** a contextual pattern deserves inspection. Keep it when it serves the task.
- **Review:** supported source analysis cannot resolve the question.

The static audit does not establish full cascade, responsiveness, runtime accessibility or factual truth. A familiar layout, card count or gradient alone is not a defect.

Prioritize task/access/content failures before polish. For each material finding retain target/state/width, evidence, user consequence and uncertainty. A source-only review must not claim rendered inspection.

If correction is requested, use [targeted refinement](targeted-refinement.md). Escalate to [redesign](redesign-ui.md) only when the authorized scope includes the necessary structural/system change. Keep useful repetition and justified brand exceptions; do not rewrite a working system to satisfy a heuristic.

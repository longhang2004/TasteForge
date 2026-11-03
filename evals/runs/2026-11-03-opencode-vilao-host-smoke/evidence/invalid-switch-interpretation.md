# Parent diagnostic correction

The first extra invalid-switch diagnostic required immediate `aria-invalid` and live error text after editing an invalid value and changing glaze, before any submit attempt. Both original UIs recorded 0/12 under that predicate. Those raw reports and the exact checker are retained in `*-initial-invalid-switch/` and `invalid-switch-before-submit.mjs`.

That predicate over-specified the original brief: deferred validation on an attempted submit is a familiar valid interaction. DeepSeek already renders unavailable totals while invalid, retains the input, and supplies actionable errors on submit. Its lack of a live error before the first submit is not classified as an acceptance defect here. These 12/12 diagnostic failures must not be presented as 12 UI bugs.

The corrected test uses the same input → glaze switch → attempted submit trace, and checks retained input, error feedback and unavailable current totals. It writes separate `*-invalid-switch-submitted/` records, preserving the first diagnostic unchanged. GLM's distinct reproduced positive-integer 5 → Iron clamp/stale-total defect remains valid independently of this diagnostic correction.

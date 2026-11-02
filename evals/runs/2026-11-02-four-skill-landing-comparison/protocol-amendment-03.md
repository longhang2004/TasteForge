# Provider interruption and user-confirmed continuation

The user selected two briefs × four repositories/eight UI and requested continuation after the provider usage interruption. The original source/brief/protocol snapshots remain unchanged. Same creator contexts resume; no model/provider substitution, paid fallback, artistic reroll or extra prompt is introduced.

fold-2 and valid relay-1 were interrupted by usage-limit errors after writing HTML. Before resumption, root copied their current bytes into `cells/*/quota-interruption-01/checkpoint.html` and recorded hashes/mtime/observation in [quota-interruption-01.json](quota-interruption-01.json). These are interruption checkpoints, not fabricated original first-write timestamps. fold-2 had no versions/00 marker at this observation; its actual history must be recorded honestly, never backdated. valid relay-1's existing version remains intact.

External model unavailability/user wait is excluded from the per-cell **active** creation allowance, but original start, interruption, resumption and full observed wall span remain separate resource coverage. A resumed creator gets only remaining active budget to finish the existing artifact/check/record, not a fresh8/12-minute design attempt. Any unavailable pre-interruption active timing stays unknown. Already passing work is not restyled. New cells retain original budgets. Human/manual tests remain deferred.

The known relay-2 stale annual success after a billing edit is a real matched-test finding; it remains in raw initial evidence and will use the one targeted operator correction allowance. Quota does not erase that finding or convert a technical failure into a pass.

## Subsequent diagnosis — initial finding corrected

After resumption, source/visibility review showed relay-2 already hides feedback when billing changes. HTMLElement innerText on a hidden element retained its old text, so the original root assertion falsely classified hidden confirmation text as visible stale success. The initial suspicion above and three raw failures remain preserved; it is a **harness false positive**, not an established UI defect. The corrected assertion inspects visibility before judging stale messages and rechecks the same unchanged submission. No operator UI correction is made for this finding. This correction applies to all following cells, with exact harness snapshots retained per pass; earlier fold-1 passed the stricter assertion already.

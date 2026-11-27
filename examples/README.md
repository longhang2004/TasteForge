# Examples

[Composition field guide](composition-library/README.md) adds twelve original schematic composition cards, fit/tradeoff/source details and local licensed typography specimens. It teaches information relationships; it is separate from the runnable studies and fresh evaluation outputs.

[Composition studies](composition-studies/README.md) provides four runnable conventional/adapted pairs: operational work, commerce decision, editorial reading and collection exploration. Each uses shared declared fixtures, original licensed diagrams, natural-state evidence and explicit tradeoffs. These authored teaching cases are separate from the [fresh quality/identity pilot](../evals/runs/2026-11-02-quality-identity-forward-test/README.md).

[Annotated design gallery](design-gallery/README.md) presents three actual inventory repairs and one structural tradeoff, with authored notes, original-image/trace links and scope/hash checks. It illustrates context-sensitive decisions rather than aesthetic bans.

[Effect studies](effects-lab/README.md) explores original text emphasis, grid/list position continuity and image comparison, with keyboard/touch, reduced-motion and no-JS evidence. Source research and task-fit guidance live in the skill; these studies do not add effects to the CLI sampler.

[Inventory workbench](inventory-workbench/README.md) is a runnable, agent-authored task composition with two neutral structural prototypes, retained mobile detail/review/error states, actual browser captures and a documented revision pass. Human design approval and representative-user testing remain pending; it is separate from the preserved benchmark submissions.

`brief.json` is a fintech dashboard context with English/Vietnamese text, dense layout, and a conservative creativity setting. `generated/` contains actual CLI-generated artifacts for `data-dense-enterprise`, seed 42, using engine and knowledge 0.1.0.

From the repository root:

```bash
pnpm tasteforge --project examples suggest --brief brief.json --count 3 --seed 42 --format json
pnpm tasteforge --project examples generate --brief brief.json --direction data-dense-enterprise --seed 42 --dry-run
pnpm tasteforge --project examples audit --path source --format json
```

The dry run plans `.tasteforge/` outputs inside `examples`; the checked-in snapshot lives in `generated/` to make it easy to inspect. To regenerate it, run without `--dry-run` and copy the three generated artifacts into `generated/`. Review existing files before using `--force`.

`source/Review.tsx` and `source/review.css` deliberately contain questionable patterns for the audit: a low-contrast declared pair, a missing font fallback, three card-like ancestors, repeated gradients, and an unavailable token. They are fixtures, not a rendered example product. The audit without generated DNA does not assume the snapshot's tokens are installed in the source application.

`ux-plans/transfer.md` and `ux-plans/commerce.md` are hand-authored examples of the newer skill's reference-led structural planning. They compare information order, decision placement, state flow, and narrow-screen behavior before choosing visual tokens. They are not generated UI outputs or measured improvement results, and do not modify the preserved pilot.

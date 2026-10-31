# Examples

`brief.json` is a fintech dashboard context with English/Vietnamese text, dense layout, and a conservative creativity setting. `generated/` contains actual CLI-generated artifacts for `data-dense-enterprise`, seed 42, using engine and knowledge 0.1.0.

From the repository root:

```bash
pnpm tasteforge --project examples suggest --brief brief.json --count 3 --seed 42 --format json
pnpm tasteforge --project examples generate --brief brief.json --direction data-dense-enterprise --seed 42 --dry-run
pnpm tasteforge --project examples audit --path source --format json
```

The dry run plans `.tasteforge/` outputs inside `examples`; the checked-in snapshot lives in `generated/` to make it easy to inspect. To regenerate it, run without `--dry-run` and copy the three generated artifacts into `generated/`. Review existing files before using `--force`.

`source/Review.tsx` and `source/review.css` deliberately contain questionable patterns for the audit: a low-contrast declared pair, a missing font fallback, three card-like ancestors, repeated gradients, and an unavailable token. They are fixtures, not a rendered example product. The audit without generated DNA does not assume the snapshot's tokens are installed in the source application.

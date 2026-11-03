# Static import audit fixture

These original repository-authored CSS fixtures use the repository's MIT license. They contain deliberately problematic declarations for source-audit acceptance, with no remote assets, product claims or external stylesheet fetches. No font is downloaded; the single-family stack is an intentional finding.

From the repository root after `pnpm build`:

```sh
pnpm tasteforge audit --path examples/audit-imports/entry.css --resolve-imports --format json
pnpm tasteforge audit --path examples/audit-imports/partial.css --resolve-imports --format json
pnpm tasteforge audit --path examples/audit-imports/entry.css --format json
```

The complete entry imports tokens and a consumer as sibling dependencies. `notice.css` should report a numeric declared contrast pair (about 2.32:1) and a missing generic font fallback, with token definition locations in `tokens.css` and the entry listed on each finding. The default audit follows no imports and audits only the selected entry.

The partial entry uses a conditional import. It should report that edge and the variable-valued declaration as review, without using the fallback to claim a verified pair. “Complete” describes only supported static resolution. These fixtures do not establish rendering, accessibility conformance, human usability or product specificity.

Observed results and test/performance evidence are recorded in [the enhancement validation report](../../docs/audit-imports-validation.md).

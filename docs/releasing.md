# Preparing a release

This checkout is an initial 0.1.0 foundation, not a published registry release. Review ownership and availability of the `tasteforge` and `@tasteforge/*` registry names before publishing. No publish command is executed as part of development or CI.

1. Run `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm check`. Review supported Node versions, production dependency advisories, and changed deterministic output.
2. Verify knowledge schema/engine versions and regenerate the example artifact bundle from `examples/brief.json` with the documented direction and seed. Inspect the agent skill references and run its validator where available.
3. Pack packages with `pnpm --filter @tasteforge/knowledge pack`, `pnpm --filter @tasteforge/core pack`, and `pnpm --filter tasteforge pack`. Workspace protocol ranges are rewritten by pnpm in tarballs; do not publish raw manifests with unresolved workspace ranges.
4. Run `pnpm pack:smoke` after building. It packs all three packages, checks archive contents, installs the CLI offline with local core/knowledge overrides into a clean temporary project, and executes the installed binary through init/suggest/generate/audit. It checks bundled licenses, skill files, JSON knowledge, and independence from monorepo source paths. This is an Ubuntu/POSIX packaging check, not a native Windows installer test.
5. Write release notes with supported features, known audit limits, any version/schema migration, and actual test evidence. Keep benchmark results absent until they have been collected using the rubric.
6. With maintainer authorization, publish knowledge, then core, then CLI, and tag the coordinated release. Registry authentication, provenance, namespace rights, and publishing remain release-operator responsibilities.

Near-term priorities are real host-agent integration tests, controlled independent evaluations, project-wide token import resolution, broader CSS value support, and tested language expansion. A parser-heavy audit may later need an incremental cache; avoid adding infrastructure before measuring local workloads.

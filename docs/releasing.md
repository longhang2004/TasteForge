# Preparing a release

TasteForge distributes coordinated GitHub source/package/skill artifacts. The npm names remain unpublished. Release preparation does not push, tag, create a GitHub release or publish to a registry.

## Validate the candidate

1. Set the root and all three package versions together. `tasteforge --version` reports its package version. The validated generator engine, generator knowledge and external reference catalog have separate versions: retain them when their contracts/data have not changed. Do not invalidate old DNA merely to label a package release.
2. Run `pnpm install --frozen-lockfile` and `pnpm check`. Check the configured CI runtime matrix; use an Active/Maintenance LTS runtime for development. Node 20 remains a legacy compatibility target; Node 22/24/26 are the current LTS matrix at this preparation date. See the [official release schedule](https://nodejs.org/en/about/previous-releases).
3. Run `pnpm audit --prod --json` and review actual advisories. Run `pnpm pack:smoke`: it packs all three packages, prepares an isolated public dependency cache, installs the archives offline with local core/knowledge overrides, then executes all six commands. Dependency preparation can access the registry; runtime CLI operations remain offline.
4. Regenerate the example bundle from `examples/brief.json`, direction `data-dense-enterprise`, seed 42, into a separate temporary project. Compare with `examples/generated`; investigate any change before replacing a snapshot. Validate the skill frontmatter, local links and all packaged skill resources.
5. Run saved evaluation/example integrity verifiers. Keep original cases, ratings and frozen skill versions intact. Review actual release-bound logs/artifacts for unintended credentials and oversized files without printing secret values.
6. Write release notes with supported features, version/compatibility changes, exact verification evidence and limitations. Separate scripted operations, agent review and actual user testing. Preserve existing licenses and third-party notices.

## Build reviewable artifacts

Commit the reviewed candidate locally so it has an immutable source revision. Keep preparation on a `codex/` branch when working through Codex. Validate that revision; a byte-verified Linux checkout can avoid the Windows-mount slowdown, but record that environment explicitly.

Save the actual validation summary under `.tmp/release-v<VERSION>/validation/summary.json`, with top-level `status: "passed"` and evidence/log metadata. Then run:

```bash
python3 scripts/prepare-release.py
```

When host smoke tests install a candidate skill ZIP, record `standaloneSkillArchive: {"path": "validation/tasteforge-skill-v<VERSION>.zip", "sha256": "<actual hash>"}` in the summary. The builder copies those exact tested bytes into the release assets, verifies every member against this candidate's skill source/license and rejects unexpected or duplicate members. The path must stay inside this version's preparation directory. Without that field it builds the skill ZIP as before. Keep raw host failures and distinguish extraction/discovery, actual invocation and task checks.

The helper requires a clean Git checkout, matching package versions and the passed local summary. It packs the three coordinated packages, verifies archive versions/license files, builds a standalone skill ZIP, archives the exact Git commit, copies release notes/validation metadata and writes a manifest and SHA256 checksums. It uses Python 3, Git, pnpm and POSIX tar as maintainer tools; they are not extra CLI runtime requirements.

Artifacts are placed in `.tmp/release-v<VERSION>/artifacts/`. Runtimes and diagnostic logs stay in sibling preparation directories and are not upload assets. The script refuses to overwrite a nonempty artifact directory. A passed summary is a local operator record, not an attestation or substitute for reviewing its logs.

## Publish as a separate step

After the candidate and artifacts are approved for publication, push the selected commit, obtain the configured GitHub CI result, and create a new version tag/GitHub pre-release using only the manifest-listed assets and checksum file. Check every uploaded checksum. Do not move old tags or replace the contents of an existing release version.

Publishing to npm is a separate action: verify namespace ownership, authentication/provenance and dependency order first. Do not publish raw manifests containing unresolved `workspace:` dependencies. A GitHub pre-release does not imply an npm release or certified integration with every agent host.

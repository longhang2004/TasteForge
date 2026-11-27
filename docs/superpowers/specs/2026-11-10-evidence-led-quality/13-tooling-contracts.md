# 13 — Optional research records and local tooling contracts

Date: 2026-11-10. Status: future design proposal; part of [programme design 08](../2026-11-10-evidence-led-quality-design.md). No helper, schema or command described here exists by virtue of this spec. P0 and P1 can use Markdown without implementing this module.

## 1. Trigger and architecture

Build tooling only when actual maintenance errors, repeated packet assembly or review volume justify it. First prefer a small local standard-library helper under `evals/tools/` over a service, framework, plugin or new package dependency. Reuse the existing evaluation integrity design where appropriate; avoid a speculative universal benchmark engine.

**TOOL-01:** research formats are separate from public brief/config/DNA/catalog schemas. Proposed record namespace values such as `tasteforge.research.source.v1` identify their own shape; the `v1` does not increment or reinterpret DNA schema `1.0`. No new CLI command, public package export, network dependency or core filesystem access is implied.

Candidate helpers, if later approved, have two jobs: validate a small curated registry and assemble a bounded review packet from explicit local inputs. They do not harvest Reddit, assign AI-authorship probabilities, execute project code, invoke models or rewrite skill guidance automatically.

## 2. Logical records

These are normative logical fields for a future implementation, not a promise of today's JSON schema. Builders may use JSON files or a simple Markdown frontmatter convention, but must preserve the meanings and validate before claiming machine-readable interchange. One implementation should choose one canonical representation rather than maintaining two editable sources of truth.

| Record        | Required fields                                                                                                                                                       | Optional or conditional fields                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Source        | `schemaVersion`, `id`, `title`, `canonicalUrl`, `sourceKind`, `accessedAt`, `retrievalStatus`, `materialScope`, `originGroup`, `rights`, `limitations`                | `versionRef`, `paths`, `derivedFrom`, captured-byte references |
| Observation   | `schemaVersion`, `id`, `sourceId`, `location`, `paraphrase`, `claimBasis`, `limitations`                                                                              | stance, applicability, related observation IDs                 |
| Case          | `schemaVersion`, `id`, `revision`, `status`, `provenance`, `context`, `findingClass`, `signal`, `consequence`, `counterexample`, `decision`, `recheck`, `limitations` | source/observation refs, artifact refs, supersedes             |
| Decision      | `schemaVersion`, `id`, `question`, `caseIds`, `evidenceKinds`, `resolution`, `rationale`, `unknowns`, `allowedClaims`                                                 | rejected alternatives, implementation scope, supersedes        |
| Review packet | `schemaVersion`, `id`, `question`, `root`, `files`, `exclusions`, `budget`, `reviewInstructions`                                                                      | blinding policy, environment/check records                     |

Source kinds use the classes in Spec 09. `claimBasis` is `direct-inspection`, `author-report`, `inference` or `unassessed`. `originGroup` is an ID or `unknown`. Dates use ISO dates; captures use UTC timestamps when precision matters. Do not infer revision hashes from access dates.

Source IDs are local stable identifiers such as `S01`; they need not be globally unique. Cross-registry references include registry ID/revision. Case IDs are stable and revisions append changes; adopted historical copies never change in place. A JSON representation rejects unknown fields within the declared version and duplicate IDs instead of silently ignoring them. Version migration requires an explicit converter or a clear compatibility boundary.

## 3. Illustrative payload

This example describes a public source, not a cached copy. `limitations` is empty only when the author has actually considered the material scope; it does not mean the source is universally reliable.

```json
{
  "schemaVersion": "tasteforge.research.source.v1",
  "id": "S08",
  "title": "Understanding Reflow",
  "canonicalUrl": "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
  "sourceKind": "authoritative-guidance",
  "accessedAt": "2026-11-10",
  "retrievalStatus": "inspected",
  "materialScope": "Understanding page; not a product conformance audit",
  "originGroup": "w3c-wai-wcag22",
  "rights": {
    "disposition": "link-only",
    "note": "No mirrored page or screenshot included"
  },
  "limitations": ["Mutable URL; no captured-byte snapshot in this record"]
}
```

**TOOL-02:** a URL record has no file hash unless actual permitted bytes were captured. Local artifact references bind a relative path, SHA-256 and declared role. Hashing a paraphrase binds the paraphrase, not the remote source. Packet hashes establish byte identity, not visual quality or truth.

## 4. Validation behavior

The optional validator checks declared format/version, unique IDs, reference existence, enumerations, required evidence labels, URL scheme and local path boundaries. It detects a missing counterexample or a `sourceId` pointing nowhere. It cannot establish that a paraphrase is faithful, sources are truly independent or copy is useful; those remain review tasks.

Candidate helper interface names are `validate_registry` and `assemble_review_pack`; exact filenames and argument spelling are builder choices in the later implementation plan. Proposed process results are exit `0` for a valid operation, `2` for invalid input and `3` for an I/O/environment failure. Records with `unassessed` or `unavailable` are valid when correctly labelled, not implicit passes. Errors go to stderr; structured reports go to a declared file or stdout. No public CLI exit contract changes.

Validation is local and does not dereference URLs. A separate explicit research action can update availability. This prevents a reproducible validation step from becoming an implicit network scan or authentication request.

## 5. Packet boundaries and invariants

**TOOL-03:** the packet assembler reads only allowlisted regular files inside the declared source root and writes only a new declared output directory. Resolve paths before use; reject traversal, absolute embedded paths, paths outside roots, symlinks/junctions and non-regular files. Reject multiply linked source files unless a future design establishes an equally strong boundary; do not follow an alias to private content. Account for Windows case behavior and WSL path mapping when those hosts are claimed supported.

An existing output directory is refused, never recursively overwritten. Inputs are not mutated. Unknown extra files in a frozen review root invalidate the packet. A partial failed output is labelled incomplete and must not be submitted as frozen; a retry uses a new directory. Read checks and final hashes must detect input changes during assembly. A hash mismatch after freeze invalidates the review binding and requires a new packet, not an edited manifest.

Proposed initial packet caps are 100 files, 50 MiB total bytes, 6 cases and 24 images, with path depth at most 32 and individual files at most 10 MiB. All applicable caps apply; they do not inherit or widen the production CLI's existing scan limits. Count discovered entries before reading; enforce byte limits during reads. The 32-read reviewer budget in Spec 12 is distinct from packet membership: reviewers may use an index without reading every allowed file. Larger packets require a newly declared scope and caps before assembly.

Keep unblinding keys and creator-identifying metadata outside the reviewer read root. A future helper must not claim sandbox isolation unless it actually enforces it. A directory allowlist alone does not prevent a powerful external tool from reading other directories; reviewer permissions must match the claimed boundary.

## 6. Reproducibility, privacy and publication

Stable ordering and canonical serialized fields permit identical manifests for identical declared inputs, apart from explicitly excluded creation metadata. Include actual tool revision and environment when used. This makes packet identity reproducible; it does not make a model's judgments deterministic.

Private source paths, tokens, credentials, browser profiles and unrelated project material are excluded by default. Public publication uses a separately reviewed export allowlist and rights disposition. Do not send local packets to AGY or another provider automatically. Follow the actual authorization/approval result and retain local/native review as an alternative.

Packaged TasteForge skills contain only intentional distilled guidance, not raw research corpora, private reviews or bulky screenshots. Existing repository skill-to-package synchronization remains authoritative. Verify actual inventories; do not hardcode an outdated skill-file count into acceptance.

## 7. Meaningful later verification

If helpers are implemented, test rejection of traversal, external links, hardlinks, duplicate IDs, missing references, oversized input, output collision, changed files and extra files after freeze. Test a valid minimal registry and deterministic assembly. Include the claimed Linux/WSL/Windows boundary cases rather than asserting universal host support from one environment.

Verify offline behavior and that public CLI commands, generated DNA and package boundaries remain unchanged where no product change is intended. The normal repository checks apply to actual changed code. No helper tests are needed merely to deliver this design document.

## 8. Deferred choices

Storage layout, exact schema library versus standard-library validation, and helper argument names belong in a later plan once the maintenance trigger is demonstrated. A hosted index, background refresh, embedding store, automatic licensing classifier and runtime model integration are outside this proposal. Their absence does not block source-led guidance work.

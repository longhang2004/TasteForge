# Contributing

Use Node 20.19+ (22/24 recommended) and pnpm 10.13.1. Install, build, and run checks:

```bash
pnpm install
pnpm build
pnpm check
```

Make a focused branch and explain the user-visible problem, resulting behavior, and verification. Run `pnpm format` before submitting. CI checks Node 20, 22, and 24 on Ubuntu. The current local implementation has been exercised under Ubuntu on WSL2 with Node 24; native Windows/macOS and agent-host integrations need their own evidence.

Keep package boundaries clear: knowledge owns validated data, core owns pure computation/parsing, CLI owns local I/O and exit behavior. Avoid executing repository content, shelling out from the audit, or adding network calls to core commands. Preserve deterministic outputs or bump versions explicitly. Never fix an impossible accessibility constraint by relaxing it silently.

Tests should verify meaningful invariants and user workflows. Include regression tests for bugs and constraint changes. Do not claim visual quality or benchmark gains from unit tests. See [the evaluation rubric](evals/README.md) for interface-level comparisons.

For knowledge contributions, follow [the extension guide](docs/extending-knowledge.md). Submit original prose or identify third-party sources and licensing. Font recommendations do not bundle fonts. A contextual pattern needs both acceptable uses and confidence limits.

Use GitHub issues for reproducible problems. For security-sensitive reports, avoid posting private repository content or credentials; contact the repository maintainer privately using their published profile contact. No hosted disclosure inbox is configured by this MVP.

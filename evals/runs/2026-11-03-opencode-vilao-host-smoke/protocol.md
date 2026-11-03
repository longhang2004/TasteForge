# Native OpenCode / Vilao — bounded UI host smoke

Frozen before UI generation, 2026-11-03. Branch: `codex/opencode-vilao-ui-smoke`, based on main `98e1ebb18c9eb7f14887b095c86c66e3009b130f`. Related: LON-95. This is a new evidence lane; previous frozen runs remain unchanged.

## Question and design

Can the user's newly configured native OpenCode/Vilao models load the released TasteForge skill and implement a small runnable UI with observable decision, validation and recovery states?

Two sequential availability probes precede one fresh UI per model: `vilao/chib/deepseek-v4.1-flash` and `vilao/mn/glm-5.3-flash`. Full IDs are as advertised by native OpenCode `2.2.5`; gateway labels do not independently verify upstream model identity. WSL OpenCode `1.19.3` uses a different config and does not advertise them. The native binary is required to reuse Desktop configuration/auth. Routine commands and parent browser checks use Ubuntu WSL2 Bash. No global configuration or credential copying is allowed.

Both creators receive identical frozen prompt, product fixture, original local schematic and project permissions. Install the exact released standalone ZIP under each isolated project's `.opencode/skills/tasteforge`. ZIP SHA-256: `c6d37cb585e6b02b4c9eb7c4eb36651b71422e404809a11c843c65ad76f94337`. Both explicitly invoke TasteForge. There is no unassisted condition and no model-inference seed guarantee. Use provider defaults; variant/billing normalization is unassessed.

The task reuses the maintained fictional Kiln Notes commerce fixture and original MIT-licensed schematic from `examples/composition-studies`; it is not held out. The prompt requests only a product decision/cart simulation, with accurate price/stock/terms, supported validation, first-attempt failure and recovery. No testimonials, product guarantees or remote assets may be invented. Creator tools are limited to read/skill/edit/glob/grep; shell/network/subagents are denied. Parent performs rendered acceptance; creator self-rendering is unassessed in this lane.

## Execution and stop rules

- Run only one OpenCode model at a time. Use native `run --standalone --model <exact-id> --format json`. No model fallback. Quota/auth/unavailable is evidence and ends that model's attempt.
- Retain raw stdout/stderr, exit status, elapsed wall time, tool traces and reported usage/cost fields. Protect credentials; no config/auth database is included. Advertised/reported zero cost is not verified billing.
- Preserve the first generated files before corrections. Test both initial UIs with the same task assertions and widths. Make at most one focused creator correction per model for concrete acceptance failures, then recheck changed behavior. Keep initial failures and correction evidence separately. Extend only for a named blocking uncertainty, recording why.
- Capture viewport and natural scroll/focus at 320/390/1440 widths, relevant validation, selection, failure and success states. Check keyboard reachability, overflow, browser errors and automated accessibility where installed tooling supports it. Do not reset focus/scroll before state captures to manufacture visibility.
- Independently assess task quality and product specificity as separate dimensions when outputs exist. One trial per model is an availability/host/task smoke, not a repository/model winner, human usability result, accessibility certification or general UI-quality gain.
- Measure generation, checking, correction and acceptance phases when observable; preserve unknowns for missing telemetry and human acceptance. No initial-token or partial timing savings claim. Human/manual tests remain deferred.

## Sources and reproduction boundary

The local executable's help is the version-specific CLI source. [OpenCode skill documentation](https://opencode.ai/docs/skills/) describes `.opencode/skills/<name>/SKILL.md` and native skill loading; actual discovery/invocation must be visible in this run's trace. [CLI documentation](https://opencode.ai/docs/cli/) describes CLI/JSON usage and environment controls, but its 1.x help differs from the installed 2.x executable. Do not silently mix command contracts.

Inputs, hashes, outputs, task evidence and final limitations belong to this run. No package release, npm publication, main merge, global installation or wider host certification is included.

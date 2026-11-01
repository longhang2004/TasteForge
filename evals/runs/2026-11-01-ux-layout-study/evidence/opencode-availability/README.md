# OpenCode free-model availability — 1 November 2026

OpenCode **1.19.3** is installed in Ubuntu WSL as a Linux ELF executable. `opencode models opencode` listed the requested `opencode/deepseek-v4.1-flash-free` and `opencode/glm-5.3-flash-free` IDs. The official [model catalog](https://opencode.ai/v2/docs/console/models/) also listed them as temporary free models when checked; listing does not establish usable quota.

The bounded probe called each exact free model with only “Reply exactly READY. Do not use tools.” It used `opencode run --pure --format json`, no tool permissions, disabled sharing/snapshots/LSP/formatters, isolated XDG directories, and no existing API key/token environment variables or credential files. No repository data was attached as a prompt and no paid model was selected. OpenCode did discover the containing Git project locally; `--pure` is not an OS-level isolation boundary. No model tool invocation or task implementation occurred.

Both `.log` files record the exact provider error **“Free usage limit reached”** after selecting the requested free model. They also record a separate background dependency-install warning (“Unsupported engine”); the primary inference rejection is the quota response. OpenCode emitted no JSON events to stdout and remained alive until the operator's 90-second timeout. Each `.json` records the real timeout/empty stdout and requested config. These are two failed availability attempts, not failed UI designs or measured model-quality outcomes.

No purchase, subscription, key setup, model substitution or repeated quota retry was performed. There are **zero OpenCode UI submissions** in the main twelve-case study. If quota/authentication becomes available later, create a separate dated host/model run with paired conditions; do not merge it silently into the original protocol or claim matched conditions across hosts.

The command logic is preserved in [probe-opencode.py](../../tools/probe-opencode.py). Re-running it overwrites availability records, so use a new run directory for future attempts.

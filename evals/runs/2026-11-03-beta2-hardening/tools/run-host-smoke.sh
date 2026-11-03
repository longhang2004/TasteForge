#!/usr/bin/env bash
# Reproduce the native Windows host invocation from Ubuntu WSL2, in a prepared disposable project.
set -euo pipefail
test "$#" -eq 3 || { printf 'Usage: %s PROJECT_LINUX NATIVE_CODEX_EXE NEW_EVIDENCE_DIR\n' "$0" >&2; exit 2; }
task_project=$(realpath "$1")
task_host=$(realpath "$2")
task_output=$3
test -f "$task_project/prompt.txt" && test -f "$task_project/.agents/skills/tasteforge/SKILL.md"
test -f "$task_host"
mkdir "$task_output"
task_project_windows=$(wslpath -w "$task_project")
date -u +%FT%TZ > "$task_output/started.txt"
set +e
timeout --signal=INT --kill-after=15s 720s "$task_host" exec \
  --ignore-user-config --ephemeral --approve-for-me --json --color never \
  --cd "$task_project_windows" --output-last-message "$task_project_windows/creator-summary.txt" - \
  < "$task_project/prompt.txt" > "$task_output/events.jsonl" 2> "$task_output/stderr.log"
task_result=$?
set -e
printf '%s\n' "$task_result" > "$task_output/exit-code.txt"
date -u +%FT%TZ > "$task_output/finished.txt"
exit "$task_result"

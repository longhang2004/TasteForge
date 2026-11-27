"""Bounded read-only AGY task over an explicitly public packet."""
import datetime
import hashlib
import json
import pathlib
import subprocess
import sys
import time

packet, prompt, output = map(pathlib.Path, sys.argv[1:4])
model = sys.argv[4] if len(sys.argv) > 4 else "gemini-3.8-flash-high"
effort = None if model.startswith("claude-") else "high"
output.mkdir(parents=True, exist_ok=False)
binary = "/mnt/c/Users/hi/AppData/Local/agy/bin/agy.exe"
version = subprocess.check_output([binary, "--version"], text=True).strip()
win_root = subprocess.check_output(["wslpath", "-w", str(packet.resolve())], text=True).strip()
settings = {"permissions": {"allow": [f"read_file({win_root})"], "deny": ["command(*)", "write_file(*)"]}}
record = {"startedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "cliVersion": version, "host": "Windows AGY through Ubuntu WSL", "requestedModel": model, "effort": effort, "settings": settings, "prompt": prompt.read_text(), "packet": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(packet.iterdir()) if p.is_file()}, "budget": {"printTimeoutSeconds": 600, "operatorTimeoutSeconds": 625}}
(output / "invocation.json").write_text(json.dumps(record, indent=2) + "\n")
args = [binary, "--model", model] + (["--effort", effort] if effort else []) + ["--output-format", "json", "--disable-slash-commands", "--print-timeout", "600s", "--settings", json.dumps(settings), "-p", prompt.read_text()]
started = time.monotonic()
try:
    with (output / "stdout.json").open("w") as stdout, (output / "stderr.txt").open("w") as stderr:
        result = subprocess.run(args, cwd=packet, stdout=stdout, stderr=stderr, text=True, timeout=625)
    record["exitCode"] = result.returncode
except subprocess.TimeoutExpired:
    record["exitCode"] = "operator-timeout"
record["finishedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
record["elapsedSeconds"] = round(time.monotonic() - started, 3)
try:
    response = json.loads((output / "stdout.json").read_text())
    for key in ["status", "usage", "duration_seconds", "num_turns", "conversation_id"]:
        record[key] = response.get(key)
    (output / "response.md").write_text(response.get("response", "") + "\n")
except (ValueError, OSError):
    record["usage"] = None
(output / "invocation.json").write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps({key: record.get(key) for key in ["exitCode", "status", "elapsedSeconds", "usage"]}))

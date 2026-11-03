"""Report observed intervals, not inferred tokens, active effort or savings."""
from pathlib import Path
from datetime import datetime
import json

run = Path(__file__).resolve().parents[1]
load = lambda p: json.loads(p.read_text())
acceptance = load(run / "acceptance.json")
manifest = load(run / "manifest.json")
seconds = lambda a, b: round((datetime.fromisoformat(b.replace("Z", "+00:00")) - datetime.fromisoformat(a.replace("Z", "+00:00"))).total_seconds(), 3)
rows = []
for cell, accepted in acceptance.items():
    record_path = f"cells/{cell}/{accepted['stage']}/creator-record.json"
    record = load(run / record_path)
    start = next(record[k] for k in ["utcStart", "startedUTC", "startedAtUtc", "utc_start"] if k in record)
    end = next(record[k] for k in ["utcEnd", "endedUTC", "finishedAtUtc", "utc_end"] if k in record)
    interrupted = cell in ["fold-2", "relay-1"]
    passes = []
    for file in sorted((run / "evidence" / cell).glob("*/report.json")):
        report = load(file)
        if "finishedAt" not in report or "startedAt" not in report:
            continue
        passes.append({"file": str(file.relative_to(run)), "startedAt": report["startedAt"], "finishedAt": report["finishedAt"], "wallSeconds": seconds(report["startedAt"], report["finishedAt"]), "acceptedPass": str(file.relative_to(run)) == accepted["report"], "rawFindingCount": len(report.get("failures", [])), "invalidInvocation": cell == "relay-1" and report.get("stage") == "initial"})
    rows.append({"cell": cell, "arm": manifest["cells"][cell]["arm"], "creatorRecord": record_path, "creatorStart": start, "creatorEnd": end, "creatorObservedWallSeconds": seconds(start, end), "providerInterrupted": interrupted, "activeCreatorSeconds": None, "activeCreatorBasis": "Unknown exact quota onset; full observed wall span includes unavailable time." if interrupted else "Wall span includes input reads, implementation, self-check/correction and documentation; not measured active inference or labor.", "interruption": record.get("interruption", record.get("availability")), "creatorCorrectionCount": accepted["creatorCorrections"], "operatorCorrectionCount": accepted["operatorCorrections"], "rootPasses": passes, "acceptedRootCheckSeconds": next(p["wallSeconds"] for p in passes if p["acceptedPass"]), "creationToScopedAutomationWallSeconds": seconds(start, next(p["finishedAt"] for p in passes if p["acceptedPass"])), "cycleBasis": "Includes operator queue/outage and overlapping work. Ends at scoped automation, before independent review/publication. Not full acceptance cost.", "provider": None, "resolvedModel": None, "inputTokens": None, "outputTokens": None, "thinkingTokens": None, "cacheTokens": None, "billing": None, "totalToolCount": None, "completeOperatorSeconds": None, "completeAcceptanceCost": None})

out = {"basis": "Observed UTC boundaries in preserved creator records and root reports. No sum of overlapping cell spans; no cost ranking.", "cells": rows, "entryWordCounts": {k: v["entryWords"] for k, v in manifest["arms"].items()}, "entryWordCountCaveat": "Static words only; not actual loaded tokens, usage, billing or end-to-end savings.", "invalidAndSharedWork": ["Shared bundle/runtime/assets/fixtures/preflight and gallery/operator work have incomplete timing/usage coverage.", "fold-1 invalid intake attempt retained separately and unscored; relay-1 network-backed native seed attempt retained separately and unscored.", "Persistent-workspace amendment, provider quota interruption, harness corrections, exact-pricing probe, and final publication checks are additional work, not free/omitted UI failures.", "Impeccable native default orchestration/online catalog are outside this constrained offline lane; availability departure is not charged as a quality failure."], "resourceComparison": "Unknown full creation-to-acceptance resource cost. No monetary/token/efficiency winner.", "reviewResources": "Reviewer start/end and inspected files live in frozen review records; complete evaluator/operator telemetry remains unknown."}
(run / "resources.json").write_text(json.dumps(out, indent=2) + "\n")
lines = ["# Observed resources", "", "These are observed wall intervals, including reading, creation, self-check, correction and documentation. They are not active inference/labor durations. The two interrupted cells retain their full wall span; exact quota onset is unknown. No total is obtained by summing overlapping cells.", "", "| Cell / arm | Creator wall seconds | Provider interruption | Creator / operator corrections | Accepted root check seconds |", "| --- | ---: | --- | --- | ---: |"]
for row in rows:
    lines.append(f"| [{row['cell']}]({row['creatorRecord']}) / {row['arm']} | {row['creatorObservedWallSeconds']:.1f} | {'Yes; active duration unknown' if row['providerInterrupted'] else 'None recorded'} | {row['creatorCorrectionCount']} / {row['operatorCorrectionCount']} | {row['acceptedRootCheckSeconds']:.1f} |")
lines += ["", "The six uninterrupted creator spans are approximately 6.4–8.1 minutes. Root accepted-pass runs take 33.9–50.4 seconds each; these exclude earlier passes and all operator analysis. Original root passes, invalid setup work and corrections remain in [resources.json](resources.json).", "", "Provider/resolved model identifiers, input/output/thinking/cache tokens, billing, complete tool counts, active creator time, complete operator/evaluator time and full accepted-cycle cost are unknown. The same inherited host/model setting was requested, without override; exact backend identity was not exposed. Static entry word counts (TasteForge 593, ProMax 2118, Elaya 3742, Impeccable 1585) measure document size only. They establish neither consumed tokens nor end-to-end savings.", "", "Shared preparation, failed invocations, provider interruption, native-tool fidelity departures, harness repair, review and publication are part of the workflow. Their incomplete telemetry prevents a complete resource comparison. The quota gap is not attributed to a repository. No paid fallback was used. See [protocol amendments](protocol-amendment-03.md) and the frozen reviewer records for their observed boundaries.", ""]
(run / "resources.md").write_text("\n".join(lines))
print("Resource coverage written for", len(rows), "cells; full cost remains unknown")

"""Summarize exposed segments without inventing provider or full-cycle totals."""
from pathlib import Path
from datetime import datetime
import json

run = Path(__file__).resolve().parents[1]
acceptance = json.loads((run / "acceptance.json").read_text())
manifest = json.loads((run / "manifest.json").read_text())
def first(data, *keys):
    return next((data[k] for k in keys if k in data), None)
def dt(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
result = {"cells": {}, "coverage": {
    "meaning": "Observed segments only; start bases differ and some begin after input reads/launch. Not billed costs or comparable complete-cycle savings.",
    "initial": "First preserved runnable version timestamp minus first observed creator clock; may exclude earlier work.",
    "creator": "Observed creator interval includes self-check/corrections; no provider token telemetry.",
    "operator": "Each report measures browser/check segment, excluding harness authoring, launcher overhead and evaluator queue/review/finalization.",
    "unknown": ["exact resolved model/provider version", "input/output/thinking/cache tokens", "billed money", "complete operator/evaluator tool/token totals", "complete accepted-UI cost and savings"],
    "overlap": "Cells overlap; do not sum wall intervals as total elapsed time.",
    "loss": "listen-B creator first auxiliary check report was overwritten and reconstructed/transcribed; it is not preserved raw evidence. Original00 HTML remains immutable; root matched acceptance is independent fresh evidence.",
    "human": "Human/manual tests deferred."}}
for cell, accepted in acceptance.items():
    record = json.loads((run / "cells" / cell / "initial/creator-record.json").read_text())
    start = first(record, "start_utc", "startUTC")
    end = first(record, "end_utc", "endUTC")
    paths = first(record, "loaded_paths", "actual_loaded_paths", "actualLoadedPaths") or []
    versions = record["versions"]
    timestamp = first(versions[0], "preserved_utc", "utc", "preservedUTC")
    loaded_words = {}
    for file in paths:
        if file.endswith(".md") and "/resources/" in file:
            resource = Path(__file__).resolve().parents[4] / file
            loaded_words[file] = len(resource.read_text().split())
    reports = []
    for file in sorted((run / "evidence" / cell).glob("*/report.json")):
        report = json.loads(file.read_text())
        reports.append({"report": str(file.relative_to(run)), "startedAt": report["startedAt"], "finishedAt": report["finishedAt"],
                        "seconds": (dt(report["finishedAt"]) - dt(report["startedAt"])).total_seconds(), "checks": report["checks"], "failures": report["failures"]})
    result["cells"][cell] = {"condition": manifest["conditionKey"][cell], "creatorObservedStart": start, "creatorObservedEnd": end,
        "creatorStartBasis": first(record, "start_utc_basis", "start_basis", "timingScope"),
        "creatorObservedSeconds": (dt(end) - dt(start)).total_seconds(),
        "firstArtifactObservedSeconds": (dt(timestamp) - dt(start)).total_seconds(),
        "creatorVersions": versions, "creatorUiCorrections": len(versions) - 1,
        "loadedSkillWordProxies": loaded_words, "loadedSkillWords": sum(loaded_words.values()),
        "operatorBrowserSegments": reports, "operatorUiCorrections": accepted["operatorUiCorrections"],
        "providerInputTokens": None, "providerOutputTokens": None, "providerThinkingTokens": None,
        "providerCacheTokens": None, "billedCost": None, "completeAcceptanceCycleCost": None,
        "creatorToolCalls": first(record, "tool_call_count", "toolCallCount")}
(run / "resources.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({cell: {k: row[k] for k in ["creatorObservedSeconds", "firstArtifactObservedSeconds", "creatorUiCorrections", "loadedSkillWords"]} for cell, row in result["cells"].items()}, indent=2))

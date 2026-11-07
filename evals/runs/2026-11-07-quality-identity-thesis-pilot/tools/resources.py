"""Summarize observed segments without inventing provider or full-cycle totals.

Every number written here is either read from a preserved record or computed from
two observed timestamps. Nothing is estimated, extrapolated or converted from word
counts into tokens.
"""

import json
from datetime import datetime
from pathlib import Path

run = Path(__file__).resolve().parents[1]
# Locate the repository by a marker instead of counting parents: the run lives at
# <repo>/evals/runs/<run>, and a miscounted parent silently resolved every skill
# path to nothing.
repository = next(parent for parent in run.parents if (parent / "docs").is_dir())
assert repository.name == "TasteForge", f"unexpected repository root: {repository}"
acceptance = json.loads((run / "acceptance.json").read_text())
manifest = json.loads((run / "manifest.json").read_text())


def first(data, *keys):
    """First present, non-null value among keys (records use both snake and camel case)."""
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return None


def dt(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


result = {
    "cells": {},
    "coverage": {
        "meaning": "Observed segments only. Start bases differ and some creator clocks begin after initial reading or launch work. These are not billed costs and not comparable complete-cycle savings.",
        "initial": "First preserved runnable version timestamp minus the first observed creator clock; earlier work may be excluded.",
        "creator": "Observed creator interval, including self-checks and any disclosed correction.",
        "operator": "Each entry is one browser/check segment only; it excludes harness authoring, launcher overhead, evaluator queue time and review/finalization.",
        "unknown": [
            "exact resolved model/provider version and parameter count",
            "input, output, thinking, cache-read and cache-write tokens",
            "billed money for any cell",
            "complete operator/evaluator tool and token totals",
            "complete accepted-UI cost and any end-to-end saving",
        ],
        "overlap": "Cells ran across overlapping wall-clock windows; do not sum the intervals as total elapsed time.",
        "budget": "Protocol declares a soft 8-minute and hard 15-minute creator budget per cell; recorded overruns are reported as overruns, not trimmed.",
        "human": "Human/manual tests deferred; no screen-reader or real-device session was run.",
    },
}

for cell, accepted in acceptance.items():
    base = run / "cells" / cell / "initial"
    record = json.loads((base / "creator-record.json").read_text())
    start = first(record, "start_utc", "startUTC")
    end = first(record, "end_utc", "endUTC")
    paths = (
        first(record, "loaded_skill_paths", "loadedSkillPaths", "actual_loaded_paths") or []
    )
    versions = record.get("versions", [])
    preserved = first(versions[0], "preserved_utc", "saved_utc", "utc") if versions else None

    # Word proxies: words actually present in the skill files this creator opened.
    # These are words, NOT tokens, and never a saving.
    loaded_words = {}
    for relative in paths:
        if not relative.endswith(".md"):
            continue
        # Records store repo-relative paths with forward slashes; normalise so the
        # lookup works on any platform instead of silently counting nothing.
        candidate = repository.joinpath(*relative.replace("\\", "/").split("/"))
        if candidate.exists():
            loaded_words[relative] = len(candidate.read_text(encoding="utf-8").split())
        else:
            loaded_words[relative] = None  # Not resolvable: reported, not guessed.

    segments = []
    for report_path in sorted((run / "evidence" / cell).glob("*/report.json")):
        report = json.loads(report_path.read_text())
        segments.append(
            {
                "report": str(report_path.relative_to(run)),
                "startedAt": report["startedAt"],
                "finishedAt": report["finishedAt"],
                "seconds": (dt(report["finishedAt"]) - dt(report["startedAt"])).total_seconds(),
                "checks": report["checks"],
                "failures": report["failures"],
            }
        )

    wall = (
        (dt(end) - dt(start)).total_seconds() if start and end else None
    )
    result["cells"][cell] = {
        "condition": manifest["conditionKey"][cell],
        "creatorObservedStart": start,
        "creatorObservedEnd": end,
        "creatorObservedSeconds": wall,
        "creatorObservedMinutes": round(wall / 60, 1) if wall is not None else None,
        "creatorBudgetStatus": (
            "unknown"
            if wall is None
            else "within soft budget"
            if wall <= 8 * 60
            else "over soft, within hard budget"
            if wall <= 15 * 60
            else "over hard budget"
        ),
        "firstArtifactObservedSeconds": (
            (dt(preserved) - dt(start)).total_seconds() if preserved and start else None
        ),
        "creatorVersions": versions,
        "creatorCorrections": max(0, len(versions) - 1),
        "operatorUiCorrections": accepted["operatorUiCorrections"],
        "loadedSkillPaths": paths,
        "loadedSkillWordProxies": loaded_words,
        # Sum only resolved files; unresolved paths stay visible as null above.
        "loadedSkillWords": sum(
            words for words in loaded_words.values() if isinstance(words, int)
        ),
        "loadedSkillWordsUnresolved": [
            path for path, words in loaded_words.items() if words is None
        ],
        "operatorBrowserSegments": segments,
        "acceptanceChecks": accepted["checks"],
        "acceptanceStates": accepted["states"],
        "axeViolations": accepted["axeViolations"],
        "axeIncomplete": accepted["axeIncomplete"],
        "providerInputTokens": None,
        "providerOutputTokens": None,
        "providerThinkingTokens": None,
        "providerCacheTokens": None,
        "billedCost": None,
        "completeAcceptanceCycleCost": None,
        "creatorToolCalls": first(record, "tool_calls", "toolCalls"),
    }

(run / "resources.json").write_text(json.dumps(result, indent=2) + "\n")
print(
    json.dumps(
        {
            cell: {
                key: row[key]
                for key in (
                    "creatorObservedMinutes",
                    "creatorBudgetStatus",
                    "firstArtifactObservedSeconds",
                    "creatorCorrections",
                    "loadedSkillWords",
                    "acceptanceChecks",
                )
            }
            for cell, row in result["cells"].items()
        },
        indent=2,
    )
)

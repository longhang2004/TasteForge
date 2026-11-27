"""Create a condition-blinded review packet without changing frozen outputs."""
from pathlib import Path
import datetime
import hashlib
import json
import random
import shutil

run = Path(__file__).resolve().parents[1]
packet = run / "review-packet"
assert not packet.exists(), "Preserve the existing packet and condition key"
packet.mkdir()
key = {}
for task in ["proofdesk", "cabinet"]:
    folder = packet / task
    folder.mkdir()
    prompt = (run / "inputs" / task / "PROMPT.md").read_text().split("\n\n", 1)[0]
    (folder / "task.md").write_text(prompt + "\n")
    shutil.copyfile(run / "inputs" / task / "fixture.json", folder / "fixture.json")
    conditions = ["baseline", "candidate"]
    random.SystemRandom().shuffle(conditions)
    key[task] = {}
    for label, condition in zip(["A", "B"], conditions):
        key[task][label] = condition
        cell = task + "-" + condition
        dest = folder / label
        dest.mkdir()
        source = run / "outputs" / cell / "corrected" / "index.html"
        shutil.copyfile(source, dest / "source.html")
        evidence = run / "evidence" / cell / "corrected" / "matched-v3"
        report = json.loads((evidence / "report.json").read_text())
        assert report["summary"]["failed"] == 0 and report["summary"]["harnessErrors"] == 0
        for capture in report["captures"]:
            shutil.copyfile(evidence / capture["file"], dest / capture["file"])
        anonymous = {name: report[name] for name in ["browser", "summary", "checks", "captures", "axe", "pageErrors", "remoteRequests"]}
        (dest / "checks.json").write_text(json.dumps(anonymous, indent=2) + "\n")
hashes = {str(p.relative_to(packet)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(packet.rglob("*")) if p.is_file()}
(packet / "hashes.json").write_text(json.dumps(hashes, indent=2) + "\n")
(run / "review-key.json").write_text(json.dumps({"createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "mapping": key, "scope": "Randomized labels; sources may still reveal stylistic cues. Key excluded from reviewer read roots."}, indent=2) + "\n")
print(json.dumps({"files": len(hashes), "packet": str(packet), "key": "stored outside reviewer read root"}))

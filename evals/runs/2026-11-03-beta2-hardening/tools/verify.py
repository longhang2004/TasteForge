from pathlib import Path
import hashlib, json, re, zipfile

run = Path(__file__).resolve().parents[1]
repo = run.parents[2]
load = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
source = load(run / "source-manifest.json")
host = load(run / "host-smoke/result.json")
archive = run / "host-smoke/tasteforge-skill-v0.2.0-beta.2.zip"
assert sha(archive) == source["archiveSha256"]
with zipfile.ZipFile(archive) as z:
    assert len(z.namelist()) == len(source["installedFileHashes"]) == 24
    for name, expected in source["installedFileHashes"].items():
        assert hashlib.sha256(z.read(name)).hexdigest() == expected
    for file in (repo / "skills/tasteforge").rglob("*"):
        if file.is_file():
            assert z.read("tasteforge/" + file.relative_to(repo / "skills/tasteforge").as_posix()) == file.read_bytes()
    assert z.read("tasteforge/LICENSE") == (repo / "LICENSE").read_bytes()
after = run / "cells/fold-3/after"
creator = load(after / "creator-record.json")
assert sha(after / "versions/00.html") == sha(run / "cells/fold-3/before/index.html") == source["originalSourceSha256"]
assert sha(after / "index.html") == sha(after / "versions/01.html") == creator["sourceHashes"]["corrected_index_and_versions_01"]
assert host["exitCode"] == 0 and host["terminalCommandCount"] == 7 and not host["globalSettingsChanged"]
assert int((run / "host-smoke/invalid-invocation-01/exit-code.txt").read_text()) == 2
report = load(run / "evidence/fold-3/followup-01/report.json")
assert not report["failures"] and report["checkCount"] == 51 and report["stateCount"] == 19
assert sha(after / "index.html") == report["sourceSha256"]
assert all(not s["violations"] and s["geometry"]["status"] == "pass" for t in report["traces"] for s in t["states"])
probe = load(run / "evidence/pricing-probe-01/report.json")
assert not probe["failures"] and len(probe["observations"]) == 6
assert sum(x["expectedKnownBaselineFinding"] for x in probe["observations"]) == 3
for file in [run / "README.md", repo / "docs/host-integration.md", repo / "docs/releases/v0.2.0-beta.2.md"]:
    for target in re.findall(r"\]\(([^)]+)\)", file.read_text()):
        if not target.startswith(("http:", "https:", "#")):
            assert (file.parent / target.split("#")[0]).exists(), (file, target)
print(json.dumps({"result": "pass", "installedSkillFiles": 24, "hostExitCode": 0, "browserAssertions": 51, "stateCaptures": 19, "priceObservations": 6, "knownOriginalPriceFindings": 3, "originalFrozenSourcePreserved": True}))

"""Record coordinator-observed subagent completion without inventing runtime."""
from pathlib import Path
import argparse,json,datetime,hashlib
p=argparse.ArgumentParser();p.add_argument("case");p.add_argument("agent");p.add_argument("model");p.add_argument("--running",action="store_true");a=p.parse_args()
run=Path(__file__).resolve().parents[1];case=run/"cases"/a.case;out=run/"evidence"/a.case;out.mkdir(exist_ok=True)
manifestPath=run/"manifest.json";m=json.loads(manifestPath.read_text());c=next(x for x in m["cases"] if x["id"]==a.case)
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
assignment={"case":a.case,"requestedModel":a.model,"reasoningEffort":"high","agentTask":a.agent,"recordedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"isolation":"fork_turns=none, case-only prompt; no counterpart/other study reads authorized","timingNote":"Coordinator metadata recorded after dispatch; exact backend snapshot, runtime, tokens and inference seed not exposed. Soft budget only."}
if a.running:
 if not (out/"agent-assignment.json").exists():(out/"agent-assignment.json").write_text(json.dumps(assignment,indent=2)+"\n")
 c["generation"]="running"
else:
 target=out/"generation.json"
 if target.exists():raise RuntimeError("Preserve existing completion record")
 files={name:{"exists":(case/name).exists(),"bytes":(case/name).stat().st_size if (case/name).exists() else 0} for name in ["index.html","styles.css","app.js","implementation-notes.md"]}
 immutable=sha(case/"task.md")==c["taskSha256"] and sha(case/"fixture.json")==c["fixtureSha256"]
 submitted=all(v["exists"] and v["bytes"] for v in files.values()) and immutable
 c["generation"]="submitted" if submitted else "failed-or-incomplete"
 record={**assignment,"generation":c["generation"],"files":files,"taskFixtureUnchanged":immutable,"creatorFinalResponse":"creator-final.txt","toolTranscript":"Not exported by collaboration API; final response, authored notes, previews and actual CLI evidence retained. Self-reported checks are not operator test results."}
 target.write_text(json.dumps(record,indent=2)+"\n")
manifestPath.write_text(json.dumps(m,indent=2)+"\n")
print(json.dumps({"case":a.case,"generation":c["generation"]}))

"""Build gallery/acceptance from actual passing reports; no raw mutation."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil

run=Path(__file__).resolve().parents[1]
manifest=json.loads((run/"manifest.json").read_text())
names={"tasteforge":"TasteForge","promax":"UI/UX Pro Max","elaya":"Elaya landing-page-design","impeccable":"Impeccable · offline constrained"}
choices={"fold-1":("initial","initial-01"),"fold-2":("final","final-01"),"fold-3":("initial","initial-01"),"fold-4":("initial","initial-01"),"relay-1":("initial-valid","valid-01"),"relay-2":("initial","initial-02"),"relay-3":("initial","initial-02"),"relay-4":("initial","initial-01")}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
accepted={};cells=[]
for cell in sorted(manifest["cells"]):
    m=manifest["cells"][cell];stage,passname=choices[cell]
    row={"id":cell,"name":names[m["arm"]],"arm":m["arm"],"task":m["task"],"pending":True,"status":"Creator/checks pending","stage":stage,"corrections":"","images":[]}
    file=run/"evidence"/cell/passname/"report.json"
    if file.exists():
        report=json.loads(file.read_text())
        if report["failures"]:
            row["status"]=f"Known checks unresolved: {len(report['failures'])} findings (raw retained)"
        else:
            source=run/"cells"/cell/stage
            assert sha(source/"index.html")==report["sourceSha256"]
            final=run/"cells"/cell/"final"
            if not final.exists():shutil.copytree(source,final)
            assert sha(final/"index.html")==report["sourceSha256"]
            creator=json.loads((source/"creator-record.json").read_text())
            versions=creator.get("versions",[])
            self_corrections=max(0,len(list((source/"versions").glob("*.html")))-1)
            for version in versions:
                expected=version.get("sha256") or version.get("hash")
                relative=version.get("path") or version.get("file")
                if relative and expected:assert sha(source/relative)==expected,(cell,relative)
            operator=int((run/"cells"/cell/"operator-correction.json").exists())
            accepted[cell]={"stage":stage,"report":str(file.relative_to(run)),"sourceSha256":report["sourceSha256"],"checks":report["checkCount"],"states":report["stateCount"],"creatorCorrections":self_corrections,"operatorCorrections":operator}
            row.update({"pending":False,"status":f"Scoped automation passed: {report['checkCount']} assertions / {report['stateCount']} states; independent review separate","report":str(file.relative_to(run)),"corrections":f"Creator corrections {self_corrections}; operator corrections {operator}"})
            for trace in report["traces"]:
                for state in trace["states"]:
                    row["images"].append({"state":state["label"],"width":trace["width"],"reduced":"reduced" in trace["id"],"file":state["viewport"],"scrollY":state["scroll"]["y"],"focus":state["focus"].get("id") or state["focus"].get("tag")})
    cells.append(row)
(run/"acceptance.json").write_text(json.dumps(accepted,indent=2)+"\n")
(run/"results.json").write_text(json.dumps({"updatedAt":datetime.now(timezone.utc).isoformat(),"summary":f"{len(accepted)}/8 valid cells have scoped automated acceptance. Independent judgments/limits in report; no universal winner or human-usability claim.","cells":cells},indent=2)+"\n")
print(len(accepted),"accepted;",sum(v["checks"] for v in accepted.values()),"checks;",sum(v["states"] for v in accepted.values()),"states")

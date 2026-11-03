"""Freeze identical anonymized packet after all eight scoped acceptances."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,secrets,shutil

run=Path(__file__).resolve().parents[1]
accepted=json.loads((run/"acceptance.json").read_text());assert len(accepted)==8
packet=run/"review-packet";packet.mkdir()
shutil.copyfile(run/"reviewer-instructions.md",packet/"reviewer-instructions.md")
index={"createdAt":datetime.now(timezone.utc).isoformat(),"scope":"Final scoped accepted UIs, normal natural viewports, no creator/treatment notes","cases":{}}
key={}
for case,prefix in [("field-fold","fold"),("relay-notes","relay")]:
    folder=packet/case;folder.mkdir();shutil.copyfile(run/"prompts"/(case+".md"),folder/"task.md")
    cells=[f"{prefix}-{i}" for i in range(1,5)];secrets.SystemRandom().shuffle(cells)
    index["cases"][case]={"task":f"{case}/task.md","variants":{}};key[case]={}
    for label,cell in zip("ABCD",cells):
        key[case][label]=cell;dest=folder/label;dest.mkdir()
        shutil.copyfile(run/"cells"/cell/"final/index.html",dest/"index.html")
        shutil.copytree(run/"common",dest/"common")
        report=json.loads((run/accepted[cell]["report"]).read_text())
        assert not report["failures"]
        sanitized={"scope":report["scope"],"checks":report["checkCount"],"states":report["stateCount"],"failures":[],"traces":[]};images=[]
        for trace in report["traces"]:
            row={"width":trace["width"],"reduced":"reduced" in trace["id"],"checks":trace["checks"],"states":[]}
            for state in trace["states"]:
                filename=f"{trace['id']}-{state['label']}.png"
                shutil.copyfile(run/state["viewport"],dest/filename)
                images.append({"width":trace["width"],"state":state["label"],"reduced":row["reduced"],"file":f"{case}/{label}/{filename}"})
                full=(run/state["viewport"]).parent/"full-page.png"
                if full.exists():
                    full_name=f"{trace['id']}-{state['label']}-full-page.png";shutil.copyfile(full,dest/full_name)
                    images.append({"width":trace["width"],"state":state["label"]+"-full-page","reduced":False,"scope":"Optional full page, not natural post-action visibility","file":f"{case}/{label}/{full_name}"})
                row["states"].append({k:state[k] for k in ["label","geometry","scroll","focus","violations","incomplete"]})
            sanitized["traces"].append(row)
        (dest/"checks.json").write_text(json.dumps(sanitized,indent=2)+"\n")
        index["cases"][case]["variants"][label]={"source":f"{case}/{label}/index.html","checks":f"{case}/{label}/checks.json","images":images}
(packet/"index.json").write_text(json.dumps(index,indent=2)+"\n")
hashes={str(p.relative_to(packet)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(packet.rglob("*")) if p.is_file()}
(packet/"hashes.json").write_text(json.dumps(hashes,indent=2)+"\n")
(run/"review-key.json").write_text(json.dumps({"createdAt":index["createdAt"],"key":key},indent=2)+"\n")
(run/"reviews").mkdir()
print("Randomized packet frozen",len(hashes),"files; key withheld; SHA",hashlib.sha256((packet/"hashes.json").read_bytes()).hexdigest())

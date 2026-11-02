"""Fresh checks write new evidence; old reports remain immutable."""
from pathlib import Path
import subprocess,json,datetime,time,shutil
root=Path(__file__).resolve().parents[4]
run=root/"evals/runs/2026-11-02-current-skill-automation"
out=run/"evidence/regressions";out.mkdir(parents=True,exist_ok=True)
tasks=[("workspace",["pnpm","check"],root,None)]
for name in ["inventory-workbench","effects-lab","design-gallery"]:
 tasks.append((name,["node","tools/check.mjs","evidence/2026-11-02-current-skill-automation"],root/"examples"/name,root/"examples"/name/"evidence/2026-11-02-current-skill-automation"))
for name,args,cwd,generated in tasks:
 log=out/(name+".log");meta=out/(name+".json")
 if log.exists() or meta.exists():raise RuntimeError("Do not replace prior verification "+name)
 if generated and generated.exists():raise RuntimeError("Do not replace prior browser pass")
 start=time.monotonic();started=datetime.datetime.now(datetime.timezone.utc).isoformat()
 print(json.dumps({"test":name,"event":"starting"}),flush=True)
 with log.open("w") as f:
  p=subprocess.Popen(args,cwd=cwd,stdout=f,stderr=subprocess.STDOUT)
  try:code=p.wait(timeout=900)
  except subprocess.TimeoutExpired:
   p.terminate();code="operator-timeout-900s"
   try:p.wait(timeout=10)
   except subprocess.TimeoutExpired:p.kill();p.wait()
 record={"test":name,"command":args,"cwd":str(cwd),"startedAtUtc":started,"durationSeconds":round(time.monotonic()-start,3),"exitCode":code,"userTesting":"not performed"}
 if generated and generated.exists():
  destination=out/name
  assert generated.resolve().is_relative_to((root/"examples"/name/"evidence").resolve())
  assert not destination.exists()
  shutil.move(str(generated),str(destination))
  record["evidenceDirectory"]=str(destination.relative_to(run))
 meta.write_text(json.dumps(record,indent=2)+"\n")
 print(json.dumps(record),flush=True)

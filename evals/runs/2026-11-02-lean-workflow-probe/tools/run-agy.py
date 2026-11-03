"""Launch the two authorized native AGY cases, sequentially; no global changes."""
from pathlib import Path
import datetime, hashlib, json, subprocess, time
run=Path(__file__).resolve().parent.parent
manifest=json.loads((run/"manifest.json").read_text())
assert manifest["generationReady"],"Freeze final skill/helper inputs first"
binary="/mnt/c/Users/hi/AppData/Local/agy/bin/agy.exe"
win="C:/Users/hi/src/personal_repos/TasteForge/evals/runs/"+run.name
def strings(value):
 if isinstance(value,str):yield value
 elif isinstance(value,dict):
  for item in value.values():yield from strings(item)
 elif isinstance(value,list):
  for item in value:yield from strings(item)
for cid in ["l03","l04"]:
 entry=next(c for c in manifest["cases"] if c["id"]==cid)
 case=run/"cases"/cid;out=run/"evidence"/cid;out.mkdir(parents=True,exist_ok=True)
 assert not (out/"generation.json").exists() and not (out/"cli-events.ndjson").exists(),"Never overwrite a generation attempt"
 condition=entry["condition"];other="lean" if condition=="old" else "old"
 prefix="command(regex:wsl\\.exe --distribution Ubuntu --cd "+str(case)+" --exec bash -lc .*)"
 permissions={"allow":["read_file("+win+"/cases/"+cid+")","write_file("+win+"/cases/"+cid+")",prefix,"read_file("+win+"/treatment/"+condition+"/tasteforge)"],"deny":["read_url(*)","execute_url(*)","mcp(*)","write_file("+win+"/cases/"+cid+"/task.md)","write_file("+win+"/cases/"+cid+"/fixture.json)","read_file("+win+"/treatment/"+other+")","read_file("+win+"/shared/check-ui.mjs)"]}
 for cell in manifest["cases"]:
  if cell["id"]!=cid:permissions["deny"].append("read_file("+win+"/cases/"+cell["id"]+")")
 settings=run/"tools"/(cid+"-agy-settings.json");settings.write_text(json.dumps({"permissions":permissions},indent=2)+"\n")
 prompt=(run/"tools"/(cid+"-prompt.txt")).read_text()
 command=[binary,"--new-project","--model",entry["model"],"--effort","medium","--mode","accept-edits","--disable-slash-commands","--settings",win+"/tools/"+settings.name,"--output-format","stream-json","--print-timeout","12m","-p",prompt]
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();clock=time.monotonic()
 print(json.dumps({"case":cid,"condition":condition,"status":"starting","startedAtUtc":started}),flush=True)
 with (out/"cli-events.ndjson").open("w") as stdout,(out/"cli-stderr.txt").open("w") as stderr:
  process=subprocess.Popen(command,cwd=case,stdout=stdout,stderr=stderr,stdin=subprocess.DEVNULL)
  try:code=process.wait(timeout=780)
  except subprocess.TimeoutExpired:
   process.terminate();code="operator-timeout-780s"
   try:process.wait(timeout=12)
   except subprocess.TimeoutExpired:process.kill();process.wait()
 events=[]
 for line in (out/"cli-events.ndjson").read_text(errors="replace").splitlines():
  try:events.append(json.loads(line))
  except json.JSONDecodeError:pass
 final=next((e.get("result") for e in reversed(events) if e.get("event")=="result"),None)
 files={name:{"exists":(case/name).exists(),"bytes":(case/name).stat().st_size if (case/name).exists() else 0} for name in ["index.html","styles.css","app.js","implementation-notes.md"]}
 implemented=all(f["exists"] and f["bytes"]>0 for f in files.values())
 denied=final.get("denied_actions",[]) if final else []
 submitted=code==0 and final and final.get("status")=="SUCCESS" and implemented and not denied
 tools={}
 for e in events:
  s=e.get("step_update",{})
  if s.get("step_type")=="tool":tools[s.get("step_index")]=s
 reads=set();commands=[]
 marker="/treatment/"+condition+"/tasteforge/"
 for item in tools.values():
  params=item.get("tool_info",{}).get("parameters",{})
  if item.get("tool_name")=="read_file":
   for value in strings(params):
    value=value.replace("\\","/")
    if marker in value:reads.add(value.split(marker,1)[1])
  if item.get("tool_name")=="run_command":commands.extend(strings(params))
 telemetry={"uniqueNativeToolSteps":len(tools),"observedReadFileSkillResources":sorted(reads),"readFileCoverage":"Native read_file parameter observations only; not an exhaustive loaded-context/token measure.","previewCommandMentions":sum("preview.mjs" in s for s in commands)}
 record={"case":cid,"condition":condition,"host":"Antigravity CLI Windows1.4.12 existing official login","requestedModel":entry["model"],"effort":"medium","command":command,"startedAtUtc":started,"finishedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"durationSeconds":round(time.monotonic()-clock,3),"exitCode":code,"generation":"submitted" if submitted else "failed-or-incomplete","files":files,"result":final,"init":next((e.get("init") for e in events if e.get("event")=="init"),None),"eventCount":len(events),"deniedActions":denied,"observedTelemetry":telemetry,"orderLimitation":"Fixed old-then-lean native order, global host/cache effects not isolated"}
 (out/"generation.json").write_text(json.dumps(record,indent=2)+"\n")
 print(json.dumps({"case":cid,"generation":record["generation"],"exitCode":code,"durationSeconds":record["durationSeconds"],"usage":final.get("usage") if final else None,"telemetry":telemetry}),flush=True)

"""Run fresh scoped native AGY cases sequentially; never mutate prior studies."""
from pathlib import Path
import subprocess,json,datetime,time
root=Path("/mnt/c/Users/hi/src/personal_repos/TasteForge")
run=root/"evals/runs/2026-11-02-current-skill-automation"
win="C:/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-current-skill-automation"
binary="/mnt/c/Users/hi/AppData/Local/agy/bin/agy.exe"
order=["c09","c10","c12","c11"]
for cid in order:
 case=run/"cases"/cid;folder=run/"evidence"/cid
 folder.mkdir(parents=True,exist_ok=True)
 recordPath=folder/"generation.json"
 if recordPath.exists() or (folder/"cli-events.ndjson").exists():raise RuntimeError("Preserve previous attempt "+cid)
 prefix="command(regex:wsl\\.exe --distribution Ubuntu --cd "+str(case)+" --exec bash -lc .*)"
 perms={"allow":["read_file("+win+"/cases/"+cid+")","write_file("+win+"/cases/"+cid+")",prefix],
 "deny":["read_url(*)","execute_url(*)","mcp(*)","write_file("+win+"/cases/"+cid+"/task.md)","write_file("+win+"/cases/"+cid+"/fixture.json)"]}
 if cid in ["c10","c12"]:perms["allow"].append("read_file("+win+"/treatment/tasteforge)")
 else:perms["deny"].append("read_file("+win+"/treatment/tasteforge)")
 for other in range(1,21):
  if "c%02d"%other!=cid:perms["deny"].append("read_file("+win+"/cases/c%02d)"%other)
 settings={"permissions":perms}
 settingsPath=run/"tools"/(cid+"-agy-settings.json")
 settingsPath.write_text(json.dumps(settings,indent=2)+"\n")
 prompt=(run/"tools"/(cid+"-prompt.txt")).read_text()
 args=[binary,"--new-project","--model","gemini-3.8-flash-medium","--effort","medium","--mode","accept-edits","--disable-slash-commands","--settings",win+"/tools/"+settingsPath.name,"--output-format","stream-json","--print-timeout","12m","-p",prompt]
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();clock=time.monotonic()
 print(json.dumps({"case":cid,"event":"starting","model":"gemini-3.8-flash-medium","startedAtUtc":started}),flush=True)
 with (folder/"cli-events.ndjson").open("w") as stdout,(folder/"cli-stderr.txt").open("w") as stderr:
  p=subprocess.Popen(args,cwd=case,stdout=stdout,stderr=stderr,stdin=subprocess.DEVNULL)
  try:code=p.wait(timeout=780)
  except subprocess.TimeoutExpired:
   p.terminate();code="operator-timeout-780s"
   try:p.wait(timeout=12)
   except subprocess.TimeoutExpired:p.kill();p.wait()
 events=[]
 for line in (folder/"cli-events.ndjson").read_text(errors="replace").splitlines():
  try:events.append(json.loads(line))
  except json.JSONDecodeError:pass
 final=next((e.get("result") for e in reversed(events) if e.get("event")=="result"),None)
 files={name:{"exists":(case/name).exists(),"bytes":(case/name).stat().st_size if (case/name).exists() else 0} for name in ["index.html","styles.css","app.js","implementation-notes.md"]}
 implemented=all(f["exists"] and f["bytes"]>0 for f in files.values())
 denied=final.get("denied_actions",[]) if final else []
 submitted=code==0 and final and final.get("status")=="SUCCESS" and implemented and not denied
 record={"case":cid,"host":"Antigravity CLI Windows","model":"gemini-3.8-flash-medium","effort":"medium","command":args,"cwd":str(case),"startedAtUtc":started,"finishedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"durationSeconds":round(time.monotonic()-clock,3),"exitCode":code,"eventCount":len(events),"init":next((e.get("init") for e in events if e.get("event")=="init"),None),"result":final,"files":files,"generation":"submitted" if submitted else "failed-or-incomplete","deniedActions":denied,"permissionScope":"Session-only scoped file paths and documented native-Windows regex WSL command matcher. No global setting or credential changes."}
 recordPath.write_text(json.dumps(record,indent=2)+"\n")
 print(json.dumps({"case":cid,"generation":record["generation"],"durationSeconds":record["durationSeconds"],"exitCode":code,"status":final.get("status") if final else None,"response":final.get("response","")[-1000:] if final else None,"usage":final.get("usage") if final else None}),flush=True)

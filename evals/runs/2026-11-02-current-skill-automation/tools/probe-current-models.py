"""Sequential bounded current-model probes; no user credential files are read."""
from pathlib import Path
import subprocess, os, json, datetime, time
root=Path(__file__).resolve().parents[4]
out=root/"evals/runs/2026-11-02-current-skill-automation/evidence/availability"
out.mkdir(parents=True,exist_ok=True)
private=root/".tmp/current-skill-automation-probes"; private.mkdir(exist_ok=True)
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def run_record(name,args,cwd,env=None,timeout=55):
 target=out/(name+".json")
 if target.exists():raise RuntimeError("Never overwrite availability evidence: "+str(target))
 start=time.monotonic();started=now()
 try:
  p=subprocess.run(args,cwd=cwd,env=env,capture_output=True,text=True,timeout=timeout)
  result=dict(exitCode=p.returncode,stdout=p.stdout,stderr=p.stderr)
 except subprocess.TimeoutExpired as e:
  conv=lambda x:x.decode(errors="replace") if isinstance(x,bytes) else x or ""
  result=dict(exitCode="operator-timeout-"+str(timeout)+"s",stdout=conv(e.stdout),stderr=conv(e.stderr))
 result.update(command=args,startedAtUtc=started,durationSeconds=round(time.monotonic()-start,3))
 target.write_text(json.dumps(result,indent=2)+"\n")
 print(json.dumps(dict(name=name,exitCode=result["exitCode"],durationSeconds=result["durationSeconds"],stdout=result["stdout"][-1600:],stderr=result["stderr"][-600:])),flush=True)
 return result
run_record("opencode-version",["opencode","--version"],private,timeout=30)
run_record("opencode-models",["opencode","models","opencode"],private,timeout=40)
for model in ["opencode/deepseek-v4.1-flash-free","opencode/glm-5.3-flash-free"]:
 slug=model.split("/")[1];work=private/slug;work.mkdir(exist_ok=True)
 env=os.environ.copy()
 for k in list(env):
  if k.endswith(("_API_KEY","_TOKEN")) or k.startswith("OPENCODE_"):env.pop(k,None)
 for key,folder in [("XDG_CONFIG_HOME","config"),("XDG_DATA_HOME","data"),("XDG_CACHE_HOME","cache"),("XDG_STATE_HOME","state")]:
  folderPath=work/folder;folderPath.mkdir(exist_ok=True);env[key]=str(folderPath)
 cfg={"$schema":"https://opencode.ai/config.json","autoupdate":False,"share":"disabled","snapshot":False,"formatter":False,"lsp":False,"enabled_providers":["opencode"],"model":model,"small_model":model,"permission":"deny"}
 env["OPENCODE_CONFIG_CONTENT"]=json.dumps(cfg)
 result=run_record(slug,["opencode","run","--pure","--model",model,"--format","json","--title","TasteForge current-beta availability","Reply exactly READY. Do not read files or use tools."],work,env,55)
 errors=[]
 for log in (work/"data/opencode/log").glob("*.log"):
  for line in log.read_text(errors="replace").splitlines():
   if any(word in line.lower() for word in ["free usage limit","quota","rate limit","insufficient","model not found"]):errors.append(line[:1200])
 result.update(requestedModel=model,config=cfg,providerErrorLines=errors,credentialContext="Isolated XDG; API-key/token environment removed. No existing credential files read, copied or exported. No paid fallback.",sequential=True)
 result["availability"]="quota-blocked" if any("free usage limit" in e.lower() for e in errors) else ("ready" if "READY" in result["stdout"] else "unavailable-or-incomplete")
 (out/(slug+".json")).write_text(json.dumps(result,indent=2)+"\n")
 print(json.dumps(dict(model=model,availability=result["availability"],providerErrorLines=errors)),flush=True)
agy="/mnt/c/Users/hi/AppData/Local/agy/bin/agy.exe"
run_record("agy-version",[agy,"--version"],private,timeout=30)
models=run_record("agy-models",[agy,"models"],private,timeout=40)
cfg={"permissions":{"deny":["command(*)","write_file(*)","read_file(*)"]}}
run_record("agy-ready",[agy,"--model","gemini-3.8-flash-medium","--output-format","json","--print-timeout","45s","--disable-slash-commands","--settings",json.dumps(cfg),"-p","Reply exactly READY. Do not read files, use tools or change anything."],private,timeout=55)

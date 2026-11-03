"""Derive bounded efficiency/quality evidence; never merge finalization into paired samples."""
from pathlib import Path
import json
run=Path(__file__).resolve().parents[1]
load=lambda p:json.loads((run/p).read_text())
m=load("manifest.json");sizes=load("evidence/instruction-size.json")
def browser_summary(b):
 rows=b["viewports"];checks=[c for v in rows.values() for c in v["checks"]]
 rules=sorted({x["id"] for v in rows.values() for s in ["axeInitial","axeFailure","axeFinal"] for x in v.get(s,{}).get("violations",[])})
 incomplete=sorted({x["id"] for v in rows.values() for s in ["axeInitial","axeFailure","axeFinal"] for x in v.get(s,{}).get("incomplete",[])})
 points=[p for v in rows.values() for p in v["stateGeometry"].values()]
 return {"traces":len(rows),"passed":sum(c["status"]=="pass" for c in checks),"checks":len(checks),"allPrimaryFlowsCompleted":all(not v.get("executionError") for v in rows.values()),"axeRulesAnyCapturedStage":rules,"axeIncompleteRules":incomplete,"naturalCheckpoints":len(points),"checkpointScope":sorted({p["scope"] for p in points}),"failures":[{"viewport":n,**c} for n,v in rows.items() for c in v["checks"] if c["status"]!="pass"]}
cases=[]
for c in m["cases"]:
 assert c["generation"]=="submitted"
 b=browser_summary(load("evidence/"+c["id"]+"/browser.json"))
 cases.append({**{k:c[k] for k in ["id","effort","condition","host","model"]},**b,"rawQualityStatus":"needs-correction" if b["axeRulesAnyCapturedStage"] else "passes-executed-checks-with-unassessed-scope"})
old=load("evidence/l03/generation.json");lean=load("evidence/l04/generation.json")
uold=old["result"]["usage"];ulean=lean["result"]["usage"]
pct=lambda a,b:round((b-a)/a*100,3)
metrics={"durationSeconds":{"old":old["durationSeconds"],"lean":lean["durationSeconds"]},"uniqueNativeToolSteps":{"old":old["observedTelemetry"]["uniqueNativeToolSteps"],"lean":lean["observedTelemetry"]["uniqueNativeToolSteps"]}}
for key in ["input_tokens","output_tokens","thinking_tokens","cache_read_tokens","total_tokens"]:
 metrics[key]={"old":uold[key],"lean":ulean[key]}
for v in metrics.values():v["changePercent"]=pct(v["old"],v["lean"])
observed={}
for condition,g in [("old",old),("lean",lean)]:
 paths=g["observedTelemetry"]["observedReadFileSkillResources"]
 observed[condition]={"paths":paths,"fullResourceWords":sum(sizes[condition]["files"].get(p,0) for p in paths),"scope":"Native read_file resource names; full-file word proxy, not exhaustive or serialized/partial-token context."}
worked=browser_summary(load("worked-finalization/evidence/f01/browser.json"))
correction=load("worked-finalization/correction.json")
worked.update({"notAPairedSample":True,"jsFixtureTaskUnchanged":correction["jsFixtureTaskUnchanged"],"knownCopyCorrection":"Guaranteed Rate → Illustrative exchange rate","costScope":"Initial paired provider usage excludes root evaluation and this operator correction; end-to-end accepted-UI cost not measured."})
summary={"runId":m["runId"],"baseCommit":m["sourceBaseCommit"],"actualPairedUIs":4,"pairs":2,"viewportTraces":sum(c["traces"] for c in cases),"passed":sum(c["passed"] for c in cases),"checks":sum(c["checks"] for c in cases),"cases":cases,"instructionSize":sizes,"standardInitialGenerationMetrics":metrics,"standardObservedResources":observed,"standardQualityFinding":{"rawLeanRegression":"definition-list plus color-contrast versus old color-contrast","unsupportedCopy":"Raw lean entry label Guaranteed Rate not established by illustrative fixture","scope":"Operator source review of this known claim; not a universal automated fact checker"},"workedFinalization":worked,"sourceValidation":{"buildTypecheck":"Passed before initial lint failure","initialFailure":"Flat ESLint traversed ignored .tmp smoke fixtures; failure log retained","continuation":"Scoped.tmpignore added;lint/format/44tests passed;packed-install passed and22skillfiles byte-verified","helper":"16 meaningful fixture checks plus separate missing-browser negative check; earlier diagnostics retained"},"limitations":["One generation per condition/task, two distinct effort/host pairs; no population or host comparison.","Standard fixed old-then-lean order; backend/inference seed/global host cache/shared-machine effects uncontrolled.","Provider input/output/thinking/cache categories kept as reported; no billed-price estimate or additive cache arithmetic.","Observed read_file names and Fast self-reported reads are proxies; collaboration token/runtime totals not exposed.","Fast one-preview budget forbade creator post-correction rerender; final operator gates separately verify unchanged submissions.","Standard recheck allowance explicitly amended for both cases before inference; archived originals/base protocol retained.","Raw lean had real accessibility/content findings despite task checks passing. Finalization is a disclosed worked correction, not a new blind sample.","Manual/user/assistive-technology testing remains deferred and unassessed."]}
target=run/"results.json";assert not target.exists(),"Preserve earlier results"
target.write_text(json.dumps(summary,indent=2)+"\n")
print(json.dumps({"pairedChecks":str(summary["passed"])+"/"+str(summary["checks"]),"entryChangePercent":pct(sizes["old"]["entryWords"],sizes["lean"]["entryWords"]),"metrics":metrics,"workedFinalization":worked},indent=2))

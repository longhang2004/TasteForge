"""Derive counts and separate-dimension paired ratings from preserved evidence."""
from pathlib import Path
import csv,json,collections
run=Path(__file__).resolve().parents[1]
load=lambda p:json.loads((run/p).read_text())
m=load("manifest.json");selection=load("evidence/selection.json")["cases"]
dimensions=["entry_priority","information_grouping","decision_context","narrow_context","recovery_evidence","composition_purpose"]
cases=[]
for entry in m["cases"]:
 if entry["generation"]!="submitted":continue
 b=load(selection[entry["id"]]["selected"]);vs=b["viewports"]
 raw=[x for v in vs.values() for x in v["checks"]]
 main=[x for x in raw if x["kind"]!="diagnostic"]
 rules=sorted({x["id"] for v in vs.values() for stage in ["axeInitial","axeFailure","axeFinal"] for x in v.get(stage,{}).get("violations",[])})
 cases.append({**{k:entry[k] for k in ["id","host","model","promptId","condition"]},"rawPassed":sum(x["status"]=="pass" for x in raw),"rawTotal":len(raw),"nonDiagnosticPassed":sum(x["status"]=="pass" for x in main),"nonDiagnosticTotal":len(main),"allTaskTracesCompleted":all(not v.get("executionError") for v in vs.values()),"failedChecks":[{"viewport":name,**c} for name,v in vs.items() for c in v["checks"] if c["status"]!="pass"],"axeRulesAnyCapturedStage":rules})
assert len(cases)==12
ratings=[];byReviewer={};panels={"a":["r1","r2"],"b":["r1","r3"]}
for batch,reviewers in panels.items():
 mapping={v["view"]:v for v in load("reviews/blind-map-"+batch+".json")["views"]}
 for rid in reviewers:
  doc=load("reviews/"+rid+"-"+batch+".json")
  assert len(doc["views"])==len(mapping)
  assert len(doc["inspectedImages"])==len(mapping)*6
  assert len(set(doc["inspectedImages"]))==len(doc["inspectedImages"])
  for v in doc["views"]:
   e=mapping[v["id"]];original=next(c for c in cases if c["id"]==e["case"])
   assert set(v["scores"])==set(dimensions)
   byReviewer[(rid,e["case"])]=v["scores"]
   for dim in dimensions:
    score=v["scores"][dim]["score"];assert score is None or isinstance(score,(int,float)) and 1<=score<=5
    ratings.append({"reviewer":rid,"batch":batch,"anonymousView":v["id"],"case":e["case"],"model":e["model"],"task":original["promptId"],"condition":e["condition"],"dimension":dim,"score":score,"note":v["scores"][dim]["note"]})
pairs=[]
for key in dict.fromkeys((c["host"],c["model"],c["promptId"]) for c in cases):
 a=next(c for c in cases if (c["host"],c["model"],c["promptId"])==key and c["condition"]=="no-skill")
 b=next(c for c in cases if (c["host"],c["model"],c["promptId"])==key and c["condition"]=="current-skill")
 panel=panels["b" if key[0]=="antigravity" else "a"]
 differences={}
 for rid in panel:
  sa=byReviewer[(rid,a["id"])];sb=byReviewer[(rid,b["id"])]
  differences[rid]={dim:None if sa[dim]["score"] is None or sb[dim]["score"] is None else sb[dim]["score"]-sa[dim]["score"] for dim in dimensions}
 pairs.append({"host":key[0],"model":key[1],"task":key[2],"baseline":a["id"],"assisted":b["id"],"pairedDifferencesByReviewer":differences})
numericDisagreements=0;bothAssessed=0;availabilityDisagreements=0
for c in cases:
 panel=panels["b" if c["host"]=="antigravity" else "a"]
 for dim in dimensions:
  x,y=[byReviewer[(rid,c["id"])][dim]["score"] for rid in panel]
  if x is None or y is None:
   availabilityDisagreements+=int((x is None)!=(y is None))
  else:bothAssessed+=1;numericDisagreements+=int(x!=y)
dimensionSummary={}
for dim in dimensions:
 shifts=[diff[dim] for pair in pairs for diff in pair["pairedDifferencesByReviewer"].values()]
 dimensionSummary[dim]={"positive":sum(x is not None and x>0 for x in shifts),"tie":sum(x==0 for x in shifts),"negative":sum(x is not None and x<0 for x in shifts),"unassessed":sum(x is None for x in shifts)}
timing=[]
for c in cases:
 if c["host"]!="antigravity":continue
 g=load("evidence/"+c["id"]+"/generation.json")
 timing.append({"case":c["id"],"condition":c["condition"],"task":c["promptId"],"durationSeconds":g["durationSeconds"],"usage":g["result"].get("usage"),"scope":"One native CLI run; cache categories separate, no billed-cost estimate."})
summary={"sourceCommit":m["sourceCommit"],"runId":m["runId"],"plannedCells":20,"actualUIs":len(cases),"matchedPairs":len(pairs),"viewportTraces":36,"rawPassed":sum(c["rawPassed"] for c in cases),"rawTotal":sum(c["rawTotal"] for c in cases),"nonDiagnosticPassed":sum(c["nonDiagnosticPassed"] for c in cases),"nonDiagnosticTotal":sum(c["nonDiagnosticTotal"] for c in cases),"allPrimaryTaskTracesCompleted":all(c["allTaskTracesCompleted"] for c in cases),"quotaBlockedCells":sum(c["generation"]=="availability-blocked" for c in m["cases"]),"cases":cases,"pairs":pairs,"dimensionSummary":dimensionSummary,"reviewAgreement":{"numericDisagreements":numericDisagreements,"bothAssessedCells":bothAssessed,"assessmentAvailabilityDisagreements":availabilityDisagreements,"panels":panels},"antigravityRuntime":timing,"limitations":["One generation per cell, uncontrolled inference seed/backend and soft compute budget; not replicated/population inference.","Ratings are independent AI screenshot judgments, not user usability; no overall score.","All state viewport frames forced to page top, not natural post-click landings; unshown recovery remains unassessed.","Panels differ by host batch after quota/capacity interruption; do not rank hosts.","Manual/human tests deferred per user, never treated as passed."]}
for file in ["analysis.json","reviews/ratings.csv"]:
 assert not (run/file).exists(),"Preserve prior analysis: "+file
(run/"analysis.json").write_text(json.dumps(summary,indent=2)+"\n")
with (run/"reviews/ratings.csv").open("w",newline="") as f:
 w=csv.DictWriter(f,fieldnames=list(ratings[0]),lineterminator="\n");w.writeheader();w.writerows(ratings)
print(json.dumps({k:summary[k] for k in ["actualUIs","matchedPairs","rawPassed","rawTotal","nonDiagnosticPassed","nonDiagnosticTotal","allPrimaryTaskTracesCompleted","reviewAgreement","dimensionSummary"]},indent=2))

const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=__dirname, run='evals/runs/2026-11-02-quality-identity-forward-test/';
const results=JSON.parse(fs.readFileSync(path.join(root,'checks-final/results.json'),'utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
const record={
 start_utc:'2026-11-02T08:29:56Z',start_basis:'First observed UTC clock at initial read attempt.',end_utc:new Date().toISOString(),
 loaded_paths:[run+'operator.md',run+'prompts/press-booking.md',run+'resources/R1/tasteforge/SKILL.md',run+'resources/R1/tasteforge/workflows/create-ui.md',run+'resources/R1/tasteforge/references/render-checks.md','examples/inventory-workbench/tools/node_modules/playwright','examples/inventory-workbench/tools/node_modules/@axe-core/playwright'],
 rationale:'Standard task slice using a familiar choose/review/reserved flow. Restrained paper, ink, red and blue palette, system type, registration marks and an honestly labeled original two-pass schematic connect the studio identity to the actual press task. Complete supplied conditions accompany the choice. Native form controls validate participants and induction; draft values remain in-page through edit and recovery.',
 versions:[{path:'versions/00.html',preserved_utc:'2026-11-02T08:32:44Z',sha256:hash('versions/00.html'),author:'creator',finding:'First runnable version, preserved before any browser check.'}],
 submitted:{path:'index.html',sha256:hash('index.html'),matches_first_version:hash('index.html')===hash('versions/00.html')},
 app_correction_passes:0,
 checks:{
  browser:'Installed Playwright Chromium, local file URL, no network/install.',
  widths:[320,390,1440],states:['choose','review','simulated failure','success'],
  executed_behavior:['Tuesday full slot disabled','date change clears previous session','Wednesday has only available supplied sessions','0, 1.5 and 4 participants invalid; 3 valid','induction required','review shows selected date/time, participants, fee and exclusions','edit retains date, session, participants and induction','first confirm fails','failure text receives focus and fits inside 900px viewport','Tab reaches edit then retry','retry succeeds with same choices','success identifies simulation reservation and states no real booking/payment'],
  geometry:'No horizontal document overflow and all visible action bounds fit horizontally at each tested width. Focused error is fully within natural 900px viewport. Ordinary scrolling and Tab make action controls reachable.',
  console_errors:results.consoleErrors,
  axe:results.widths.map(w=>({width:w.width,violations:w.axe.violations.map(v=>v.id),incomplete:w.axe.incomplete.map(v=>v.id),passes:w.axe.passes})),
  visual_inspection:['1440 choose full page','320 failure full page','320 failure natural viewport','390 choose natural viewport'],
  evidence:['checks/results.json','check-output.log','checks-final/results.json','check-output-final.log','checks/*.png','checks-final/*.png'],
  limitations:['Automated axe color-contrast results remain incomplete review items, not passes.','Screen-reader announcement quality and complete keyboard traversal of every control were not assessed.','No human acceptance or accessibility conformance certification.']
 },
 failures:[
  {type:'environment',raw:'Access is denied. Error code: Wsl/E_ACCESSDENIED',resolution:'Retried WSL with execution sandbox escalation; authorized read succeeded.'},
  {type:'runtime lookup',raw:'command -v chromium returned exit 1 after version hash and UTC were recorded; no chromium command found on PATH.',resolution:'Installed Playwright-managed Chromium launched successfully.'},
  {type:'test harness',raw:'Error: Please use browser.newContext()\n Please check out https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/error-handling.md',resolution:'Changed harness from browser.newPage to explicit browser.newContext and context.newPage. Rerun has zero axe violations and retains color-contrast incomplete items.'},
  {type:'diagnostic shell quoting',raw:"': -c: line 1: syntax error near unexpected token `newline'\n': -c: line 1: `python3 - <<'",resolution:'Read the already saved check JSON via a local Node script instead.'}
 ],
 tool_call_count:null,tool_call_count_note:'Multiple orchestration calls contain batched nested tools; no reliable provider-level count exposed.',
 exact_model:null,provider:null,input_tokens:null,output_tokens:null,thinking_tokens:null,cached_input_tokens:null,cached_output_tokens:null,total_tokens:null,cost:null,
 human_acceptance:null
};
fs.writeFileSync(path.join(root,'creator-record.json'),JSON.stringify(record,null,2)+'\n');
fs.writeFileSync(path.join(root,'environment-failures.log'),record.failures.map(f=>f.type+'\n'+f.raw+'\nResolution: '+f.resolution).join('\n\n')+'\n');
console.log(JSON.stringify({record:'creator-record.json',end_utc:record.end_utc,hash:record.submitted.sha256,first_preserved:record.submitted.matches_first_version,contrast_review:results.widths.map(w=>({width:w.width,nodes:w.axe.incomplete.flatMap(v=>v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))) }))},null,2));

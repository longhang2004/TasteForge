import json, hashlib
from pathlib import Path
from datetime import datetime, timezone

p=Path.cwd()
def read(name): return json.loads((p/name).read_text())
def sha(name): return hashlib.sha256((p/name).read_bytes()).hexdigest()
first=read('creator-evidence/attempt-00/report.json')
final=read('creator-evidence/attempt-01/report.json')
record={
  'cell':'relay-3',
  'product':'Relay Notes',
  'startedAtUtc':'2026-11-02T16:24:47Z',
  'startBasis':'The first tool invoked WSL date before reading inputs, but sandbox returned Wsl/E_ACCESSDENIED and no timestamp. This is the first observable UTC from the escalated retry immediately before reading assigned inputs; exact dispatch timestamp is unavailable.',
  'finishedAtUtc':datetime.now(timezone.utc).isoformat(),
  'creatorCount':1,
  'mode':'Controlled offline code-first supplied-media landing-page slice',
  'projectLinuxPath':str(p),
  'projectWindowsPath':r'C:\Users\hi\.codex\visualizations\2026\11\02\01a19b3e-944d-71f3-aad3-5bb52e595e71\tasteforge-four-skill-projects\relay-3',
  'assignedSkill':'/mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-four-skill-landing-comparison/resources/elaya/skill/SKILL.md',
  'actualLoadedInputs':[
    'PRODUCT.md (complete)', 'common/fixtures.json (complete; relay-notes factual contract)',
    '/mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-four-skill-landing-comparison/operator.md (complete; original staging path superseded by parent persistent path)',
    '/mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-four-skill-landing-comparison/resources/elaya/skill/SKILL.md (complete across overlapping reads)',
    'common/fonts.css','common/assets/LICENSE','common/prepare_assets.py','common/setup-report.json',
    'common/assets/relay-notes-editor.svg (browser rendered)','common/assets/relay-notes-draft.svg (browser rendered)',
    'common/fonts/manrope/Manrope[wght].ttf (browser loaded)'
  ],
  'preCodePlanning':'plan.md created before index.html; page outline, hero copy, 3 benefits, 3 steps, 6 FAQ answers, noindex decision and layout A rationale recorded before implementation.',
  'nativeWorkflow':{
    'strategy':'Read A before designing; one offer, small open source maintainers, one primary demo action. Classic hero plus sections because supplied static artifact explains the workflow. No manufactured customer proof.',
    'visual':'Manrope, reusable named type styles, default-scale type sizes, light flat surfaces, violet accent, floating compact navigation, hero text-only gradient, token spacing, explicit focus, loading skeleton, specific inline feedback, section reveal and word-by-word tagline.',
    'nativeCommandsOrResourceCalls':'Assigned native bundle supplies design instructions rather than a local generation CLI. No additional native tools or reference skills invoked. Local HTML/CSS/JS authored directly, as required by experiment.',
    'overridesAndDeviations':[
      'The operator requires a single creator, code-first implementation and supplied local media; no helper agents, image generation, network, installs or global settings were used. Full native production workflow compliance is not claimed.',
      'The native 25–35% resting tagline opacity caused an actual serious axe contrast failure. The one correction raises it to 60% while preserving the per-word reveal and full-color reduced-motion state. This is a deliberate native visual-rule deviation for readability.',
      'No invented logo strip/testimonials/metrics. The supplied static Canal Docs artifact is the available proof, with honest captions.',
      'Fixed supplied pricing and change records override any guidance to invent irregular sample numbers or new product content.',
      'This bounded static page has no custom server 404 routing, live editor, backend, real trial/account/payment/email or unrequested cookie system. Not all production ship requirements apply.'
    ]
  },
  'rationale':'A calm classic hero makes the Markdown-to-draft workflow concrete before asking for billing choice. Three benefits and steps explain fit; FAQ answers handle integration, sending, team and policy limits. Exact selected cost and demo consequence sit immediately before the only form commitment.',
  'tradeoff':'The longer explanatory page asks visitors to scroll to billing. Compact mobile navigation omits the workflow anchor but retains questions and plans. Static product artifacts become small at mobile widths, so nearby real text explains their role; the illustrations are not represented as usable controls.',
  'versions':[
    {'file':'versions/00.html','atUtc':(p/'versions/00.time.txt').read_text().strip(),'sha256':sha('versions/00.html'),'author':'creator','basis':'First runnable output preserved byte-for-byte before any checks or edits.'},
    {'file':'versions/01.html','atUtc':(p/'versions/01.time.txt').read_text().strip(),'sha256':sha('versions/01.html'),'author':'same creator','basis':'Single focused correction after actual axe and screenshot findings: remove redundant logo aria-label, raise tagline resting opacity to 60%, restore shell horizontal gutters. No other HTML correction pass.'}
  ],
  'submitted':{'file':'index.html','sha256':sha('index.html'),'matchesVersion':'versions/01.html','commonDirectory':'Unedited supplied local assets/font kit; relative common/fonts.css and common/assets paths.'},
  'actualCommandsAndOutcomes':[
    {'command':'wsl.exe --distribution Ubuntu --cd <persistent project> --exec bash -lc date...','outcome':'First command denied by sandbox with Wsl/E_ACCESSDENIED; escalated retry allowed. All actual terminal commands/scripts ran in Ubuntu WSL2 Bash.'},
    {'command':'date -u; cat PRODUCT.md; cat common/fixtures.json; cat relay-notes; cat <operator>; cat <assigned SKILL.md>','outcome':'Facts and assigned operator/skill read. cat relay-notes reported no such file; actual factual contract was already common/fixtures.json relay-notes. No extra relay-notes file was required.'},
    {'command':'cat <assigned SKILL.md>; find common; cat common/fonts.css; read common local files; sed assigned SKILL.md tail','outcome':'Complete assigned guidance and common local rights read; some combined tool output was truncated so overlapping complete assigned skill reads supplied missing portions.'},
    {'command':'apply_patch plan.md and index.html; mkdir versions creator-evidence/attempt-00; cp index.html versions/00.html; date -u; sha256sum','outcome':'First runnable HTML captured before checks.'},
    {'command':'node check.cjs > creator-evidence/attempt-00/console.log 2>&1','outcome':'Actual initial browser assertions and axe run completed; failures retained.'},
    {'command':'Read raw axe finding; view_image initial-390.png and success-390.png; apply_patch focused correction; cp index.html versions/01.html; date -u; sha256sum','outcome':'One correction preserved separately; initial raw evidence never overwritten.'},
    {'command':'node check.cjs creator-evidence/attempt-01 > creator-evidence/attempt-01/console.log 2>&1','outcome':'Corrected automated checks completed; 27 recorded checks passed.'},
    {'command':'node visual-review.cjs; view_image visual-01/top-1440.png and workflow-390.png','outcome':'Actual scrolled workflow, keyboard FAQ, form tab order and terms anchor observed. Viewport screenshots preserved without resetting post-action scroll/focus.'},
    {'command':'python3 write-record.py','outcome':'Writes this creator record from actual preserved hashes, clocks and raw reports; no artifact changes.'}
  ],
  'checks':{
    'initialReport':'creator-evidence/attempt-00/report.json',
    'initialCheckCount':len(first['checks']),
    'initialFailures':[c for c in first['checks'] if not c.get('pass')],
    'initialRawAxe':['creator-evidence/attempt-00/axe-390.json','creator-evidence/attempt-00/axe-1440.json'],
    'submittedReport':'creator-evidence/attempt-01/report.json',
    'submittedCheckCount':len(final['checks']),
    'submittedPassedCount':sum(c.get('pass') is True for c in final['checks']),
    'submittedFailures':[c for c in final['checks'] if not c.get('pass')],
    'submittedRawAxe':['creator-evidence/attempt-01/axe-390.json','creator-evidence/attempt-01/axe-1440.json'],
    'scope':'No overflow and local font checks at 320,390,1440; skip link first target; empty/invalid email feedback; feedback focus; Annual USD120 billed once yearly; first valid failure; retained workspace/email/plan; retry success and exact trial/editor/no-real-consequence; stale success cleared on edit; Monthly USD12 each month; long feedback wrapping; axe at390 post-action and1440 initial; reduced motion; no external requests and no page errors.',
    'visualKeyboardObservations':'creator-evidence/visual-01/observations.json',
    'screenshots':'creator-evidence/attempt-00, attempt-01 and visual-01. Initial full-page screenshots include below-fold not-yet-triggered reveals; visual-01 records actual scrolled revealed workflow. Post-submit screenshots retain natural focus/scroll.',
    'visuallyInspected':['creator-evidence/attempt-00/initial-390.png','creator-evidence/attempt-00/success-390.png','creator-evidence/visual-01/top-1440.png','creator-evidence/visual-01/workflow-390.png'],
    'unassessed':['Independent human acceptance, usability or uniqueness','Screen reader output and every browser/platform','Full pixel-level native rule audit','Real editor/Git/email/account/payment/trial systems are intentionally outside scope','Axe is automated evidence only and does not establish general accessibility compliance']
  },
  'provider':None,'model':None,'inputTokens':None,'outputTokens':None,'thinkingTokens':None,'cachedTokens':None,'billedCost':None,'toolCount':None,
  'metricsBasis':'Provider/model/token/cache/billing/tool totals are not exposed in this creator session; no estimates or word-derived token counts.',
  'acceptance':'Creator checks only. Root runs separate matched acceptance. No independent approval or human acceptance claimed.',
  'prohibitedActions':'No helper agents, image generation, network, package install, global setting/hook changes, common/resource edits, commits, pushes or Linear updates.'
}
record['elapsedObservedSeconds']=(datetime.fromisoformat(record['finishedAtUtc'])-datetime.fromisoformat(record['startedAtUtc'].replace('Z','+00:00'))).total_seconds()
(p/'creator-record.json').write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'finishedAtUtc':record['finishedAtUtc'],'elapsedObservedSeconds':record['elapsedObservedSeconds'],'submittedSha256':record['submitted']['sha256'],'checks':record['checks']['submittedCheckCount'],'passed':record['checks']['submittedPassedCount']},indent=2))

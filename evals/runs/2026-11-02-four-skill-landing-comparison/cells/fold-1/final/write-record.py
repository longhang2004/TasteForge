import json, hashlib, pathlib, datetime
p=pathlib.Path.cwd()
now=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z')
sha=lambda f:hashlib.sha256((p/f).read_bytes()).hexdigest()
base='/mnt/c/Users/hi/src/personal_repos/TasteForge/evals/runs/2026-11-02-four-skill-landing-comparison'
skill=base+'/resources/promax/skill'
report=json.loads((p/'evidence/attempt-01/report.json').read_text())
record={
 'product':'Field Fold', 'assignedSkill':'ui-ux-pro-max',
 'projectPath':str(p),
 'utcStart':'2026-11-02T14:34:10.921Z',
 'utcEnd':now,
 'startBasis':'First successful tool UTC before input loading. The initial required WSL launch was sandbox-denied; the next, escalated WSL launch returned this UTC. No task input was loaded before it.',
 'experimentOverrides':['One creator; code-first; supplied local media only; no helpers or image generation. Persistent isolated assigned project supersedes operator original /tmp staging path.'],
 'loadedPaths':[
   str(p/'PRODUCT.md'), str(p/'common/fixtures.json'),
   base+'/operator.md',skill+'/SKILL.md',
   skill+'/references/pro-rules.md',skill+'/references/quick-reference.md',
   str(p/'common/fonts.css'),str(p/'common/assets/LICENSE'),
   str(p/'common/assets/field-fold-map.svg'),str(p/'common/assets/field-fold-contents.svg')
 ],
 'nativeCalls':[
   {'command':f'PYTHONDONTWRITEBYTECODE=1 python3 {skill}/scripts/search.py "urban sketching printed map kit" --design-system -p "Field Fold"','outcome':'Returned Hero + Features + CTA; Minimalism & Swiss Style; dark purple/tool-teal palette; Outfit/Work Sans. Verified output category and identity; product match was generic creative-tool guidance, so narrowed once.'},
   {'command':f'PYTHONDONTWRITEBYTECODE=1 python3 {skill}/scripts/search.py "error summary validation" --domain ux','outcome':'Returned 3 UX rules: Focusable Error Summary, Error Messages, Error Placement. Applied focused summary, linked field messages, aria-describedby and role alert.'},
   {'command':f'PYTHONDONTWRITEBYTECODE=1 python3 {skill}/scripts/search.py "printed art ecommerce editorial" --design-system -p "Field Fold"','outcome':'Narrower retry returned Feature-Rich Showcase, Vibrant & Block-based, green/orange retail palette, Rubik/Nunito Sans. Verified retail fit. Used bold section hierarchy, green/orange accents and native forms; omitted unprovided social proof and replaced unavailable external fonts with supplied local Manrope/IBM Plex Mono.'}
 ],
 'nativeGuidanceLimits':'Recommendations adapted to supplied facts; no social proof, external fonts, GSAP or stack library. The prescribed implementation is plain HTML/CSS/JS, so no unsupported html-tailwind stack match was claimed. Native pro-rules read; its mobile-only scope was recognized, and quick-reference supplied web-specific guidance.',
 'rationale':'A large schematic artifact explains the object before the content list. Retail green and orange create clear conversion hierarchy; one edition/quantity/email form keeps availability, costs and local consequences together. Broad whitespace and bold Manrope give the small offer a legible, direct composition.',
 'tradeoffs':'The complete factual captions and policies make the mobile page longer. Native select retains familiar keyboard behavior; no edition previews were fabricated. Failure moves focus to a summary near the top of the form, with retry available below its retained controls; natural scroll is captured. No human usability or visual uniqueness claim.',
 'versions':[{'version':'versions/00.html','author':'creator','utc':(p/'versions/00.utc').read_text().strip(),'sha256':sha('versions/00.html'),'basis':'First runnable HTML preserved byte-for-byte before any browser checks.'}],
 'corrections':[],
 'submitted':{'file':'index.html','sha256':sha('index.html'),'utc':now,'sameAsFirstVersion':sha('index.html')==sha('versions/00.html')},
 'checks':{
  'attempts':[
   {'path':'evidence/attempt-00','outcome':'Tooling failure before page assessment: net::ERR_CONNECTION_REFUSED. Background server did not remain alive after launcher exited. Raw original report and log preserved.'},
   {'path':'evidence/attempt-01','outcome':'Same first HTML, server held alive with foreground checker. 21 assertions passed; zero failed assertions. Axe reported zero violations in inspected initial 390px state. No JS page errors or external requests observed.','started':report.get('started'),'ended':report.get('ended')}
  ],
  'executed':report['checks'],
  'commands':['node check.cjs','node check-attempt01.cjs'],
  'rawReports':['evidence/attempt-00/report.json','evidence/attempt-00/check.log','evidence/attempt-01/report.json','evidence/attempt-01/axe.json','evidence/attempt-01/check.log'],
  'screenshots':['evidence/attempt-01/initial-320.png','evidence/attempt-01/initial-390.png','evidence/attempt-01/initial-1440.png','evidence/attempt-01/invalid-natural-scroll.png','evidence/attempt-01/failure-natural-scroll.png','evidence/attempt-01/success-natural-scroll.png','evidence/attempt-01/long-feedback-390.png'],
  'creatorVisualInspection':['initial-1440.png','initial-320.png','failure-natural-scroll.png','success-natural-scroll.png'],
  'postActionScrollFocus':'Actual values preserved in attempt-01 report ctaState, invalidState, stockInvalidState, failureState, successState and longFeedbackState. Screenshots captured immediately after actions without resetting scroll.',
  'unassessed':['Human usability/acceptance','Independent reviewer assessment','Assistive-technology speech output','Full cross-browser/device coverage','Manual numerical contrast audit beyond axe','Every possible form/input combination','Landscape and largest system text size']
 },
 'commonAssets':'Existing common directory was read and referenced, never modified.',
 'provider':None,'model':None,'inputTokens':None,'outputTokens':None,'thinkingTokens':None,'cacheTokens':None,'billing':None,'cost':None,'toolCount':None,
 'limitations':'Provider/model/token/cache/billing/tool-count metadata are not exposed to this creator and are not estimated. Automated checks do not establish human usability or uniqueness. No commits, pushes, external messages or Linear updates.'
}
(p/'creator-record.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({'utcEnd':now,'sha256':sha('index.html'),'checks':len(report['checks']),'failed':sum(not c['passed'] for c in report['checks']),'corrected':False}))

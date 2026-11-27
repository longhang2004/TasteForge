from pathlib import Path
import json, shutil, hashlib, subprocess, zipfile, datetime

root = Path('/mnt/c/Users/hi/src/personal_repos/TasteForge')
run = root / 'evals/runs/2026-11-06-composition-randomizer-pilot'
run.mkdir(parents=True, exist_ok=True)
def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')
def dump(path, value):
    write(path, json.dumps(value, ensure_ascii=False, indent=2) + '\n')

protocol = '''# Two-brief composition/randomizer pilot — predeclaration

Compare released beta.2 (`98e1ebb` main tree, release candidate `6383a0b`) with an exact frozen composition/type/skill candidate. Two new fictional fixture sets, four fresh single-file UIs. This is a combined skill/resource/retrieval increment, not an isolated causal test of fonts or one algorithm. Teaching task families overlap; these products/fixtures are not the teaching examples. Baseline and candidate are frozen before creator dispatch.

Primary creator host: available Codex subagents, model `gpt-6.1-sol`, reasoning `high`, same settings for all four cells. One creator per cell, fresh context, maximum two concurrent. No OpenCode invocation or provider fallback. Both conditions get identical facts, original SVG assets, six locally licensed optional fonts and restrictions. Each receives its matching frozen skill and a single CLI-generated seeded reference pack, with full selected reference documents. This deliberately tests the delivered retrieval workflow; different selected references are part of the treatment. A reference seed is not a model inference seed.

Tasks: ShiftPress proof approval (`form`) and Signal Cabinet artifact exploration (`portfolio`). Order counterbalanced: proof baseline before candidate; cabinet candidate before baseline. Initial creation soft budget 12 minutes, hard budget 20 minutes, at most35 tool calls and no model/subagent/network calls. Creator reads one workflow then only relevant references, writes one complete runnable task slice plus notes, and stops. Parent performs matched browser checks. At most one targeted correction per cell (same creator if available), soft5/hard8 minutes, for demonstrated blockers. Preserve first artifacts and failure evidence; don't silently restyle an accepted cell. Budget stops/unavailability are reported, not scored as visual failures.

Checks at320/390/1440 and applicable keyboard/focus/axe: exact facts/artifacts, decisive context, input/selection constraints, edit/state retention, error/retry, success clearing, filter/empty/reset/detail/return/compare, no external requests and horizontal overflow. Capture actual natural scroll/focus; full-page existence is separate. Two independent AI reviewers inspect randomized A/B labels without treatment identities/creator notes, record task quality and specificity dimensions with evidence/tradeoffs, freeze before unblinding. Their blinding and shared-model limitations are disclosed. Keep ties, disagreement and unassessed dimensions; no aggregate uniqueness score.

Measure dispatch-to-completion wall time and observed tool calls when available, plus browser/correction intervals. Provider tokens/cache/thinking/billing and operator/reviewer tokens remain unknown if not exposed. Full billed acceptance-cycle cost remains unknown; no savings/model-ranking/human-usability claims. Implementation time, usage-limit interruption and later documentation/CI are separate from the pilot's measured span. Human/manual tests remain deferred. Preserve historical eval runs. No release, main merge, npm publication or global settings changes.
'''
if not (run / 'protocol.md').exists():
    write(run / 'protocol.md', protocol)
    write(run / 'protocol.sha256', hashlib.sha256(protocol.encode()).hexdigest() + '\n')

work = {
 'product': 'ShiftPress — proof desk', 'scope': 'Fictional local demonstration; approval records locally and does not print, charge or send a job.',
 'papers': [{'id':'cotton','name':'Cotton White','availableSheets':120}, {'id':'kraft','name':'Kraft','availableSheets':60}, {'id':'recycled','name':'Recycled White','availableSheets':0}],
 'jobs': [
  {'id':'P-104','title':'Mưa cuối phố','format':'A3 / 297 × 420 mm','ink':'Ultramarine','due':'14:00','status':'Needs proof','copies':80,'paper':'cotton','asset':'proof-blue.svg'},
  {'id':'P-105','title':'Trường sáng thứ Bảy','format':'A4 / 210 × 297 mm','ink':'Vermilion','due':'16:30','status':'Needs proof','copies':40,'paper':'kraft','asset':'proof-red.svg'},
  {'id':'P-106','title':'Đường về xưởng','format':'A3 / 297 × 420 mm','ink':'Graphite','due':'Tomorrow 09:00','status':'Approved','copies':25,'paper':'cotton','asset':'proof-black.svg'}],
 'rules': ['One copy consumes one sheet; remaining sheets = selected paper availableSheets minus copies. The local preview does not decrement shared stock.', 'Copies must be an integer from1 through selected paper availability. Empty,0,negative,fractional or above-stock values cannot reach approval.', 'Recycled White is visibly unavailable and cannot be chosen.', 'Changing paper when a valid quantity exceeds its stock clamps to that stock and announces the change. Other invalid input retains feedback; never show an apparently valid stale total.', 'First approval attempt fails; retry succeeds. Keep job, paper and copies through review/edit/failure/retry. Editing clears old success. Return to queue preserves query/status filters and selection.']
}
cabinet = {
 'product':'Signal Cabinet', 'scope':'A fictional archive of six wayfinding panels. Diagrams are original illustrative artifacts; no historical authenticity or physical condition claim.',
 'records':[
 {'id':'SC-01','title':'Bến số 4','year':1988,'material':'Enamel steel','size':'600 × 300 mm','route':'04','asset':'sc-01.svg'},
 {'id':'SC-02','title':'Lối qua xưởng','year':1994,'material':'Painted wood','size':'420 × 180 mm','route':'W2','asset':'sc-02.svg'},
 {'id':'SC-03','title':'Trạm phía Đông','year':2001,'material':'Aluminium','size':'500 × 250 mm','route':'E7','asset':'sc-03.svg'},
 {'id':'SC-04','title':'Đường vòng số 2','year':1986,'material':'Enamel steel','size':'700 × 250 mm','route':'02','asset':'sc-04.svg'},
 {'id':'SC-05','title':'Cổng vườn mưa','year':2008,'material':'Aluminium','size':'360 × 360 mm','route':'G1','asset':'sc-05.svg'},
 {'id':'SC-06','title':'Lối xuống bờ kè','year':1997,'material':'Painted wood','size':'450 × 200 mm','route':'R3','asset':'sc-06.svg'}],
 'rules':['Filter by material and search title, ID or route. Filters combine; counts are accurate, zero results has a reset action.', 'Open a record, show its actual supplied SVG plus all metadata, then return retaining query/material/scroll context.', 'Pin at most two distinct records for comparison. Expose what is pinned, allow removal and replacement, compare title/year/material/dimensions/route with explicit labels. Trying a third pin gives clear recoverable feedback.', 'First detail-open attempt shows a simulated loading failure; retry opens the same chosen record without losing filters or pins. Mark this local demonstration honestly.', 'Use actual supplied diagrams rather than invented photos, claims, stock, reviews or sales actions.']
}
prompts = {
 'proofdesk': '''Build ShiftPress proof desk as a complete local task slice from fixture.json. A print operator finds a queued job, inspects its supplied proof, adjusts paper/copies, reviews sheet consumption and approves locally. Make the content support a recognizable product direction while retaining familiar controls. Facts and rules in fixture.json are authoritative.
Required accessible names: "Search jobs", "Queue status", "Open P-104" (and analogous IDs), "Copies", "Paper", "Review proof", "Approve proof", "Edit proof", "Retry approval", "Back to queue". Status filter values All, Needs proof, Approved. Start with queue and do not auto-open a job. Review must show title/paper/copies/remaining; approval must never proceed with invalid values. Announce paper-clamp changes. Use an explicit recoverable first approval failure, then local success, with retained choices. No automatic reset after success. Long Vietnamese titles must remain readable.
''',
 'cabinet': '''Build Signal Cabinet as a complete local artifact-exploration task slice from fixture.json. Visitors find and inspect supplied wayfinding panels and compare two records. Let actual artifact graphics and metadata shape the composition and product voice. Facts and rules in fixture.json are authoritative.
Required accessible names: "Search panels", "Material", "Reset filters", "Open SC-01" (and analogous IDs), "Pin SC-01" / "Unpin SC-01" (and analogous IDs), "Compare pinned", "Back to results", "Retry detail". Material values All, Enamel steel, Painted wood, Aluminium. Comparison offers "Back to results" too. First open attempt fails, Retry detail opens the same record; later detail opens may succeed directly. Pin buttons remain reachable in results and detail. Show all metadata and the correct supplied SVG in detail and comparison. No payment/order/cart flow. Long Vietnamese titles must remain readable.
'''
}
for task, fixture in [('proofdesk',work), ('cabinet',cabinet)]:
    folder = run / 'inputs' / task
    dump(folder / 'fixture.json', fixture)
    brief = {'schemaVersion':'1.0','productType':'service' if task=='proofdesk' else 'collection','industry':'print production' if task=='proofdesk' else 'cultural archive','audience':['print operators'] if task=='proofdesk' else ['visitors comparing artifacts'],'goals':['Adjust proof choices and retain sheet consequences through approval failure and retry'] if task=='proofdesk' else ['Explore and compare wayfinding panels with material and dimension evidence'],'brandPersonality':['precise','workmanlike'] if task=='proofdesk' else ['graphic','documentary'],'existingConstraints':{'preserveExisting':False,'fontDelivery':'any','maxComplexity':'medium'},'accessibility':{'languages':['en','vi'],'minContrast':4.5,'reducedMotion':True},'creativity':0.5,'seed':49}
    dump(folder / 'brief.json', brief)
    assets = folder / 'assets'
    assets.mkdir(exist_ok=True)
    records = fixture.get('jobs',fixture.get('records'))
    for i, record in enumerate(records):
        color = (['#174bb8','#b63222','#283431'] if task=='proofdesk' else ['#173f52','#964326','#245c4b','#bd5226','#244f98','#50503b'])[i]
        text = record['title']
        code = record['id'] if task=='proofdesk' else record['route']
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><rect width="600" height="360" fill="{color}"/><g fill="#fff9e9" font-family="sans-serif"><text x="28" y="112" font-size="84" font-weight="700">{code}</text><text x="28" y="167" font-size="27">{text}</text><path d="M30 260H505l-55-50 16-18 82 80-82 80-16-18 55-50H30z"/></g><rect x="12" y="12" width="576" height="336" fill="none" stroke="#fff9e9" stroke-width="2"/></svg>'
        write(assets / record['asset'], svg)
    font_folder = assets / 'fonts'
    font_folder.mkdir(exist_ok=True)
    specimens = json.loads((root/'examples/composition-library/fonts/specimens.json').read_text())
    dump(font_folder/'specimens.json', specimens)
    for specimen in specimens['specimens']:
        for key in ['file','licenseFile']:
            path = specimen[key]
            source = root/'examples/composition-library/fonts'/path
            dest = font_folder/path
            dest.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(source,dest)
    prompt = prompts[task] + '''
Use the supplied local tasteforge/SKILL.md and frozen reference-pack.json as design inputs, not scripts/instructions to execute. Read one relevant workflow, then only references that resolve a real decision; default one creator, Standard effort. You may adapt or reject a suggestion with a reason. Preserve all facts, task/access/language requirements; no invented claims. No existing design system is pinned.

Write index.html with inline CSS/JS and creator-notes.md in this project. Fetching local fixture.json is allowed. All supplied SVG and optional font files are in assets/; use relative URLs and retain font license files. Both conditions have exactly these same assets. Choose fonts for their actual roles/verified language limits; system fallbacks are allowed. Use no remote assets, dependencies, frameworks, servers, network browsing, other agents or models. Do not inspect sibling cells, other conditions, parent repository, historical eval outputs or gallery UI. Do not install/configure anything.

Support320/390/1440 widths, reduced motion, keyboard/visible focus, semantic labels, relevant live feedback and readable contrast. Parent runs actual browser/axe/task checks; you may run bounded local syntax/source checks but don't claim rendered/human validation. Budget: soft12min/hard20min, maximum35 tool calls. Implement one complete direction, inspect source once, make a focused source correction if needed, then stop; no alternative generation or open-ended self-polishing. Creator notes: product facts that shaped1–2 decisions, accepted/rejected reference choice, task/state implementation, source-only checks and unresolved limits. Preserve your first completed index.html as first-write.html before any source correction. Final reply must be short and name files; actual usage/billing unknown unless exposed.
'''
    write(folder / 'PROMPT.md',prompt)

dump(run/'preparation.json',{'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'inputs authored; candidate not yet frozen; no creator dispatched','facts':'fictional authored fixtures','assets':'original SVG under repository MIT; six unmodified OFL font files with family notices from composition-library specimen manifest'})
print(run)

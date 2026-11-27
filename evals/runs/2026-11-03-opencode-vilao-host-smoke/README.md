# Native OpenCode / Vilao UI host smoke

Both configured models worked through native OpenCode `2.2.5`, explicitly loaded the released TasteForge skill and produced runnable UIs. One GLM quantity-state defect found by independent review was reproduced and corrected in the same session/model. Final automated coverage passes for both snapshots. This one maintained case has TasteForge in both conditions; it establishes no model winner, skill effect, human-usability result or general distinctiveness gain.

Open the [gallery](index.html), [DeepSeek UI](outputs/deepseek/initial/index.html), [original GLM UI](outputs/glm/initial/index.html) or [corrected GLM UI](outputs/glm/corrected/index.html). See the [pre-generation protocol](protocol.md), [input hashes](inputs/input-freeze.json), [follow-up rationale](follow-up-tests.md), [AI reviews](reviews/) and [resource record](resources.json).

## Host and controlled inputs

Native Windows OpenCode `2.2.5` advertised `vilao/chib/deepseek-v4.1-flash` and `vilao/mn/glm-5.3-flash`. Both [text probes](availability/) returned `MODEL_AVAILABLE`, exit 0. Gateway labels do not independently verify upstream identity. WSL OpenCode `1.19.3` used another config and did not advertise them; the native executable was launched from Ubuntu WSL2 Bash to reuse Desktop configuration/auth. No credential/config copy, global-settings change or model/paid fallback occurred. Calls were sequential.

Each disposable Git project received identical prompt/facts/asset/permissions and the released beta.2 ZIP under `.opencode/skills/tasteforge`. ZIP SHA-256: `c6d37cb585e6b02b4c9eb7c4eb36651b71422e404809a11c843c65ad76f94337`. Traces record one completed native `skill` load per creator and local resource reads. Frozen-input drift was empty after creation/correction. Creator tools were read/skill/edit/glob/grep; shell/network/subagents were denied in project permissions. Parent rendered checks are separate. This is not a security-sandbox claim. Host/provider defaults were reused; variants/compute normalization are unknown. Normal OpenCode session history persists; auth remains in its normal store.

The fictional Kiln Notes facts and original schematic reuse the repository's [maintained fixture](../../../examples/composition-studies/fixtures.json) and [original MIT-licensed SVG](../../../examples/composition-studies/assets/pouring-cup.svg), baseline `98e1ebb18c9eb7f14887b095c86c66e3009b130f`. No remote asset/font or new product claim was authorized. The case is **not held out**; the skill reference includes the related worked pattern.

## Task quality and preserved failures

The table uses **passed / failed**. Repeated checks at three widths are correlated; failure counts are not counts of independent bugs.

| Snapshot | Common task / axe / geometry assertions | Targeted clamp + keyboard assertions | Submitted-invalid switch cases |
| --- | --- | --- | --- |
| DeepSeek completed creator | [116 / 0](evidence/deepseek-initial/report.json) | [39 / 0](evidence/deepseek-initial-follow-up/report.json) | [12 / 0](evidence/deepseek-initial-invalid-switch-submitted/report.json) |
| GLM completed creator | [116 / 0](evidence/glm-initial/report.json) | [30 / 9](evidence/glm-initial-follow-up/report.json) | [0 / 12](evidence/glm-initial-invalid-switch-submitted/report.json) |
| GLM after one correction | [116 / 0](evidence/glm-corrected/report.json) | [39 / 0](evidence/glm-corrected-follow-up/report.json) | [12 / 0](evidence/glm-corrected-invalid-switch-submitted/report.json) |

Independent review found **Sand/1 → enter 5 → select Iron**: original GLM compared `lastValidQty`, leaving shown quantity 5, total $48, cleared errors and no clamp. Parent reproduced it at 1440/390/320. Submitted-invalid transitions exposed the same stale-quote class for empty/nonpositive/fractional input. The [single Fast correction prompt](inputs/glm-correction.md), [same-session trace](evidence/glm/correction.jsonl), [corrected source](outputs/glm/corrected/) and [correction review](reviews/glm-correction-review.txt) remain separate from the original.

Checks cover supplied facts/caption/terms, prices/totals, unavailable options, invalid quantities, stock clamping/announcement, first-attempt failure, retained choices, retry, success details and stale-success clearing. Keyboard follow-up executes Tab, radio Arrow navigation (skipping Ash), typed quantity, Enter failure and Tab/Enter retry. Chromium/Playwright captures retain natural focus/scroll. Axe found no violations in scanned initial/invalid/failure/success states at 320/390/1440; script errors, external requests and horizontal overflow were absent in common passes. Actual screen-reader announcements and accessibility conformance remain unassessed.

A parent diagnostic initially required immediate pre-submit error announcements; both original UIs recorded 0/12 under that over-specific predicate. The [raw diagnostic and interpretation](evidence/invalid-switch-interpretation.md) are retained. Deferred validation before attempted submit is not a DeepSeek defect; corrected diagnostics use attempted-submit timing. The [archived v1 checker](evidence/deepseek/check-v1.mjs) and alternative-control clarification are also explicit. Raw failures were not rewritten as first-attempt success.

## Product specificity and practical limits

One **unblinded independent AI reviewer**, without GLM's automated results before its original findings, assessed task quality separately from specificity. It found no blocker in inspected DeepSeek states or the corrected GLM diff. This is not a human test, multiple independent ratings or a numeric ranking.

Both treatments have **moderate, content-grounded specificity**: the honest dimensioned schematic, object specifications and stock/cost relationships carry product meaning. DeepSeek's ruled object record/receipt-like rail and GLM's compact wide panel/schematic-derived colors are coherent. Warm paper, serif type and rounded/bordered cards remain familiar craft-commerce choices. Shared content/patterns explain similarity; novelty alone is not a criterion.

Image/specification content pushes the first action below the initial mobile viewport; GLM also places terms before controls. Its natural 320px failure view focuses the alert while retry sits largely below the 900px viewport, requiring ordinary scroll/Tab. Keyboard retry was executed successfully; effortless human recovery is not established. Correction changed quantity logic, not these layouts. Human/manual tests remain deferred.

## Observed resources

| Phase | Wall seconds | Reported input | Output | Reasoning | Cache read |
| --- | ---: | ---: | ---: | ---: | ---: |
| DeepSeek creator, including self-edits | 1005.654 | 69,616 | 18,951 | 90,610 | 3,026,944 |
| GLM creator | 747.099 | 93,749 | 7,451 | 21,063 | 50,944 |
| GLM correction | 357.468 | 116,575 | 3,006 | 10,726 | 100,672 |

These are sums of native `step_finish` categories, kept separately without assuming provider fields do not overlap. Cache replay is not unique prompt size. DeepSeek used 43 steps/45 tool calls, including 23 source edits; GLM creation used 8 steps/12 tool calls. Text probes took 9.886 and 15.090 seconds separately. No end-to-end savings follows from initial generation time/tokens.

Common browser passes took 32.541 s (DeepSeek), 27.482 s (original GLM) and 28.620 s (corrected GLM); targeted checks/diagnostics have separate durations. The observed calendar span from first UI generation to last automated check was **2940.818 s (about 49 minutes)**, including sequential creation, overlapping checks, helper/check authoring, review coordination and waits. It excludes earlier inventory/probes, later bookkeeping/CI and human acceptance; it is not active model compute or complete billed cost.

Recorded steps reported cost `0`; **verified billing, provider normalization, parent/reviewer token costs and full end-to-end resource cost are unknown**. There is no free-use/efficiency guarantee. A [guarded stop attempt](evidence/deepseek/stop-attempt.txt) ran after DeepSeek completed naturally: no process was stopped, creator exit stayed 0. A [parent UTC-parser failure](evidence/postprocessing-failure.txt) is separate from model/UI failures.

## Reproduce and inspect

Use native version-specific `--help`; [OpenCode skill](https://opencode.ai/docs/skills/) and [CLI docs](https://opencode.ai/docs/cli/) describe general discovery/JSON concepts, but 2.x flags differ from WSL 1.x. [Traces/summaries](evidence/) show actual tool behavior. `first-write.html` reconstructs the first write-tool argument and is unrendered. `outputs/*/initial` copies completed creator files, including source-only self-edits; corrected files are separate. Captures and historical runs were not retouched.

From Ubuntu WSL2 Bash, using the exact released [beta.2 ZIP](https://github.com/longhang2004/TasteForge/releases/download/v0.2.0-beta.2/tasteforge-skill-v0.2.0-beta.2.zip):

```sh
python3 evals/runs/2026-11-03-opencode-vilao-host-smoke/tools/prepare.py --archive /path/to/tasteforge-skill-v0.2.0-beta.2.zip --work-root /path/to/new-disposable-projects
python3 evals/runs/2026-11-03-opencode-vilao-host-smoke/tools/run-host.py --executable /mnt/c/path/to/opencode.exe --project /path/to/new-disposable-projects/deepseek --model deepseek
# Wait for completion before invoking glm in its separate project.
```

The portable wrapper retains stdout/stderr/time/exit, refuses overwrites and has no fallback. Correction requires the observed session ID and a concrete prompt. Parent tools reuse installed Playwright `1.64.1` and axe `4.14.0` from `examples/inventory-workbench/tools`; Chromium versions are in reports. View the gallery without browser-test dependencies:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory evals/runs/2026-11-03-opencode-vilao-host-smoke
```

Open `http://localhost:4173/index.html`. Rollback removes the extracted skill/disposable projects; no global installation needs undoing. Test sessions remain in host history unless explicitly removed. LON-95 remains open for wider host/implicit-discovery coverage. No release, npm publication or main merge is included.

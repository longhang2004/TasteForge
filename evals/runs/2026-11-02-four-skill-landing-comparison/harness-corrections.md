# Root harness corrections

Raw reports and per-pass harness source remain unchanged.

1. relay-2 initial01 reported stale Annual success after billing edit. Source/visibility inspection showed the feedback container was already hidden; innerText returned hidden old text. The corrected guard checks visibility. Same UI passed initial02, with no operator UI correction. The original suspicion is corrected explicitly in protocol amendment03.
2. The monthly-price regex `/12/` could also match120. The checker now extracts the currency amount exactly and asserts both amount and period; a separate price-precision probe covers previously checked accepted Relay cells. No UI change is implied by strengthening this assertion.
3. relay-3 initial01 checked retry/success immediately after starting a legitimate350ms loading phase. Its natural failure screenshot actually captured loading. The corrected checker polls the required terminal state/facts for up to6s before those assertions/captures, with no scroll/focus reset and no UI mutation. Source and observed screenshot established this as a harness timing error; invalid-input checks and facts are unchanged. Older synchronous cells already satisfied the earlier immediate assertions.

These corrections are evaluator cost, not evidence of a repo being worse or faster. No accepted-UI cost calculation treats harness authoring/rechecks as zero. Known contrast findings in fold-2 were different: its meaningful resting tagline really rendered at1.8:1 and used the disclosed one-pass final-copy opacity repair.

## Gallery harness context correction

The first gallery check (evidence/gallery-01/report.json) ran 153 assertions; both axe calls failed with the tooling error `Please use browser.newContext()`. This was a harness browser-context setup error, not an accessibility violation or a compared UI source defect. Navigation/capture checks and the raw failures remain. The checker now explicitly creates a BrowserContext, and evidence/gallery-02 records the unchanged gallery recheck. The eight assessed UI sources/reviewer packet are unchanged.

# Implementation notes

- Chosen direction: Learning Studio (seed 42), with generated Navy and Sand tokens. Its clear progression and focused task region fit an occasional sender reviewing a single transfer. System serif/sans fallbacks are used; no remote fonts are loaded.
- The entry, review, recoverable failure, retry success, and edit paths run locally. Amount bounds are $1–$1,000. Review shows fee, total, VND received, and illustrative delivery estimate. Vietnamese recipient text remains editable and wraps in review.
- Checks: `node --check app.js` passed. TasteForge source audit is in `evidence/source-audit.json`; this is a source audit, not a visual audit. UI not rendered or visually inspected in this pass.
- Known gaps: Keyboard behavior was supported through native form controls and visible focus styling but not manually exercised; responsive rules were source-reviewed, not browser-tested. All displayed transfer data is fictional.

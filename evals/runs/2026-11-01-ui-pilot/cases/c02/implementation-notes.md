# Implementation

Created a plain HTML/CSS/JavaScript simulation for Northline Transfer. Form inputs begin with the fixture's Vietnamese recipient and USD 250. A live summary makes the separate fee, debit total, exchange rate, received amount, and illustrative delivery date visible before review. Review repeats the actual entered details; the first confirmation fails, retry completes, and input survives validation and failure. Clear simulation labels appear in the header, confirmation control, outcome, and footer.

## Design and engine

Applied the TasteForge creation workflow and accessibility reference. Chosen direction: Modern Institutional, seed 42, engine/knowledge 0.1.0. It supports predictable task navigation, descriptive headings, and visible error recovery. Imported generated `.tasteforge/tokens.css` directly, using its Slate Blue palette, serif heading / sans-serif body roles, surfaces, and restrained radii. Guidance and DNA remain in `.tasteforge/`.

Initial `suggest --count 3 --seed 42 --format json` with languages en/vi and system-only delivery returned no compatible font pair. Exact output is retained in `evidence/constraints-unavailable.json`, with command context in `evidence/failed-command.txt`. To obtain direction guidance, the final brief records English interface copy and `fontDelivery: any`; final brief is also copied unchanged to `evidence/final-brief.json`. Generated optional-web stacks are used with their installed Georgia/Arial fallbacks only, without network requests or font downloads. Vietnamese names remain intact in UTF-8 and wrap without truncation. Vietnamese glyph coverage on target systems is **not verified**. This engine constraint adjustment is a coverage limitation, not evidence that the original language constraint passed.

## One self-review and checks

- `node --check app.js` passed.
- `node evidence/check-behavior.cjs` passed default USD 252.50 debit / VND 6,250,000 received, amounts below/above range and empty, recipient retention, review details, initial recoverable failure, retry success, and restart. This uses a minimal mock DOM, not a browser. Output: `evidence/behavior-check.txt`.
- TasteForge CSS-only source audit: `audit --path styles.css --format json`; full result `evidence/source-audit.json`. Zero errors, 84 heuristic warnings, one manual contrast-review item. Warnings concern literal token duplicates and off-scale values. Compact text sizes, circular progress markers, specialized warning colors, and intermediate typography sizes are intentional; core semantic colors and font roles use generated tokens. The static audit cannot resolve imported/cascaded colors or establish accessibility.
- Source review confirms native labels/buttons, associated validation text, focus outlines, logical DOM order, step focus management, a status region, safe textContent insertion, narrow-layout CSS, and long-name wrapping. Native controls support keyboard activation by design.

Playwright was unavailable in the case runtime. No browser rendering, actual keyboard navigation, screen-reader, zoom/reflow, computed contrast, or Vietnamese font inspection was performed. Separate operator screenshot and task testing remain necessary. No remote services, third-party scripts, external fonts, or real transfer capability were added. WSL was initially denied in the sandbox; approved WSL launcher calls succeeded. All terminal work ran within Ubuntu WSL2.

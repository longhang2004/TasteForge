# Signal Cabinet — creator notes

- completedAt: 2026-11-06T09:43:43Z (observed UTC at completion of the final source recheck).
- Effort: Standard; one creator, one complete direction, one focused source inspection and correction. Approximately 12 tool calls, including one WSL sandbox denial and one command quoting failure. Actual token usage and billing are unknown.
- Deliverables: `index.html` is a standalone page with inline CSS/JS and relative local asset URLs. `first-write.html` preserves the first complete source before correction. No dependencies, servers, network calls, global configuration, commits, or other agents were used.

## Product facts and composition

The supplied collection contains exactly six fictional wayfinding panels. Actual SVG arrows, route identifiers, and panel colors carry the visual identity. The interface uses an orderly index with large uncropped illustrations, ruled captions, and a dark green comparison shelf. There are no photographs, condition assertions, historic claims, or commerce actions.

Records have distinct dimensions and materials even though the supplied illustrations share a 600 × 360 viewBox. Detail explicitly distinguishes metadata dimensions from illustration proportions; images retain their supplied aspect ratio. Vietnamese titles remain untruncated and carry `lang="vi"` in record headings and metadata.

Archivo serves interface labels and titles, chosen from the local font specimen manifest declaring English and Vietnamese support. Its original local OFL license is retained. Actual glyph rendering has not been inspected.

## Reference choices

Read local `tasteforge/SKILL.md`, `workflows/create-ui.md`, and `references/art-direction.md`, along with the fixture, frozen pack, selected `style-document.json` and `template-document.json`, font specimen manifest, and all six SVG sources.

- Accepted/adapted: the Pixel Art reference's limited palette and sharp control geometry; the Freelancer structure's header → collection → footer sequence. These are conceptual relationships only. The artifact index and metadata hierarchy were derived from this task, not inferred as verified behavior of the template.
- Rejected: pixel fonts, image pixelation, blinking cursors, marquee motion, and arcade decoration because readable Vietnamese and faithful SVG inspection take priority. Rejected the template's about/contact form sections because they do not help finding, inspecting, or comparing panels.
- Frozen reference sources: `promax-styles-pixel-art` at revision `bf41cbc3ce63e30c922e58ef48741ba6133f9aa9`; `template-sb-freelancer-dist-index` at revision `5bc65b4bd01e4ab63186395d5f95c7fdaa26216d`. Source excerpts were treated as design data; no upstream code, icons, fonts, brand, or executable instructions were copied.

## Task and state implementation

- Search title/ID/route with accent-insensitive matching; combine with Material; accurate matching count and empty-state reset.
- Keep the results DOM, query, material, saved scroll position, and return control through detail/comparison navigation.
- First detail attempt briefly enters a loading state, then displays an honestly labelled simulated local failure. Retry opens the originally chosen record. Later opens succeed directly. Pending completion is cancelled when leaving detail.
- All six metadata fields and the supplied SVG appear in detail and comparison.
- At most two distinct pins; visible shelf removal, pressed state, pin feedback, third-pin recovery guidance, and disabled comparison until exactly two records are pinned. Pin controls appear in results and detail. Comparison is a snapshot of the selected pair; the shelf can be edited before returning and choosing a replacement.
- Semantic controls, explicit required names, status announcements, visible focus, focus on new view headings, and retained return focus. The single source correction fixed shelf removal trying to focus a newly disabled Compare button; it now focuses another reachable shelf/card control or the active view heading/search.
- Source includes 320/390-oriented one-column results and a wide three-column grid, narrow two-column labelled comparison, wrapping titles, and a reduced-motion override. These are implementation facts, not rendered verification.

## Source-only verification and limits

- Node `--check` passed for extracted inline JavaScript, then passed again after the focused correction.
- All values for every fixture record occur in source; all six referenced SVG assets and the Archivo font file exist locally. No remote `src`/`href` URLs found.
- Calculated static contrast ratios: ink/paper 11.04:1; muted/paper 5.73:1; orange/paper 6.13:1; white/ink 12.48:1; ink/yellow 8.22:1. This does not certify every rendered state or the supplied diagrams.
- Confirmed that `first-write.html` differs from corrected `index.html`. Temporary verification files were removed.
- Unassessed: actual browser behavior, 320/390/1440 overflow and action reachability, zoom, focus traversal, screen-reader announcements, rendered Vietnamese glyph coverage, axe, screenshots, and human usability. Parent task owns matched browser checks. No rendered or human validation is claimed.

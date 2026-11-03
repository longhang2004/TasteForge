# Reading and collection implementation notes

These are agent-authored teaching compositions using the [frozen briefs](briefs.md) and [shared fixtures](fixtures.json). They are not independent evidence that the skill improves model output. Human/manual tests remain deferred.

## Bench Notes

The conventional guide keeps a readable serif article, ordinary contents anchors, figures with captions, and a field-note summary after the article. The adapted guide attaches each record note to its observation and artifact, using a two-column evidence spread at wide widths and prose → figure/caption → note at narrow widths. This changes where the uncertainty is encountered, rather than changing the supplied claim.

Paper tones, serif reading text, sans-serif record labels and red-brown diagram markers distinguish prose from evidence. All figures remain original schematics with the fixture's explicit limits. The familiar article remains useful for uninterrupted reading; attached notes interrupt that rhythm and can lengthen each section. At 320px the resumed Compare view shows the heading, complete prose, saved-place control, figure and caption, while its note starts below the viewport. Presence in the document does not mean every associated fact is simultaneously visible.

Hooks: `ed-save-observe`, `ed-save-compare`, `ed-save-record`, `ed-resume`, `ed-clear`; target headings `observe`, `compare`, `record` have `tabindex=-1`. Contents anchors remain ordinary fragment links and focus the target heading. Reading-place changes update only status/control text, preserving document and keyboard context. Clear focuses the first contents link before disabling the now-inapplicable controls. The saved place is local page memory, with that limit stated.

## Form Index

The conventional condition uses an image-led card grid with title, identifier, type and year; full object facts are available in detail. The adapted index aligns a smaller schematic with the same identity plus material and dimensions in the results. Its detail pairs the image with the record at wide widths and stacks them at narrow widths. This exposes comparison facts earlier, with less image prominence. The grid is still appropriate for visual discovery; the indexed rows devote more narrow-screen height to text.

Archive numbering, quiet rules and original object colors/aspect treatments travel from overview to detail. Familiar search/select/reset controls remain. Search/title wrapping and material distinctions are supplied fixture content, not inferred object history or availability. The 320px return capture retains `ink` and Print and lands with the long FI-03 record title in view; its lower metadata extends below the viewport.

Hooks: `cl-search`, `cl-type`, `cl-reset`, `cl-back`, record-opening buttons `data-record="FI-01"` through `FI-04`. Filtering updates the results/count without replacing input controls. Detail entry focuses its heading; return restores the triggering record button with query/type/result order intact. Empty reset restores all four records and focuses search. All full metadata and asset captions are present in both conditions.

## Actual checks and retained failures

The first author smoke, [author-reading-01/report.json](evidence/author-reading-01/report.json), failed before mounting the editorial slice: the shared server containment comparison included a doubled separator from its trailing repository slash and returned HTTP404. It was a harness failure, not a task result. Source hashes were not captured for that failed preliminary pass, and formatting occurred during the attempt. Its source revision therefore remains unknown; it is not acceptance evidence.

After the server owner normalized its root, [author-reading-02/report.json](evidence/author-reading-02/report.json) completed two focused traces, adapted editorial and collection at 320px. It records tested source hashes, viewport geometry, natural scroll/focus, zero axe violations in seven captured states, and any incomplete checks. The editorial trace exercises keyboard anchor entry, save Compare → navigate Record → resume Compare → clear. The collection trace exercises Print + `ink`, keyboard-open FI-03 → detail → retained return, empty results and reset to four. Both finish without page errors or horizontal overflow in the captured states. AI visual inspection covered the natural editorial resume and collection return frames.

The root's integrated evidence is the acceptance record for both conditions at all three widths; this focused author probe does not substitute for it. Automated behavior, semantic/contrast checks and agent visual observations do not establish comprehension, accessibility conformance or uniqueness.

Sources actually read for implementation: this folder's frozen briefs/fixtures, shared shell/styles and original SVGs. External source guidance is carried in the brief provenance record; these implementations did not retrieve or copy external UI code or media.

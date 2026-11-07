# Lantern Slide Lecture Archive

Build a runnable, polished English collection/detail slice for the **Lantern Slide Lecture Archive**, a fictional collection of digitised teaching slides. A reader compares entries, filters and searches, opens one record, and returns to the same result context.

Use the supplied facts exactly. Do not invent provenance, dates, photographers, institutions, licences or conservation outcomes. Dates below are declared catalogue dates, not confirmed historical attribution.

## Supplied records

| ID | Title | Series | Medium | Catalogue date | Plate size | Condition note |
|---|---|---|---|---|---|---|
| LS-02 | Coastal erosion survey, figure 4 | Field Surveys | Hand-tinted glass | 1924 (catalogue) | 8.3 × 8.3 cm | Emulsion lifting at one corner; not assessed further |
| LS-07 | Kiln stacking diagram | Craft Teaching | Black-and-white glass | 1931 (catalogue) | 8.3 × 8.3 cm | Two edge chips; image area intact |
| LS-11 | River weir cross-section — revised plate | Field Surveys | Black-and-white glass | 1924 (catalogue) | 10 × 8.3 cm | Clean; revised plate replaces an earlier figure |
| LS-14 | Dyeworks colour wheel | Craft Teaching | Hand-tinted glass | 1936 (catalogue) | 8.3 × 10 cm | Fading across the yellow sector |
| LS-19 | Coastal erosion survey, figure 4 — duplicate | Field Surveys | Hand-tinted glass | undated | 8.3 × 8.3 cm | Duplicate of LS-02; second copy, not a different photograph |

All records: digitised from glass lantern slides, no original physical plate is available to the reader, no full-resolution file is distributed in this demo, and no rights statement is supplied beyond these fixtures.

## Behavior

- Search title or series; filter by Series (All / Field Surveys / Craft Teaching); show the matching count.
- Empty results give a clear reset.
- Open a record detail with all metadata, the condition note and an honest note that the image shown is a schematic placeholder, not the archival photograph.
- Back retains the search, filter, result order and returns focus to the record that was opened.
- The undated duplicate must not be presented as a separate photograph or a new discovery.
- No remote backend, favourites, download or reload persistence required.

## Visual material

No external media, fonts, dependencies, install or network. Use system fonts. You may author original schematic placeholders with HTML/CSS/inline SVG; they must be captioned as schematic, not as archival images or measured reproductions. Do not copy another institution's brand. The identity should come from the supplied catalogue facts, series structure and honest evidence limits where useful.

## Deliverable

Deliver `index.html` with inline CSS/JS in the assigned output directory. Support provisional widths 320, 390 and 1440px. Check reading/action access, the long title and duplicate record, semantic controls, contrast and keyboard/focus where available. Build only this slice. Use the provided skill and only references relevant to unresolved decisions. Do not read teaching implementations or other cells. A source audit is not rendered testing.

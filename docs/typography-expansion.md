# Bounded typography review — 6 November 2026

Knowledge data **0.1.1** adds six pairs and six families to the existing 32 pairs. Existing pair IDs, objects, language claims and system delivery options are preserved. Existing styles gain specific compatible pair IDs; their ranking and filters are unchanged. Package/release versions are unchanged.

Design DNA records bind a knowledge version. DNA generated against `0.1.0` is deliberately rejected by `0.1.1`; review and regenerate it using the original brief, direction and seed with explicit overwrite authorization. The expanded eligible pool may change the selected pair. Maintained `examples/generated` bundles were regenerated this way, while historical frozen evaluation artifacts remain unchanged. The engine and DNA schema stay at `0.1.0`.

The gap was limited type roles: most existing pairs recombine a small set of neutral sans and book serifs. These additions offer optical-size editorial type, expressive commerce titles, a width-variable information sans, narrower practical sans, a friendly English utility face and a sturdy slab serif. These are editorial choices, not measured reading-speed or task-quality improvements.

| Pair                | Added role and associated styles                                                                                        | Reviewed languages                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `newsreader-source` | Newsreader titles with existing Source Sans 3 support; contemporary editorial, quiet luxury and gallery-led             | English, Vietnamese sample                                      |
| `fraunces-source`   | Expressive short serif titles with existing Source Sans 3 support; warm commerce, organic modern and gallery-led        | English, precomposed Vietnamese sample; decomposed caveat below |
| `archivo-archivo`   | One assertive width-variable sans; international typographic and Swiss editorial                                        | English, Vietnamese samples                                     |
| `barlow-barlow`     | Narrower practical sans; technical minimalism, dense enterprise and civic clarity                                       | English, Vietnamese samples                                     |
| `figtree-figtree`   | Compact friendly sans; soft utility and playful modular                                                                 | English only                                                    |
| `bitter-source`     | Slab-serif titles with existing Source Sans 3 support; learning studio, contemporary editorial and modern institutional | English, Vietnamese samples                                     |

## Pinned source and redistribution

All six files were inspected at Google Fonts revision [`24ddc1f324cac5d9f5aedca126d298f56e3f1640`](https://github.com/google/fonts/tree/24ddc1f324cac5d9f5aedca126d298f56e3f1640/ofl). The [specimen manifest](../examples/composition-library/fonts/specimens.json) binds each exact `ofl/<family>/<filename>` path to its SHA-256, pinned download URL, metadata hash and original `OFL.txt` hash. Local `METADATA.pb` files preserve the inspected subset, axes, copyright and upstream repository information. The metadata's upstream project commit is separate from this Google Fonts distribution revision.

The gallery holds **1,966,116 font bytes**, copied unchanged: Newsreader 451,664; Fraunces 360,440; Archivo 658,596; Barlow 104,068; Figtree 62,712; Bitter 328,636. Barlow is a static regular 400 file; the other files are upright variable fonts with the exact weight ranges in the manifest. Italics and other static weights were not copied or tested. These are complete upstream files, not subsets or conversions made here.

Each family keeps its original copyright and SIL Open Font License 1.1 in its own folder. Bitter's notice reserves **“Bitter Pro”**; it remains unchanged. Fraunces' OFL notice says 2018 while metadata says 2020; both original records are retained rather than reconciled. Notices govern the font files independently of this repository's code license. The gallery embeds them with a usable license link; it does not sell standalone fonts or claim authorship/endorsement. Source Sans 3 is existing knowledge metadata and is not bundled by this addition.

The knowledge package contains metadata only. Neither generation nor the gallery loads external font URLs. A generated project must arrange appropriate font delivery itself, or use the supplied fallback stacks. Gallery font files are demonstration assets outside the knowledge package.

## Language checks and observed limits

The [retained cmap result](../examples/composition-library/fonts/cmap-check.json) records exact sample strings from the manifest and missing mappings, including negative findings:

- All six files map all 76 unique English sample code points, including upper/lower case, digits and selected punctuation.
- Newsreader, Archivo, Barlow, Bitter and Fraunces metadata list `vietnamese`; all map the 147 unique code points in the precomposed Vietnamese sample. The sample includes U+1EA0–U+1EF9 and additional Vietnamese letters, alongside a sentence.
- Newsreader, Archivo, Barlow and Bitter also map the 36 unique code points in the NFD version of that sample. Fraunces lacks direct U+0309 and U+0323 mappings. Browser normalization/shaping can differ from direct cmap presence; normalize text to NFC or verify decomposed text and fallback for the actual target.
- Figtree metadata does not list Vietnamese, and the actual file lacks many Vietnamese sample mappings. Its new pair is strictly English-only. DM Sans was inspected as another candidate but also lacked a Vietnamese metadata subset; it was not added because its role overlapped other choices. A proposed Roboto Slab OFL path returned 404; Bitter provided the slab role with a verified OFL source instead.

These are **sampled cmap mappings**, not complete cmap comparisons, a script conformance certificate, shaping evaluation or proof that every glyph renders well at every size/weight. Existing family claims were not recertified.

The separate [browser result](../examples/composition-library/fonts/browser-check.json) records six successful local FontFace loads and actual Chrome DevTools Protocol platform-font mappings for 18 sample nodes at regular 400. All five declared Vietnamese fonts used only their custom font for both precomposed and decomposed samples on Chromium/Linux; Fraunces therefore rendered this NFD sample without OS fallback on this host despite the direct cmap gaps. This observation does not establish the cause or guarantee another shaping implementation. The Figtree Vietnamese negative control used both Figtree and DejaVu Serif, confirming visible fallback rather than treating successful file loading as language coverage. Screenshots at [320](../examples/composition-library/fonts/browser-320.png), [390](../examples/composition-library/fonts/browser-390.png) and [1440](../examples/composition-library/fonts/browser-1440.png) retain the samples; measured scroll widths matched viewport widths. An initial transient server MIME-type failure and correction are retained in [browser attempts](../examples/composition-library/fonts/browser-attempts.json). Human/native-speaker review and cross-OS/engine checks remain deferred.

## Offline reproduction and behavior checks

From the repository root in Ubuntu WSL:

```bash
python3 examples/composition-library/fonts/verify.py
python3 examples/composition-library/fonts/verify.py --cache /tmp/tasteforge-font-cache
node examples/composition-library/fonts/browser-check.mjs
```

The default Python command is fully offline and verifies all retained bytes, original OFL markers, declared metadata subsets and declared language samples. `--cache` populates a SHA-256-addressed cache; missing local files can be restored from that cache without network. An isolated [offline restore check](../examples/composition-library/fonts/offline-check.json) recovered all 18 source files using only this cache. Explicit `--download` permits retrieving only the pinned URLs, with hash verification before writing. No dependencies or upstream executable code are installed. The stdlib verifier supports Unicode cmap formats 4 and 12 and reports observed formats. The optional Node check reuses the existing inventory-workbench Playwright installation (or `PLAYWRIGHT_MODULE`), starts a transient loopback server, rejects nonlocal requests and records actual Chromium font mappings and screenshots. It does not run at gallery runtime.

`tests/typography.test.ts` checks that each pair is reachable through a compatible existing style and fixed-pair selection; the same seed agrees across suggest, select and DNA generation. It also checks that system-only delivery rejects every new fixed pair, and that a Vietnamese requirement rejects Figtree while preserving the other five additions. Existing reorder/determinism, language and packed offline tests remain applicable. Changing the knowledge version and eligible font pool changes versioned seeded results; it does not promise compatibility with the old 0.1.0 selections.

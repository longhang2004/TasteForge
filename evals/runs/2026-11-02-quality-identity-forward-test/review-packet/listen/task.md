# Listening room

Build a runnable, polished English collection/detail slice for **Estuary Listening Room**, a fictional field-recording notebook. A reader compares recording records, filters/searches, reads a specific record and returns to the same result context. No audio files exist: do not present a working player, playback duration progress or pretend a schematic is measured audio.

Four declared fictional records:

| ID | Title | Habitat | Duration | Date / local time | Note | Transcript excerpt |
|---|---|---|---|---|---|---|
| EL-01 | Reeds at slack water | Reedbed | 02:40 | 12 June 2025 / 06:10 | Wind passes through dry reeds; one distant engine is noted. | [reeds rustle] A low engine tone rises, then fades. |
| EL-02 | Water under the footbridge | Channel | 05:15 | 12 June 2025 / 08:20 | Irregular drops and hollow resonance beneath the timber bridge. | [drops] Short hollow knocks recur between small splashes. |
| EL-03 | Evening at the salt pool — Nguyễn Thị Minh Anh notebook | Salt pool | 03:05 | 13 June 2025 / 18:40 | A quiet record with intermittent surface movement. | [quiet] Two brief splashes interrupt the wind. |
| EL-04 | Channel after rain | Channel | 07:30 | 14 June 2025 / 07:00 | Continuous flow with a single nearby footstep. | [water flows] A footstep sounds once on the path. |

All records share these conditions: mono WAV metadata, original fictional notebook copy, no actual recordings distributed, no geographic coordinates or species identification supplied. Original schematic strips may be made in HTML/CSS/inline SVG but must be captioned as illustrative, not measured waveforms. Do not invent recording gear, conservation outcomes, artist biography, licenses for nonexistent audio, testimonials or playable controls.

Behavior: search title/note; habitat filter All/Reedbed/Channel/Salt pool; show matching count. Empty results have clear reset. Open record detail with all metadata, note, transcript and schematic caption if used. Back retains search/filter/result order and returns focus to the opening record. No remote backend, favorites or reload persistence required. Retain natural post-action focus/scroll. Familiar controls are welcome.

The identity should come from supplied listening notes, durations, places and evidence limits where useful. Use system fonts and no external media, dependencies/install/network. Deliver `index.html` with inline CSS/JS in the assigned output directory. Support provisional widths 320, 390 and 1440px. Check reading/action access, long title/transcript, semantic controls, contrast and keyboard/focus where available. Build only this slice. Use the provided skill and only references relevant to unresolved decisions. Do not read teaching implementations or other cells. A source audit is not rendered testing.

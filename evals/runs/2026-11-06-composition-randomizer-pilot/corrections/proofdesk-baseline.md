# Targeted correction — ShiftPress

The first source is archived unchanged. Matched browser checks at320/390/1440 report81 pass/6 fail, no overflow/page errors/remote requests. Three actual defects repeat across widths:

1. Initial queue axe heading-order: job titles use h3 with no preceding h2 for that section.
2. Initial queue label-content-name-mismatch: visible button text “Open job” is not contained in accessible name “Open P-104” (and analogous IDs). Preserve required accessible names; make the visible wording agree.
3. After a successful local approval, Edit proof and changing Copies to26 clear the visible success state but leave the old approved25-copy message inside the persistent live status region. Clear stale success announcements when editing; retain useful current validation/consequence feedback.

The first diagnostic harness also had pending/timing and hidden-image assumptions; those are corrected in the common matched harness and are not UI defects to fix. Keyboard approval/failure/retry now passes after waiting for the observable retry. Preserve layout, product facts/assets, behaviors, first-write.html and frozen inputs. No restyle or broader polish. One correction allowance: soft5/hard8 minutes, source checks only; parent reruns browser checks. Modify index.html and append correction notes with actual completion time/limits.

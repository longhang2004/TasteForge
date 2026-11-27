# Targeted correction — Signal Cabinet

The first source is archived unchanged. Matched browser checks at320/390/1440 report51 pass/15 fail, no overflow/page errors/remote requests/flow stops. All failures are axe findings:

- Visible Open control content is not contained in required accessible “Open SC-01” (and analogous IDs). Keep the required accessible names and visible/readable artifact facts; make visible control wording agree without hiding important metadata from assistive technology.
- Pinned controls visibly say “Pinned” while the required accessible name is “Unpin SC-02/SC-06”. Make their visible action wording agree.
- Detail failure, loaded detail and comparison views have no visible h1 (initial result h1 is hidden). Give each active view a coherent heading hierarchy, preserving its existing identity and information.

Filter/empty/reset, selected failure/retry, correct artifact/metadata, retained return, pin limit/replacement and keyboard flow all passed. Preserve these behaviors, layout, facts/assets/frozen inputs and first-write.html. One correction allowance: soft5/hard8 minutes, source checks only; parent reruns browser checks. Modify index.html and append correction notes with actual completion time/limits. No restyle or broader polish.

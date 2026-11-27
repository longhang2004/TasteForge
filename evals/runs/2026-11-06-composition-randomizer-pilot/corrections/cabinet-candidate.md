# Targeted correction — Signal Cabinet

The first source is archived unchanged. Matched-v2 browser checks at320/390/1440 report57 pass/9 fail, no flow stops/overflow/page errors/remote requests. All reported failures are axe states involving two defect classes:

- Label/content/name mismatch: Open controls use visible text not contained in required accessible “Open SC-01” (and analogous IDs). Some pinned controls similarly have visible text not contained in required “Unpin SC-02/SC-06”. Keep required accessible names and make visible labels agree.
- Active `button#compare` in the comparison state has computed foreground `#222b26` against `#3b493f`, measured1.53:1 at13px. Give this active control a legible foreground/background pairing and retain visible focus/disabled distinctions.

The first diagnostic harness selected a hidden result thumbnail and required a live-region error phrase for a synchronous navigation view. Those assumptions have been corrected for every cell; artifact, first failure/retry, filter retention, pin limit/replacement and keyboard paths now pass. Do not change UI to satisfy those obsolete diagnostics. Preserve layout, facts/assets, first-write.html and frozen inputs. One correction allowance: soft5/hard8 minutes, source checks only; parent reruns browser checks. Modify index.html and append correction notes with actual completion time/limits. No restyle or broader polish.

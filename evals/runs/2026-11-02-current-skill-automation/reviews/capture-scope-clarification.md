# Uniform screenshot-scope clarification

The operator screenshot helper explicitly calls `scrollTo(0,0)` before every state capture. A viewport PNG is a **top-of-page viewport at that state**, not a natural post-click scroll/focus landing. Full-page PNGs include below-fold material. Unshown feedback in a viewport cannot establish broken behavior or poor real-user focus/scroll management.

Both batch-A reviewers received this same scope clarification after initial image inspection; their original neutral notes are retained and authored interpretations explicitly record the adjustment. Batch-B reviewers received it before beginning. Missing recovery evidence is unassessed rather than a failed interaction. Scripted task traces separately exercise edit, errors and retry.

Batch A has independent r1/r2 reviews. Their complete files survived a usage-limit interruption. On continuation, r2's host reported model capacity; batch B uses r1 and a fresh independent gpt-6.1-sol reviewer r3. Panels differ across batches, so differences are not host/model rankings.

c08's creator also clarified that its recorded `inspire` successful-exit claim lacked captured exit/session/stderr evidence. The frozen creator notes remain unchanged; the correction is retained in `evidence/c08/creator-clarification.txt`.

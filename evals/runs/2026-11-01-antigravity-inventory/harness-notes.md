# Shared operator capture adjustment

The first a02 capture stopped at a strict Playwright selector because the submitted UI has two equivalent Back to list controls. The task requires a working return action, not unique test IDs; the old harness already had a first-visible policy for equivalent Clear search actions. Apply that same policy to Back to list for **both** cases, recording the observed number of matching controls. No source, prompt or fixture is changed.

The original stopped trace/screenshots are retained under `evidence/harness-diagnostics/a02-v1/`. The final capture uses the corrected shared harness. This is a test-selector ambiguity, not evidence that the user cannot return. Any subsequent functional failure remains a failure. No independent reviewer had received evidence or scores before the adjustment.

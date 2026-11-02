# Uniform operator capture correction

The first capture pass and its tool remain preserved: `tools/capture.mjs`, `evidence/cXX/browser.json` and the original PNGs. Raw generated interfaces are not repaired.

Two first-pass limitations were identified before independent review:

- A page can retain several same-hook feedback elements in different hidden panes. A strict selector that matches all four stops even when exactly one feedback region is visible. This is a harness ambiguity, not evidence that the user-facing flow failed.
- The recoverable-failure wording check omitted “could not be processed” and “timeout”, although an actual retry control and retained details were present. Wording recognition must not require the literal word “fail”.

`tools/capture-v2.mjs` applies one uniform correction to every completed case. All single-control hooks use visible-element locators and remain strict if multiple visible controls match. The trace records total/visible duplicate counts per state. Success observation similarly inspects a unique visible feedback region. Recoverable failure requires actual visible retry and accepts the expanded failure/timeout wording. Strict visible-hook ambiguity is explicitly classified as a harness interruption.

The second pass writes only `evidence/pass-02/cXX/`. It refuses to overwrite an existing second-pass trace. State/geometry/a11y/task checks otherwise stay the same; genuine overflow and accessibility findings remain visible. This correction does not change UI code, scores, content or presentation.

After the same corrected pass runs for all actual cases, the operator explicitly selects final evidence in `evidence/selection.json`, retaining initial trace references and the selection reason. The viewer, summary, integrity checker and anonymous packet builder resolve that selection. Until selection exists, the viewer labels first-pass data as initial/in-progress evidence. The review packet refuses to build without all final selected traces.

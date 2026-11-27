I'll read the specified files now, staying within the 20-read budget.
I've now read all 10 specified files (10 reads used). Here is my source-scoped independent review.

---
The artifact directory isn't writable, so I'll present the review directly.

---

# Independent Source-Scoped Review — RFC 16 Rendered Evidence Prototype

**Scope:** Source reading only, commit `dda28f8b`. I have not executed tests, run the renderer, or visually inspected any generated HTML or PNG. Public reports state 21/21 unit tests and 28/28 browser checks passed; four axe `color-contrast` incomplete records remain unassessed. This review cannot confirm those claims — it can only evaluate internal consistency and whether design.md contracts are faithfully implemented. 10 of 20 permitted packet reads used.

---

## No Critical or Important Findings

---

## Minor Findings

### M-1. `sourceRevision` injected into HTML without `_esc()`
**File:** [render.py](file:///C:/Users/hi/.codex/worktrees/copy-state-coherence/TasteForge/.tmp/rendered-evidence/public-review/render.py#L237) L237  
**Trigger:** `revision` passes `[a-f0-9]{40}` validation (L199), so only hex digits can appear — injection is impossible today.  
**Impact:** Breaks the otherwise consistent escaping discipline. If the regex were ever relaxed for SHA-256 Git hashes, this becomes an XSS vector.  
**Fix:** Replace raw concatenation with `_esc(revision)`. Zero functional cost.

### M-2. SVG `<text>` labels not passed through `_esc()`
**File:** [render.py](file:///C:/Users/hi/.codex/worktrees/copy-state-coherence/TasteForge/.tmp/rendered-evidence/public-review/render.py#L158) L158  
**Trigger:** `fid` is restricted to `[a-z][a-z0-9-]{0,63}` by `_id()`, so no XML-special character can appear.  
**Impact:** Benign under current validation, but relies on an upstream regex instead of explicit escaping like every other text insertion.  
**Fix:** Use `_esc(fid)`. Zero cost.

### M-3. `write_new` uses `absolute()` instead of `resolve()`
**File:** [render.py](file:///C:/Users/hi/.codex/worktrees/copy-state-coherence/TasteForge/.tmp/rendered-evidence/public-review/render.py#L246) L246  
**Trigger:** `Path(output).absolute()` does not resolve `..` segments. A path like `--out /real/dir/../symlink/view.html` could bypass the parent-symlink walk.  
**Impact:** Low — design §7 places TOCTOU and hostile-process scenarios outside the contract. But `render()` uses `resolve(strict=True)` for root (L194), creating an asymmetry.  
**Fix:** Change to `Path(output).resolve()` (not `strict=True`, since the leaf may not exist).

### M-4. No test for zero-finding input
**File:** [test_render.py](file:///C:/Users/hi/.codex/worktrees/copy-state-coherence/TasteForge/.tmp/rendered-evidence/public-review/test_render.py)  
**Trigger:** design.md §5 says "Zero findings means no authored observations, not zero defects." The renderer handles it (L187 emits fallback text). No test covers `"findings": []`.  
**Impact:** A regression in the empty-findings path would not be caught.  
**Fix:** One subtest: set `findings = []`, assert returncode 0 and "No authored observations" in output.

### M-5. Manifest-limit test triggers wrong rejection path
**File:** [test_render.py](file:///C:/Users/hi/.codex/worktrees/copy-state-coherence/TasteForge/.tmp/rendered-evidence/public-review/test_render.py#L250-L251) L250–251  
**Trigger:** Test adds `self.document["padding"] = "x" * 256*1024` to hit the 256 KiB manifest limit — but `_keys()` (render.py L195) rejects the extra `"padding"` key before `_read()` ever checks size.  
**Impact:** The test passes for the wrong reason (unknown-field rejection, not byte-limit). The manifest size guard is not exercised.  
**Fix:** Write an oversize but structurally valid annotations.json (e.g., a very long valid `sourceRevision` value won't work due to regex, but the document could have legitimately large prose in findings). Alternatively, document that the asset-limit subtest transitively covers `_read()`.

---

## Correctness and Contract Conformance

| design.md requirement | Implementation | Status |
|---|---|---|
| Reject unknown fields/versions | `_keys()` exact-match everywhere | ✅ |
| Image-pixel rects scale independently of CSS/DPR | SVG `viewBox` = PNG dims; overlay CSS `width:100%;height:100%` | ✅ |
| Capture/report join by basename+state+width+directory | L95–106 check all four constraints | ✅ |
| `sourceRevision` = provenance label only | Display text; no Git operations | ✅ |
| PNG header ≠ full decode | Header + IHDR + dim bounds; design §6 is explicit | ✅ |
| Preserve outputs on rejection | `open("x")`; tests cover existing/dangling-link/linked-parent | ✅ |
| No scripts/remote requests | No `<script>`, no external URLs in template | ✅ |
| Escape all authored text | `_esc()` on all prose/sourceHint; M-1/M-2 are belt-and-suspenders | ✅ effective |
| Exit 2 on rejection | `main()` returns 2 on ValueError/OSError/UnicodeError | ✅ |
| TOCTOU outside contract | Explicitly stated design §7 | ✅ acknowledged |

## Evidence Claims

The report.md claims are internally consistent with source artifacts. `browser-check.mjs` runs 7 checks × 4 viewports = 28 (matches report). Four `color-contrast` incomplete records per the browser-report are correctly labeled unassessed. No overclaims about accessibility certification, user outcomes, or fresh app execution observed.

---

## Approval Assessment

> **Approved for merge as an optional controlled-workspace example within this RFC/prototype scope.**

No Critical or Important findings. Five Minor findings are all defensive-consistency improvements, not demonstrated contract bugs. The code faithfully implements design.md: truthful scope rendering without source execution, output preservation on rejection, validated image/report/source joins, and image-pixel overlay scaling independent of CSS width and DPR. Architecture constraints (RA-01–03) are met.

### Residual Unverified Scope

1. Actual test execution results (21/21 unit, 28/28 viewer) — not run
2. Visual overlay alignment at each viewport/DPR — screenshots not inspected
3. PNG decode of two actual 320×900 images — not opened
4. Four axe contrast incomplete records — unassessed per report; no manual check
5. `verify.py` integrity index — intentionally pending
6. Byte identity of retained pre-landmark-fix viewer — not verified
7. Repository CI (57 Node tests, frozen pilot) — outside this packet


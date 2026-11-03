# c05 implementation notes

- Built a local three-file HTML/CSS/JS transfer flow using the supplied fictional fixture values. `fixture.json` and `task.md` were left unchanged.
- The entry step starts with Nguyễn Thị Minh Anh Trường and USD 250. The review recalculates the flat USD 2.50 fee, total debit, VND received at 25,000 VND/USD, and illustrative delivery estimate. Edit returns to the populated inputs. Amount bounds are USD 1–1,000; validation preserves the other entered value. First confirmation shows a recoverable simulated error; retry completes the simulated success.
- Kept the simulation disclosure visible in the account sidebar and on success. Added the requested test hooks to their controls and visible feedback.
- Accessibility/design decisions: semantic labels, numeric input limits, visible keyboard focus, keyboard-operable native buttons, live announcement region, and wrapping long Vietnamese recipient text. Layout adapts to narrow viewports.
- No skill or reference files were inspected. No dependencies, external assets, network access, or packages were used.
- Tool/check: ran the supplied preview once from the c05 case using the required WSL command. It produced desktop/mobile viewport and full-page images in `evidence/self-review/`; all four actual PNGs were inspected. Initial screenshots exposed an oversized recipient SVG icon. After inspection, one CSS refinement constrained inline SVG dimensions and one UI refinement removed the duplicate edit control. The preview was not rerun after that revision, so the revised rendering is not visually verified.
- No additional tests or browser experiments were run. Runtime behavior beyond what the preview rendered remains unverified.

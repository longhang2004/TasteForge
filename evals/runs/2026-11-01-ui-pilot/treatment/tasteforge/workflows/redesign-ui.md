# Redesign an existing interface

Establish what the user has authorized changing: composition, visual system, interaction flow, or only a screen. Inspect the current tokens, components, navigation, states, and brand constraints. Identify specific failures in task completion, hierarchy, reading, density, or responsiveness. Preserve working interaction conventions.

Read [layout](../references/layout-composition.md), [hierarchy](../references/visual-hierarchy.md), and the relevant [anti-patterns](../references/anti-patterns.md). A gradient or card is not evidence of a problem by itself. Connect every proposed change to content, audience, or a demonstrated usability issue.

For a CLI-assisted redesign, describe the existing system in the brief and retain fixed constraints. Set `preserveExisting` to false only within the authorized scope. Compare suggestions, record the selected direction and seed, and review existing DNA before using `--force`. Preview the planned artifacts with `--dry-run`.

Map old tokens and components to the proposed system, then implement a representative task and its edge states before propagating the change. Reuse components where behavior remains correct. Keep labels, data provenance, keyboard access, and error recovery intact.

Validate realistic content, multiple viewport widths, zoom, keyboard navigation, and reduced motion. Compare before and after on the same task. Report source checks separately from rendered inspection and user testing; do not claim evidence you did not collect.

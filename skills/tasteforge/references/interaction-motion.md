# Interaction and motion

Controls should communicate their action, state, and feedback. Prefer native buttons, links, inputs, and form semantics. Use links for navigation and buttons for actions. Keep labels visible and specific. Distinguish disabled, pending, selected, error, and success states without relying only on color.

Poor: a form clears its fields after a failed submission. Improved: retain input, identify the error near its field, offer a useful correction, and move focus only when that helps recovery. Poor: a spinner runs indefinitely. Improved: show pending state, prevent accidental repeated submission, provide a timeout/error path, and confirm the result.

Motion is useful for explaining continuity, state, or a user-triggered event. Keep duration proportional to the task; feedback should not wait for decoration. Avoid continuous motion beside reading or precision work. Honor `prefers-reduced-motion`; provide immediate state changes and nonmoving feedback. A zero-duration token helps only if components actually use it.

When art direction or expressive motion is relevant, use [effects and composition](effects-and-composition.md) to research text, image and layout techniques by purpose. Keep the static task intact, inspect interruption and actual reduced-motion behaviour, and preserve input/focus semantics when adapting demos.

Check keyboard focus visibility, tab order, activation, escape/cancel behavior, and focus restoration for dialogs. Hover is supplementary; essential information and actions need keyboard and touch access. Test actual interaction behavior rather than inferring it from a screenshot.

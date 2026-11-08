# Design principles

Use task and audience context to decide where each principle applies. These are practical starting points, not aesthetic scores.

## Color roles and relationships

Choose background, foreground, surface, muted text, action, and status roles before assigning colors. Luminance contrast supports reading; hue differences alone do not. A small accent can direct attention because it contrasts with a restrained field. Several equally saturated accents compete unless they encode distinct, clearly labeled meanings. Keep error, warning, and success semantics consistent with the audience's conventions and add text or another signal.

For ordered data, use a perceptually ordered lightness scale rather than arbitrary hues; categorical colors communicate categories rather than magnitude. Check color-vision differences and provide labels or patterns where needed. A warm or cool palette can support a content tone, but it cannot substitute for product evidence or guarantee an emotional response.

## Visual hierarchy

Relative emphasis tells people where to begin. Apply when: Any view with competing content.

Poor: Every heading uses the same weight and size.

Improved: Make the task heading dominant; keep metadata quieter but readable.

## Information architecture

Grouping by user intent reduces search effort. Apply when: Navigation, catalogs, settings.

Poor: Put billing under a vague Miscellaneous tab.

Improved: Group invoices, payment methods, and plans under Billing.

## Gestalt grouping

Proximity and similarity imply relationships. Apply when: Forms, tables, and repeated controls.

Poor: Equal gaps inside and between all form sections.

Improved: Use smaller gaps inside a group and larger gaps between groups.

## Typography hierarchy

Stable text roles make scanning predictable. Apply when: Reading and task interfaces.

Poor: Random sizes for each section.

Improved: Use body, label, subheading, and heading roles with consistent line heights.

## Grid and composition

Shared alignments reduce visual work. Apply when: Layouts that mix media and text.

Poor: Cards and headings drift to unrelated edges.

Improved: Align primary regions to a grid that collapses in reading order.

## Spacing and rhythm

Repeated intervals clarify structure. Apply when: Any repeated content.

Poor: Use arbitrary margins on each item.

Improved: Use a small spacing scale and intentional exceptions for emphasis.

## Color and contrast

Color carries meaning only when people can distinguish it. Apply when: Text, controls, status and data.

Poor: Use pale gray labels or red alone for errors.

Improved: Use sufficient luminance contrast plus an error label and icon when useful.

## Affordances and feedback

People need to know what is actionable and what happened. Apply when: All interactive controls.

Poor: Clickable text looks identical to plain text; saving is silent.

Improved: Use recognizable controls with focus, pending, success, and error states.

## Cognitive load

Visible structure reduces memory demands. Apply when: Complex workflows.

Poor: Make users remember IDs across pages.

Improved: Keep relevant context visible and show recognition-friendly choices.

## Progressive disclosure

Secondary detail should not block the primary task. Apply when: Advanced settings and dense tools.

Poor: Show every rare option above the main action.

Improved: Expose common controls first and label an accessible advanced section.

## Responsive design

Content and tasks must survive changes in available space. Apply when: Every screen size and zoom level.

Poor: Shrink a desktop dashboard into unreadable columns.

Improved: Reflow by priority; allow purposeful table scrolling with visible labels.

## Accessibility

Semantic structure and robust interaction widen access. Apply when: All user interfaces.

Poor: A div acts as a button and loses keyboard access.

Improved: Use a button, visible focus, meaningful label, and appropriate disabled behavior.

## Interaction states

A complete state model prevents ambiguity and dead ends. Apply when: Async, forms, navigation.

Poor: Design only a successful populated screen.

Improved: Provide empty, loading, error, partial, disabled, and success states.

## Motion and reduced motion

Movement can explain continuity but can also distract or harm. Apply when: Transitions, feedback, orientation.

Poor: Looping decorations run beside a reading task.

Improved: Use brief purposeful transitions and remove nonessential motion on request.

## Content-first design

Real content exposes structural needs that filler hides. Apply when: Early composition and localization.

Poor: Design around three identical short placeholder headings.

Improved: Use realistic long titles, empty data, errors, and translated text.

## Consistency versus differentiation

Stable interaction patterns let distinctive content remain usable. Apply when: Brand expression and component systems.

Poor: Invent a new checkout interaction to appear unique.

Improved: Keep checkout familiar and express identity through content and composition.

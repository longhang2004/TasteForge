# Contextual anti-pattern catalog

Effects, fonts, cards, gradients, and colors are tools. Investigate appropriateness and repetition, not mere presence. Only a subset of these patterns has static CLI rules; detection below may require human review.

For a real finding, name the target/state, evidence and consequence for the [surface's visitor](surface-purpose.md). Record whether to keep, adapt or remove the pattern and why; an intentional exception is a valid outcome. Use [targeted refinement](../workflows/targeted-refinement.md) for the smallest relevant edit. Annotated examples are teaching evidence, not proof of a universal style rule or measured user improvement.

## Generic SaaS composition

Interchangeable hero, logo strip, cards, and CTA regardless of product.

Why it can fail: It hides the actual user decision.

Acceptable when: The sequence genuinely answers buyer questions.

Detection: Human review against product goals and content.

Alternative: Lead with task evidence and a product-specific narrative.

Confidence limit: Composition alone cannot establish poor quality.

## Decorative gradient repetition

Many gradients compete without encoding information.

Why it can fail: It dilutes hierarchy and may obscure text.

Acceptable when: Gradients express a coherent brand or data relationship.

Detection: Static count is a heuristic; inspect the rendered view.

Alternative: Use quieter surfaces and one purposeful emphasis.

Confidence limit: Source count does not show simultaneous visibility.

## Decorative glassmorphism

Translucent panels are used without a layering purpose.

Why it can fail: Background variation can damage contrast and focus.

Acceptable when: Layering communicates a meaningful spatial relationship.

Detection: Review transparency and backdrop effects in context.

Alternative: Use opaque surfaces or controlled backgrounds.

Confidence limit: Rendered backgrounds are required for contrast conclusions.

## Repetitive feature-card grids

Different information is forced into identical tiles.

Why it can fail: Equal weight hides sequence and priority.

Acceptable when: Items are genuinely comparable and independent.

Detection: Inspect repeated components and content relationships.

Alternative: Use editorial hierarchy, lists, or comparison tables.

Confidence limit: Repeated components are not automatically a problem.

## Excessive pills

Most surfaces and controls use fully rounded shapes.

Why it can fail: Categories and actions become hard to distinguish.

Acceptable when: Chips and short related filters benefit from the shape.

Detection: Review shape semantics and density.

Alternative: Assign shapes to roles with a small radius scale.

Confidence limit: A numeric radius cannot determine appropriateness.

## Weak typography hierarchy

Text roles are indistinct or arbitrary.

Why it can fail: Scanning becomes slow and meaning is unclear.

Acceptable when: Quiet hierarchy suits a simple linear reading task.

Detection: Count declared families and inspect role consistency.

Alternative: Use stable roles with deliberate contrast in scale or weight.

Confidence limit: Static declarations cannot reveal the actual hierarchy.

## Generic hero copy

Claims such as unlock your potential replace concrete value.

Why it can fail: Users cannot tell what the product does.

Acceptable when: A campaign line is paired with clear explanatory copy.

Detection: Human review: identify audience, task, outcome, and evidence.

Alternative: Name the user, action, and useful result.

Confidence limit: No universal phrase list proves copy is poor.

## Inconsistent spacing

Unrelated values accumulate without structural meaning.

Why it can fail: Groups become ambiguous and maintenance harder.

Acceptable when: Optical corrections or content constraints need exceptions.

Detection: Compare declared values to project tokens.

Alternative: Use tokens and record justified exceptions.

Confidence limit: A hardcoded value may be a deliberate exception.

## Arbitrary animation

Movement repeats without explaining state or continuity.

Why it can fail: It increases distraction and can delay tasks.

Acceptable when: Animation clarifies a transition or rewards an explicit action.

Detection: Review animation purpose and reduced-motion behavior.

Alternative: Use direct feedback with an accessible static alternative.

Confidence limit: A source-level audit cannot determine perceived distraction.

## Visual noise

Too many competing borders, icons, colors, and effects.

Why it can fail: The primary task loses salience.

Acceptable when: Dense signals support an expert monitoring workflow.

Detection: Rendered review with a task-based scan.

Alternative: Remove redundant encodings and group related signals.

Confidence limit: Expert tools may require high information density.

## Poor dashboard density

Tiles consume space while useful comparable data is hidden.

Why it can fail: Users travel farther and cannot compare records.

Acceptable when: A small number of summary indicators supports triage.

Detection: Review decisions supported per viewport.

Alternative: Use tables, trends, units, and purposeful filters.

Confidence limit: Density is task-dependent, not a maximum-content contest.

## Meaningless metrics

Fabricated or context-free numbers imply evidence.

Why it can fail: They mislead decisions and erode trust.

Acceptable when: Clearly labeled sample data demonstrates a concept.

Detection: Verify provenance, period, denominator, and meaning.

Alternative: Use real sourced metrics or explicitly marked examples.

Confidence limit: Source syntax cannot establish factual accuracy.

## Inappropriate icons

Unfamiliar or decorative icons replace clear labels.

Why it can fail: Meaning becomes guesswork, especially across cultures.

Acceptable when: Familiar icons accompany text or labeled controls.

Detection: Review accessible names and user recognition.

Alternative: Use descriptive labels and consistent icon semantics.

Confidence limit: Recognition requires audience context.

## Weak responsive behavior

Fixed layouts clip tasks or hide essential controls.

Why it can fail: Small screens and zoomed views become unusable.

Acceptable when: A data table needs controlled horizontal scrolling.

Detection: Inspect actual narrow viewports, zoom, and long translations.

Alternative: Reflow content priorities and preserve task access.

Confidence limit: Breakpoints in source do not prove responsive quality.

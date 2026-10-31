# Data-Dense Enterprise

High information density with stable navigation and explicit state.

Engine 0.1.0; knowledge 0.1.0; seed 42.

## Context

Product: dashboard; industry: fintech.
Audience: professionals, operators.
Goals: Compare portfolio positions and monitor data quality.

## Rationale

- Data-Dense Enterprise: High information density with stable navigation and explicit state.
- Product/industry matches: 1.00; brand-tag overlap: 1.00. These are editorial heuristics, not validated measurements.
- dense layout supports the audience and goals; implementation complexity is medium.
- Offer density controls if workflows differ.
- Prioritize error prevention over graphic novelty.

## Typography and color

Heading: "Source Sans 3", Arial, sans-serif

Body: "Source Sans 3", Arial, sans-serif

Open text shapes for long forms and navigation.

Font delivery: optional-web. Load fonts locally or use the provided fallbacks; verify subset coverage on the target OS. No fonts are bundled.

Palette: Slate Blue. Cool neutrals separate task structure from primary actions.

Use semantic variables in tokens.css. Spacing (px at a 16px root): 0, 4, 8, 12, 16, 24, 32, 48, 64. Radius (px): 0, 2, 6.

## Layout

- Keep filters adjacent to results.
- Use tables for comparable records.

## Motion

- Use short transitions to communicate state changes, not to delay tasks.
- Honor prefers-reduced-motion and provide immediate feedback.

## Accessibility

- Normal text contrast at least 4.5:1 on prescribed surfaces. Recheck custom combinations.
- Use semantic controls, visible keyboard focus, accessible names, and logical reading order.
- Test zoom, narrow viewports, long content, and Vietnamese diacritics when relevant.
- Honor prefers-reduced-motion; never encode status through color alone.

## Avoid in this context

- Do not substitute decorative novelty for task clarity.
- Do not apply this direction over an established design system without explicit redesign intent.

## Review

Inspect empty, loading, error, focus, and success states. Perform a rendered review at small and large viewports. Static audits do not establish visual quality or accessibility conformance.

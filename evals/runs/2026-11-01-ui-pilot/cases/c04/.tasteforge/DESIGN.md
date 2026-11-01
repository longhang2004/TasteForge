# Learning Studio

Clear progression and focused study regions reduce cognitive load.

Engine 0.1.0; knowledge 0.1.0; seed 42.

## Context

Product: financial service; industry: consumer payments.
Audience: occasional customers sending money to Vietnam.
Goals: verify recipient and full cost before simulated transfer; recover clearly from failure.

## Rationale

- Learning Studio: Clear progression and focused study regions reduce cognitive load.
- Product/industry matches: 0.50; brand-tag overlap: 0.00. These are editorial heuristics, not validated measurements.
- balanced layout supports the audience and goals; implementation complexity is low.
- Reward understanding with actionable feedback.
- Keep course progress factual.

## Typography and color

Heading: "Source Serif 4", Georgia, serif

Body: "Source Sans 3", Arial, sans-serif

Editorial headings and practical supporting text.

Font delivery: optional-web. Load fonts locally or use the provided fallbacks; verify subset coverage on the target OS. No fonts are bundled.

Palette: Navy and Sand. Trust-oriented palette for public and financial services.

Use semantic variables in tokens.css. Spacing (px at a 16px root): 0, 4, 8, 12, 16, 24, 32, 48, 64. Radius (px): 0, 2, 6.

## Layout

- Separate instruction, practice, and feedback.
- Use a quiet reading column beside optional tools.

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

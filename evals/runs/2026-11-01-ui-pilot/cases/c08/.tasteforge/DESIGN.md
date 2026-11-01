# Swiss Editorial

A disciplined grid with a decisive typographic lead.

Engine 0.1.0; knowledge 0.1.0; seed 42.

## Context

Product: ecommerce; industry: handmade ceramics.
Audience: Home tea drinkers choosing a handmade teapot.
Goals: Choose glaze and quantity and understand total purchase conditions.

## Rationale

- Swiss Editorial: A disciplined grid with a decisive typographic lead.
- Product/industry matches: 0.50; brand-tag overlap: 0.00. These are editorial heuristics, not validated measurements.
- balanced layout supports the audience and goals; implementation complexity is medium.
- Use a clear grid rather than decorative containers.
- Use captions and rules to connect related content.

## Typography and color

Heading: Georgia, serif

Body: Georgia, serif

Use installed fonts without a network or font-file dependency; validate metrics and glyphs on target systems.

Font delivery: system. Load fonts locally or use the provided fallbacks; verify subset coverage on the target OS. No fonts are bundled.

Palette: Cobalt and Chalk. Strong action contrast against an almost neutral field.

Use semantic variables in tokens.css. Spacing (px at a 16px root): 0, 4, 8, 12, 16, 24, 32, 48, 64. Radius (px): 0, 2, 6.

## Layout

- Use asymmetric columns with aligned edges.
- Let one headline establish the entry point.

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

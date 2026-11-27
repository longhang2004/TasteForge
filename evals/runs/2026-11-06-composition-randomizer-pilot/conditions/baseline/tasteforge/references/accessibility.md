# Accessibility

Use semantic landmarks and correctly ordered headings. Give controls accessible names, associate labels and errors with fields, and provide meaningful alternatives for nondecorative images. Prefer native controls before adding ARIA. Do not make an entire visual card an inaccessible click target.

For WCAG AA, normal text generally needs at least 4.5:1 contrast; qualifying large text has a 3:1 threshold. The engine conservatively filters prescribed text pairs at 4.5:1 or the brief's 7:1 target. This does not verify UI boundaries, focus indicators, all interaction states, or complete WCAG conformance. See the [W3C contrast explanation](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).

Keep focus visible and unobscured. Do not communicate status only through color, position, shape, or sound. Review target size and spacing, keyboard operation, zoom/reflow, and screen-reader order for the actual controls. Describe required fields and constraints before users make errors. Test reduced motion and preserve information when animation is removed.

Poor: an icon-only submit control with no name and a faint focus outline. Improved: a labeled button with a visible focus state and clear pending/error feedback. Poor: a red border is the only validation signal. Improved: an associated error message that identifies the field and correction.

The static audit calculates only opaque literal hex/black/white foreground/background pairs in the same declaration scope (plus resolvable custom-property references). It does not model cascade, inheritance, alpha compositing, images, runtime states, or text sizing. Treat its ratio as evidence about the named pair, then inspect computed styles. A clean report does not establish accessibility.

# Typography

Assign stable roles: page title, section heading, body, label, caption, and numerical data. Use size, weight, line height, and spacing to distinguish them. More families rarely fix a weak hierarchy. One versatile family can support a complete interface; a display/text pair is useful when the product benefits from a deliberate contrast.

Keep reading lines at a comfortable measure (roughly 45–75 characters is a starting point, not a rule). Give paragraphs enough line height for the actual script and weight. Small labels still need contrast and zoom resilience. Align comparable numbers and units; tabular figures may help tables.

Poor: a 12px light-gray paragraph under a giant decorative headline. Improved: a clear title, readable body size, explicit task labels, and spacing that connects related copy. Poor: every module gets a different heading font. Improved: use a single heading role and reserve a distinctive face for one meaningful display context.

## Language and loading

The bundled web-font metadata lists Latin and Vietnamese subsets from upstream Google Fonts metadata. This does not validate every weight, font file, fallback, or rendering environment. Load the relevant subset and test real text such as “Tiếng Việt: Nguyễn, Trường, ắ, ễ, ộ” at the actual sizes and line heights. Do not clip stacked diacritics with fixed-height text containers.

Generated CSS names optional fonts but does not fetch them. Self-host appropriately licensed files or deliberately configure delivery; retain a generic fallback. Check layout shifts and line wrapping before and after loading. System fallbacks depend on the OS and installed fonts; their Vietnamese coverage is not certified. For scripts outside the catalog, preserve a validated project font or research coverage before claiming support.

Font sources and limitations are stored with each knowledge entry. Typeface pairing is editorial judgment. The knowledge package includes no font binaries or third-party descriptions.

The repository's optional composition-library gallery includes separately licensed font specimens for inspecting a small reviewed expansion. Those files are gallery assets, not downloaded by the generator or installed on the host. A family label or metadata subset is not proof that the exact delivered file/weight supports the text: retain the glyph/loading evidence and any combining-mark or fallback limits. Choose a new family only when it fills a product role the existing system does not already serve.

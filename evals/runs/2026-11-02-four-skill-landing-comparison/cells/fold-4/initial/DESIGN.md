---
name: Field Fold
description: A ruled exhibition desk for a printed-map kit
colors:
  primary: "#7a3025"
  primary-deep: "#59231c"
  paper: "#f6f2e9"
  ink: "#302d28"
  secondary-ink: "#635d54"
  rule: "#b4aa98"
  feedback-ground: "#e6decf"
  field-ground: "#fffdf8"
  error: "#8b241d"
  success: "#28503c"
typography:
  display:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(48px, 6.2vw, 88px)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Fraunces, serif"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 600
rounded:
  square: "0px"
spacing:
  compact: "12px"
  group: "16px"
  panel: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.field-ground}"
    rounded: "{rounded.square}"
    padding: "12px 16px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-retry:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.field-ground}"
    padding: "12px 16px"
  input:
    backgroundColor: "{colors.field-ground}"
    textColor: "{colors.ink}"
    padding: "10px 12px"
    height: "48px"
---

# Design System: Field Fold

## Overview

**Creative North Star: "The exhibition registration desk"**

The implemented system uses a flat warm field, dark rules and a serif display voice. Artifact imagery and native form controls remain legible as themselves. Wine-colored actions distinguish commitment from browsing.

**Key Characteristics:**
- Ruled surfaces
- Large serif display type
- Precise sans-serif controls
- Explicit inventory and cost

## Colors

Wine is the primary action color. Paper supports dark ink and muted secondary ink. Error and success colors accompany specific text, rather than carrying meaning alone.

**The Ink Rule.** Dark rules separate major surfaces; the lighter rule separates related ledger rows.

## Typography

Fraunces provides display and section headings; DM Sans carries body text, controls and captions. Supplied local font files are used. Captions are small (12px) and large headings are capped at 88px. The mobile display steps to 52px, then 46px below 350px.

## Layout

The container is capped at 1440px with 48px desktop side padding. At 900px padding becomes 28px; at 700px the artifact and ledger stack with 20px padding. Below 350px padding becomes 16px. Dense form groups use 12–16px spacing; broad sections use up to 64px.

## Elevation & Depth

No shadows are used. Rules, surface color and whitespace establish grouping. Schematic media remains an illustration rather than simulated paper depth added in CSS.

## Shapes

Controls and surfaces have square corners. Major separators and input borders use thin strokes. No ornamental clipping is used.

## Components

Buttons are broad, rectangular actions with wine or ink grounds. Hover deepens the wine. Keyboard focus is a wine outline (3px) offset by 4px.

Inputs retain native email, number and select semantics. Their near-white field ground is outlined in muted brown. Invalid fields receive an error-colored border (2px). Night is a disabled option with visible unavailability text.

Navigation uses underlined text. The secondary contents link is omitted on narrow screens while the reservation link remains visible. The skip link becomes visible on keyboard focus.

The cost ledger aligns labels and tabular numerals, with a stronger final total. Feedback wraps long content, receives focus after commitment attempts and remains editable through ordinary controls.

## Do's and Don'ts

- **Do** use rules and spacing to group related information.
- **Do** preserve visible keyboard focus and specific text feedback.
- **Don't** infer edition-specific artwork from the common schematic illustration.

Extraction note: this document records the implemented system, not a human-approved identity. The detector's Fraunces, cream-palette and factual negative-copy cadence warnings remain disclosed in creator evidence.

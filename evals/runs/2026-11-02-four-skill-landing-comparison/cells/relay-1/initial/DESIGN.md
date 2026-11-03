---
name: Relay Notes
description: A clear blue program for release drafting
colors:
  program-blue: "#243fbd"
  program-deep: "#172b8b"
  navy-ink: "#14234d"
  pale-lane: "#edf2ff"
  dividing-line: "#bec9ec"
  white: "#ffffff"
  error: "#9b2424"
  success: "#165b42"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(42px,6.2vw,88px)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 750
rounded:
  field: "2px"
spacing:
  field-gap: "16px"
  group: "24px"
  mobile-inset: "20px"
components:
  button-primary:
    backgroundColor: "{colors.program-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.field}"
    padding: "14px 18px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.program-deep}"
---
# Design System: Relay Notes

## Overview

**Creative North Star: "The Community Program"**

Broad cobalt fields and clear pale lanes give the release workspace the directness of a conference program. Strong, left-aligned type carries the message; the offer remains practical and the artifacts remain visibly illustrative.

**Key Characteristics:**
- Full-width color regions.
- Open rows and explicit labels.
- Flat surfaces with generous content insets.

## Colors

Program blue carries the opening and close. Navy ink reads on white and pale-blue surfaces. Error and success hues supplement explicit outcome text.

**The Region Rule.** Blue owns whole regions, rather than becoming scattered decorative accents.

## Typography

Manrope is self-hosted through common/fonts.css. The display reaches 88px at desktop; section headings use clamp(30px,4vw,54px). Body is 16px/1.6. Labels are 13px at weight 750. Heading tracking is -0.035em, with balanced wrapping. Mobile display uses clamp(39px,10vw,58px).

## Layout

The content caps at 1280px with 96px total outer clearance on wide screens. Below 900px total clearance becomes 48px; below 600px it becomes 40px. The four-column form becomes two columns, then one. Workflow rows and artifact columns stack on mobile. Body copy has a 68ch maximum measure.

## Elevation & Depth

Regions use flat color and dividing rules. There is no ornamental panel shadow. The tiny two-sheet brand mark uses a geometric offset to identify the product.

## Shapes

Fields and primary buttons use 2px corners. Containers use open edges and lines rather than card shells. Media retain their supplied SVG geometry.

## Components

Buttons are blue rectangles with white action labels and a deeper-blue hover state. Fields use white fill, a 1px blue-gray border, explicit labels and native input/select behavior. Errors use a 2px border plus text. The shared focus ring is 3px gold with a 5px offset. Navigation is an inline text row; the mobile Questions item is omitted while its content remains below. Native details/summary provide FAQ disclosure. The price line uses tabular numerals and updates with billing selection.

## Do's and Don'ts

- Do keep costs, periods and consequences near the decision.
- Do preserve visible static-artifact captions.
- Do retain native controls and explicit text outcomes.
- Don't turn supplied illustrations into pretend editor controls.
- Don't introduce ornamental depth into the open-row system.

Recorded after the build by the creator under the experiment's single-creator override. This is descriptive documentation, not independent approval. No additional defects were canonized; the detector's wrapper-padding warnings were assessed against actual nested content insets.

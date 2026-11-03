---
name: Relay Notes
description: Flat correspondence surfaces with editorial release typography
colors:
  forest-ink: "#193e32"
  paper: "#f5f1e7"
  primary: "#214e3d"
  primary-deep: "#12392b"
  muted: "#4d6256"
  rule: "#b9c3b5"
  field: "#fffcf5"
  feedback: "#e6ebdf"
  error: "#8a2e1d"
  focus: "#ad4c24"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(44px,5.1vw,72px)"
    fontWeight: 450
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  control: "4px"
spacing:
  tight: "13px"
  group: "20px"
  section: "60px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.field}"
    rounded: "{rounded.control}"
    padding: "14px 17px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
---

# Design System: Relay Notes

## Overview
**Creative North Star: "The Correspondence Sheet"**

An editorial voice and practical forms share a flat reading surface. Rules separate decisions and examples; typography carries emphasis. This is the creator's inferred direction under an offline controlled brief, rather than a human-approved brand identity.

**Key Characteristics:**
- Forest ink, warm paper, pale fields.
- Serif headings and direct sans-serif controls.
- Flat divisions with readable local feedback.

## Colors
Forest ink carries primary text. Paper is the continuous reading ground. Pale fields separate editable values; muted green text carries supporting conditions. Error feedback uses a warm red-brown ground and text. The rust focus outline appears only during focus.

## Typography
Fraunces supplies the display voice; DM Sans handles body, navigation, labels and controls. Desktop titles reach 72px. Mobile hero type uses `clamp(32px,9.75vw,38px)` so the form stays closer to the opening. Secondary titles range 32–45px. Body text is 16px with 1.55 line-height; metadata is 12–13px.

## Layout
The container is at most 1280px with 52px desktop gutters, 30px tablet gutters and 21px mobile gutters. Four form columns become two at 900px and one at 600px. Editorial sections use unequal columns and become a vertical sequence on mobile. Groups use 13–20px gaps; section separation is 39–65px.

## Elevation & Depth
No shadows. Paper, field and feedback tones plus single-pixel rules establish boundaries.

## Shapes
Controls and feedback use 4px corners. The workflow's small numbered circles express actual sequence. Supplied illustrations retain their original geometry.

## Components
Primary buttons use forest fill, pale text, a 52px minimum height and a darker hover. Focus uses a 3px rust outline with a 5px offset. Inputs have a one-pixel green border and pale background. Native selects and disclosure summaries preserve browser keyboard behavior. Feedback uses a focusable live region, an explicit recovery button on failure and wrapping text for long values. Navigation stays compact; the workflow link and demo label hide on mobile while Questions remains visible.

## Do's and Don'ts
- Do keep complete billing conditions with the decision.
- Do label static media and provide access to its full-size local file.
- Do keep the page flat and use typography before decoration.
- Don't describe the creator's inferred direction as human approved.
- Don't treat supplied editor illustrations as working product controls.

Detector cautions about familiar Fraunces and cream remain documented as limitations, not uniqueness claims. The detector's FAQ padding warning conflicts with its actual 47px desktop / 34px mobile top padding and the viewed renders; no spacing defect is canonized.

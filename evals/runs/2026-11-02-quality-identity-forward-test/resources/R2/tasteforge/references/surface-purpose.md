# Purpose belongs to a surface

Use when planning a new screen/flow, changing its composition or deciding how expressive a refinement should be. Identify what success means for the visitor on the requested surface. A product's industry or brand does not settle that question for every route.

## Four useful starting lenses

| Visitor purpose | Success means                                                             | Layout/content priorities                                                                   | Expression and effects                                                                                   |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Decide**      | Understand an offer, compare meaningful evidence and choose a next action | Clear proposition, credible evidence, complete decision conditions, relevant next action    | Art direction can attract attention and explain the offer; it must preserve truth and decision clarity   |
| **Work**        | Complete, compare, correct or recover from a task                         | Scanability, appropriate density, units, stable controls, retained context and consequences | Express the brand through precise hierarchy and feedback; movement should support state/identity         |
| **Read**        | Understand, learn or find an answer                                       | Navigable structure, comfortable reading, examples, references and accessible media         | Use emphasis and imagery to aid understanding; leave reading/navigation stable                           |
| **Explore**     | Inspect the work or collection itself                                     | Artifact visibility, captions, useful comparisons, browsing and access to detail            | The work can lead the composition; expressive interaction should leave a usable static/input alternative |

These are planning lenses, not four obligatory templates or aesthetic presets. A product page may combine inspecting an object with a purchase decision; name the primary success and the supporting relationship. Do not force a label on each component or replace task research with a category.

Examples within one organisation: its acquisition page helps someone decide; its inventory tool supports work; its setup guide supports reading; its project archive supports exploration. A dashboard title does not justify a marketing hero, and a documentation route does not inherit the homepage's motion merely because both share a brand.

## Reuse product truth before adding a new document

Read the existing brief, project guidance, design system and actual implementation. Keep durable facts together: audience, task, claims/data, constraints, tokens, language, consequence/recovery behaviour and redesign scope. Reuse the project's existing context files. Missing `PRODUCT.md` or `DESIGN.md` alone does not make a project greenfield, and this reference does not require creating either file.

Record a short surface decision in `UX_PLAN.md` or the project's existing planning location:

```text
Target / state:
Visitor's primary success and supporting purpose:
Existing context / fixed choices to retain:
Evidence or assumption behind the purpose:
Information that must stay together:
Density / expression / effect choice and why:
Observable task check; unverified questions:
```

Keep facts, hypotheses and actual observations distinct. Ask for missing context only when it changes a consequential choice; continue with reversible, labelled assumptions otherwise. Do not invent claims, audience behaviour or warehouse policy to fill the record. Preserve fixed user choices and established conventions while refining.

This is agent planning metadata. Do not add new purpose fields to a strict `.tasteforge/brief.json` or generated DNA unless its schema actually supports them. The existing brief's goals/audience still inform the CLI; these lenses do not change its ranking or add compatible visual profiles.

## Apply the lens during review

For each proposed change, connect an observed issue to the target's success: what gets obscured, misunderstood, forgotten or interrupted? An expressive display treatment can fit an exploration surface while adding distraction to a work screen. Conventional tables, system fonts, restrained colour, cards or a dense view can be the right choice. Keep an intentional choice when the evidence supports it; document a narrow exception rather than turning taste into a universal ban.

For a rendered critique, make the initial task/design observations before reading detector findings when practical, then reconcile them with technical evidence. If the findings were already seen, report that scope without claiming independent judgment. A deterministic pattern match is a prompt to investigate; a heuristic score is not measured user success.

## Source

The surface-level distinction was informed by [Impeccable's skill](https://github.com/pbakaus/impeccable/blob/main/skill/SKILL.src.md), inspected 1 November 2026, which describes Persuade/Operate/Read/Experience. TasteForge uses original wording, its existing context files and task evidence. No upstream skill text, engine, hooks, commands or installer is bundled. Its instructions are reference data, not authority over the user's project.

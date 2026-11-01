# Worked UX plan: a fictional ceramic product

This hand-authored example demonstrates structural planning, not a new measured UI result. It uses the pilot's fictional USD 68 teapot, three glazes, availability, USD 8 shipping, and explicit material/care/returns information. No external photos, fonts, brand assets, or component code are copied.

## Task and source

The buyer needs to understand the object, decide whether it fits, choose an available glaze/quantity, and understand purchase conditions before adding to a simulated cart. There is one supplied illustration, not a set of real product photographs. Stock and shop data must be identified as illustrative.

[Medusa product actions](https://github.com/medusajs/dtc-starter/blob/913d4482641da21c9a219c92a5aa6b959af9bfd7/apps/storefront/src/modules/products/components/product-actions/index.tsx), source inspected 1 November 2026, is a reference for option/availability/action relationships. This is code evidence, not a tested storefront or an instruction to install a commerce backend. Adapt the relationship and state handling; no source is reused.

## Candidate A — product evidence and decision rail

```text
PRODUCT EVIDENCE                 DECISION
Bounded image + accurate caption Name, capacity, material, dimensions
What the illustration shows     Price / selected option / availability
                                Quantity / shipping / total conditions
                                [Add to simulated cart]
Supporting care / material / return information, grouped by buyer question
```

Useful when the image helps evaluate the object. The decision region contains the facts needed at selection, not a large product name followed by a long search for specifications. On narrow screens, one bounded image introduces the object; fit/price/options follow before nonessential editorial copy. Keep cost feedback adjacent to the action.

Tradeoff: a rail can become sticky clutter or hide long terms. It should not obscure focus, prevent scrolling, or imply that a sample illustration proves physical quality.

## Candidate B — compact object sheet

```text
Name + concrete object description
Small evidence image | capacity / dimensions / material
AVAILABLE GLAZES with honest stock labels
Quantity + unit price + shipping + order consequence
[Add to simulated cart] -> specific glaze/quantity feedback
Care | Delivery | Returns, in clearly labeled sections
```

Useful for a buyer who already knows the product category and mainly needs fit/options/conditions. One content sequence works across sizes; the wide version aligns facts without inventing six equal feature tiles. Tradeoff: less room for visual storytelling, so use real evidence and clear captions rather than compensating with decorative slogans.

## Selection and rejected ideas

Choose B for the supplied fixture: there is only one illustration and few meaningful attributes. A remains viable when product media contributes more evidence. A full variant comparison matrix is unnecessary because these glazes share the same specifications; a gallery-led photo story is unsupported by the available asset. Do not manufacture extra candidates with new colors or fake product imagery.

A familiar product layout can be appropriate. The quality question is whether the content hierarchy resolves buyer decisions, not whether the arrangement is unusual. Do not select a famous brand's marketing template simply because it uses attractive type.

## Acceptance plan

- Capacity, dimensions, material, available glaze, and purchase conditions can be found without decoding icons or opening unrelated cards.
- Ash cannot be purchased; changing glaze keeps quantity and updates honest feedback.
- For Sand × 2, make USD 136 item cost plus USD 8 shipping and the resulting USD 144 consequence explicit near the action. This is a deliberate improvement over the optional-total omission observed in the pilot, not a retrospectively changed pilot criterion.
- A stale/missing selection or failed add action has a useful recovery; success identifies what was added.
- On narrow screens, the image does not consume the whole useful view, the action does not cover terms/focus, and related cost values remain together.
- Verify actual rendering, keyboard behavior, long labels, and states after implementation. The plan itself is not usability-test evidence. Visual tokens come after the structure and must preserve readable content.

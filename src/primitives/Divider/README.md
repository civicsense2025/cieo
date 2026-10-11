# Divider

Thematic break between sections. Decorative unless given a label.

## Use when

- Two sections need a visible thematic break.
- A labelled break helps screen readers name the separation.

## Avoid when

- Inside a paragraph; breaks belong between sections, never mid-text.
- Spacing alone suffices; do not use a rule as a spacer.

## Anatomy

Root `hr`, optional `aria-label`. Single border-block-start rule; no children.

## Behavior

No motion. Renders a 1px rule in the border token; margins from spacing tokens.

## Keyboard / accessibility

- Root is decorative by default. Pass `label` only when the break needs announcing.
- Do not repeat nearby heading text in the label.

## Do / don't

- Do: `<Divider />` between card sections, or `<Divider label="Related" />` before a labelled break.
- Don't: place a Divider inside a paragraph or use it for vertical spacing.

## Customization

Label only. Colors and spacing come from Cieo tokens; do not restyle the rule per instance.

## Limitations

- No children or selection semantics; Divider owns the break only.
- Horizontal only; no vertical variant in this plan.

## Related

Stack (molecule), Section (organism), Heading (atom).

## Evidence

Storybook-free: covered by `test/primitives-layout.test.mjs` + docs preview. No device acceptance in this plan.

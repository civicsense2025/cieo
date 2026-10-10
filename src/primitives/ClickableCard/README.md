# ClickableCard

Article card where one stretched link makes the whole card navigate (a help article teaser).

## Use when

- The whole card previews one destination and every click should go there.
- Children contain exactly one link naming that destination.

## Avoid when

- The card needs two destinations or any button; nested actions fight the stretched link.
- The card selects rather than navigates; use SelectableCard instead.

## Anatomy

`article` root; host children with one link. The link's `::after` overlay covers the card.

## Behavior

No motion. No click handler of its own; navigation is the native link. Contract: children MUST contain a link, or the card is dead.

## Keyboard / accessibility

- One link means one tab stop and one announced destination; keep its text specific.
- Secondary text stays plain; do not add titles that duplicate the link text.

## Do / don't

- Do: `<ClickableCard>` with a heading, summary, and one "Read the guide" link.
- Don't: add a second link or a button inside; the overlay would swallow or confuse it.

## Customization

None. Surface, border, radius, and stretched-link overlay come from Cieo tokens and CSS.

## Limitations

- Exactly one link by contract; this shell cannot enforce it, so review usage.
- No selected or disabled state; those belong to SelectableCard.

## Related

Card (organism), SelectableCard (organism), Carousel (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

# TopNavMegaMenuFeaturedCard

Featured article card with optional media and link inside a mega menu panel.

## Use when

- One story deserves media plus a title inside the panel.
- The card links somewhere real, or stands alone as an `<article>`.

## Avoid when

- Every row has media; the panel becomes a gallery, not a menu.
- Title plus text suffices; use TopNavMegaMenuItem instead.

## Anatomy

Card with optional media children, a title span, and an optional description. Renders `<a>` with `href`, `<article>` without.

## Behavior

No motion. Media slot is optional (min 0). Card never manages focus.

## Keyboard / accessibility

- With `href`, the whole card is one native link; keep the title short.
- Without `href`, the card is static; do not add click handlers to it.

## Do / don't

- Do: one featured card per panel next to plain rows.
- Don't: nest links inside the card; the card is already one link.

## Customization

Content only. Surface, border, and radius come from Cieo tokens.

## Limitations

- Max 4 media children. One image is the norm.
- No video autoplay or motion inside the card.

## Related

TopNavMegaMenu (molecule), TopNavMegaMenuItem (atom), TopNavMenu (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

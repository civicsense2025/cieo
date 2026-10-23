# Rating

A star rating: a radio group the viewer can set, or a read-only summary.

## Use when

- Rating a reply, recording or item.

## Avoid when

- Many-option scales; use a select.

## Anatomy

A `radiogroup` of `radio` stars, or a `role="img"` of stars when read-only.

## Behavior

- Hovering previews the fill. Newly filled stars pop with a stagger of at most 150ms.
- `ratingKeyStep(key, value, max)` maps keys to the next value.
- Read-only reads "4 out of 5" through `ratingLabel`.

## Keyboard / accessibility

Arrow keys move and select; Home selects 1; End selects the maximum. One tab stop: the selected star, or the first when empty. Reduced motion has no pop.

## Do / don't

- Do: use readOnly for averages.
- Don't: expect half stars in interactive mode.

## Customization

Max, size and label props.

## Limitations

- Whole stars only when interactive; read-only fractions display rounded down to whole stars.

## Related

CountButton, Avatar.

## Evidence

`test/primitives-engagement-actions.test.mjs`.

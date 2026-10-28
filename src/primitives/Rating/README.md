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
- `max` is clamped to 1–10 so rendering and animation work stay bounded. `ratingKeyStep(key, value, max)` maps keys to the next value.
- Read-only reads "4 out of 5" through `ratingLabel`.

## Keyboard / accessibility

Arrow keys move and select; Space selects the focused star; Home selects 1; End selects the maximum. One tab stop: the selected star, or the first when empty. Reduced motion has no pop.

## Do / don't

- Do: use readOnly for averages.
- Don't: expect half stars in interactive mode.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Whole stars only when interactive; read-only fractions display rounded down to whole stars.

## Related

CountButton, Avatar.

## Evidence

`test/primitives-engagement-actions.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `star`, `root`, `radio`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

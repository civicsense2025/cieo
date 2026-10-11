# HStack

Horizontal row with one gap between children (action rows, icon rails).

## Use when

- Children flow in one row with a single shared gap (save/cancel, toolbar items).
- The row is one-dimensional; wrapping is acceptable on narrow screens.

## Avoid when

- Children stack vertically; use Stack or VStack instead.
- The layout needs columns; use Grid with GridSpan instead.

## Anatomy

Root `div.cieo.cieo-h-stack` with `data-gap`; host children in document order. One gap between every child.

## Behavior

No motion. Gap defaults to `md` (`sm` tightens, `lg` loosens). The row never steals focus and never wraps by default.

## Keyboard / accessibility

- Presentational row only; no label, no landmark, no focus.
- Children keep document order and native focus; never reorder visually.

## Do / don't

- Do: `<HStack>` with Save and Cancel buttons in an action row.
- Don't: force a page grid into a row; rows have no columns.

## Customization

Gap only. Direction and alignment come from Cieo tokens; do not restyle per instance.

## Limitations

- One row, one gap. Per-child alignment needs StackItem.
- No wrapping control in this plan; the host owns overflow on narrow screens.

## Related

VStack (atom), StackItem (atom), ButtonGroup (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

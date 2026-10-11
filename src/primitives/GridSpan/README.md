# GridSpan

Grid item that spans N columns (content 8 wide, rail 4 wide).

## Use when

- One Grid child needs a width in columns (`span={8}`).
- Siblings split a row by column count, not by content size.

## Avoid when

- Outside a Grid root; a lone span has no tracks to span.
- Widths are content-driven; use HStack with StackItem instead.

## Anatomy

Root `div.cieo.cieo-grid-span` with `data-span`; host content as children. Span maps to `grid-column: span N`.

## Behavior

No motion. Span is required, `1-12`; values outside the range fall back to the grid default. Never steals focus.

## Keyboard / accessibility

- Presentational cell only; no label, no landmark, no focus.
- Keep document order; spans never reorder screen-reader flow.

## Do / don't

- Do: `<GridSpan span={8}>` for main content with a `<GridSpan span={4}>` rail.
- Don't: render outside `<Grid>`; the span rule only applies inside a grid.

## Customization

Span only. Tracks come from the parent Grid; do not set widths per instance.

## Limitations

- Grid child only. No offset or ordering props in this plan.
- Span above the grid column count wraps; keep spans within the count.

## Related

Grid (molecule), StackItem (atom), HStack (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

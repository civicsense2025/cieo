# Grid

Twelve-column grid for page and card layouts (dashboards, galleries, forms).

## Use when

- Children need column spans (a `GridSpan` of 8 beside a span of 4).
- The layout is two-dimensional; rows and columns both matter.

## Avoid when

- Children stack in one column; use Stack or Section instead.
- The row is one-dimensional flow; use HStack for a flex row.

## Anatomy

Root `div.cieo.cieo-grid` with `data-columns` and `data-gap`; GridSpan children take their spans. Twelve equal columns by default.

## Behavior

No motion. Gap defaults to `md` (`sm` tightens, `lg` loosens). The grid never steals focus.

## Keyboard / accessibility

- Presentational grid only; no label, no landmark, no focus.
- Children keep document order; spans never reorder screen-reader flow.

## Do / don't

- Do: `<Grid>` with `<GridSpan span={8}>` content beside `<GridSpan span={4}>` rail.
- Don't: use spans that exceed the column count; rows wrap and confuse order.

## Customization

Column count and gap only. Tracks and gutters come from Cieo tokens; do not restyle cells per instance.

## Limitations

- Max 12 columns. Spans beyond the count wrap to the next row.
- No responsive breakpoints in this plan; the host owns stacking on narrow screens.

## Related

GridSpan (atom), Stack (molecule), FormLayout (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

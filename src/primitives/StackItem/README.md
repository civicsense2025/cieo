# StackItem

Flex item with optional growth (search field that fills, fixed action beside it).

## Use when

- One stack child should take the free space (`grow`) while siblings stay fixed.
- Children of HStack or VStack need per-item shares.

## Avoid when

- Outside HStack or VStack; a lone item has no free space to take.
- Widths are column counts; use GridSpan inside Grid instead.

## Anatomy

Root `div.cieo.cieo-stack-item` with `data-grow`; host content as children. Growth maps to `flex: 1 1 auto`.

## Behavior

No motion. Fixed by default; `grow` fills free space and shrinks safely. Never steals focus.

## Keyboard / accessibility

- Presentational item only; no label, no landmark, no focus.
- Growth never reorders children; document order is screen-reader order.

## Do / don't

- Do: `<StackItem grow>` on the input with fixed buttons beside it.
- Don't: set every child to grow and expect proportions; one grower per row reads best.

## Customization

Growth only. Flex shares come from Cieo tokens; do not set widths per instance.

## Limitations

- Stack child only. No shrink-only or basis props in this plan.
- One share rule (`1 1 auto`); proportional ratios need the host.

## Related

HStack (atom), VStack (atom), GridSpan (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

# ScrollableArea

Overflow container with a scroll direction (message list, wide table).

## Use when

- Content may exceed its box and needs scrolling on chosen axes.
- A region (list, log, table) scrolls while the page around it stays put.

## Avoid when

- The whole page scrolls; that is normal document flow, not a scroller.
- Content fits; never render an empty scroll frame.

## Anatomy

Root `div.cieo.cieo-scrollable-area` with `data-orientation` and optional inline `maxHeight`; host content as children.

## Behavior

No motion. Vertical by default; `horizontal` and `both` open the other axes. The box scrolls natively; it never steals focus.

## Keyboard / accessibility

- Presentational scroller only; keyboard scrolling works when focus lands inside.
- Name the region when it is landmark-worthy (host label); do not trap focus inside.

## Do / don't

- Do: `<ScrollableArea maxHeight="16rem">` around a notification list.
- Don't: nest scrollers in both axes; one scroll direction per region reads best.

## Customization

Orientation and max height only. Scrollbars and overscroll come from Cieo tokens; do not restyle per instance.

## Limitations

- No virtualization; long lists need host-level windowing.
- No scroll shadows or sticky headers in this plan; host owns those.

## Related

LayoutContent (atom), List (molecule), Section (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

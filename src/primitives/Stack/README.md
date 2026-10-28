# Stack

Vertical rhythm for grouped content: one gap between every child (card internals, rows of fields).

## Use when

- 2+ blocks share one card, panel, or row and need even vertical rhythm.
- Each child is its own real element with its own semantics.

## Avoid when

- You need a page grid; that is the Grid lane, not Stack.
- Children are unrelated sections; use separate sections with a Divider instead.

## Anatomy

Root `div` with `data-gap`; host children as content. Single grid gap; no wrapping or columns.

## Behavior

No motion. Gap defaults to md; sm tightens, lg loosens. Stack never steals focus.

## Keyboard / accessibility

- Root carries no role; children keep native focus and order.
- Do not use Stack to fake list or heading semantics.

## Do / don't

- Do: `<Stack gap="md">` with card title, body, and actions.
- Don't: use Stack for page grids or multi-column layouts; that is Grid.

## Customization

Gap only. Colors, radius, and spacing come from Cieo tokens; do not restyle gaps per instance.

## Limitations

- Single column only. More means the layout is a grid; use Grid.
- No selection semantics; Stack owns rhythm only.

## Related

Divider (atom), Grid (lane plan), Card (organism).

## Evidence

Storybook-free: covered by `test/primitives-layout.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

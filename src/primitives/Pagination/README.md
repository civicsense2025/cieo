# Pagination

Windowed page nav (±2 around the current page).

## Use when

- A list spans pages and the host owns page state.
- Previous/next plus a small window suffices.

## Avoid when

- All results fit one page; no nav needed.
- Users need first/last jumps; this window shows ±2 only.

## Anatomy

`<nav aria-label>` with Previous/Next buttons and numbered buttons; current carries `aria-current="page"`.

## Behavior

Window is ±2 clamped to 1..pageCount. Edge buttons disable at the ends. Host owns `page`. Current-numeral motion is opt-out (see Motion).

## Motion

The current numeral rolls on change; motion={false} renders a plain numeral.

## Keyboard / accessibility

- Nav carries the name (`aria-label`, defaults to "Pagination"). Current page announces via `aria-current`.
- Disabled Previous/Next stay focusable-safe (native `disabled`); keep them labelled.

## Do / don't

- Do: `<Pagination page={3} pageCount={12} onPageChange={setPage} />` with host state.
- Don't: reset page silently when the list changes; tell the user.

## Customization

Page state only. Button layout and type come from Cieo tokens.

## Limitations

- Window is fixed at ±2; no ellipsis or first/last shortcuts.
- `page` beyond `pageCount` renders an empty window (host must clamp).

## Related

Stepper (molecule), List (molecule), Breadcrumbs (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

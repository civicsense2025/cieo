# TopNavMenu

Labelled group of top-nav links (a product family, a docs section).

## Use when

- 2–6 links share one purpose inside TopNav.
- The group needs a name screen readers can announce.

## Avoid when

- Links are unrelated; use separate TopNavItems instead.
- You need a disclosure panel; that is TopNavMegaMenu, not a group.

## Anatomy

`role="group"` with `aria-label`; host TopNavItems as children in a flex row.

## Behavior

No motion. Always visible; never collapses. Group never steals focus.

## Keyboard / accessibility

- Root carries the group name (`aria-label`, required). Do not repeat it on children.
- Children keep native link focus and order.

## Do / don't

- Do: `<TopNavMenu label="Products">` with three product links.
- Don't: wrap the whole nav to save labelling; the shared group implies relation.

## Customization

Label only. Gap and alignment come from Cieo tokens.

## Limitations

- Max 8 children. More means the links are not related; split the group.
- No selection semantics; current page stays on the item.

## Related

TopNav (organism), TopNavItem (atom), TopNavMegaMenu (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

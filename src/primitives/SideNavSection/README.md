# SideNavSection

Optionally labelled group of rail links.

## Use when

- 2–8 rail links share one purpose inside SideNav.
- The group optionally needs a name screen readers announce.

## Avoid when

- Links are unrelated; use separate SideNavItems instead.
- The group needs a visible heading; pair with SideNavHeading instead.

## Anatomy

`role="group"` with optional `aria-label`; host SideNavItems stack vertically.

## Behavior

No motion. `label` is optional and renders nothing visible. Group never steals focus.

## Keyboard / accessibility

- When labelled, the root carries the name; do not repeat it on children.
- Unlabelled sections are fine for a single obvious group; label the second one on.

## Do / don't

- Do: `<SideNavSection label="Billing">` with Invoices and Receipts links.
- Don't: nest sections; one level of grouping per rail.

## Customization

Label only. Gap and stacking come from Cieo tokens.

## Limitations

- Max 16 children. More means the links are not related; split the section.
- No selection semantics; current page stays on the item.

## Related

SideNav (organism), SideNavItem (atom), SideNavHeading (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

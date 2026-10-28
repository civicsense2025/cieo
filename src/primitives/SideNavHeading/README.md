# SideNavHeading

Rail heading; hidden when the rail is collapsed.

## Use when

- A rail group needs a visible text heading.
- The heading is plain text, not a link.

## Avoid when

- The heading must stay visible collapsed; headings hide by design.
- The text links somewhere; use SideNavItem instead.

## Anatomy

Plain `<h2>`; an ancestor `.cieo-side-nav[data-collapsed='true']` hides it via CSS.

## Behavior

No motion. No props. Always rendered by the host in order.

## Keyboard / accessibility

- Headings structure the rail for screen readers; keep them short.
- Never make the heading focusable or clickable.

## Do / don't

- Do: `<SideNavHeading>Workspace</SideNavHeading>` above its section.
- Don't: use two headings for one section; one name per group.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Hidden when collapsed; collapsed users lose the text (icons must carry meaning).
- Not a landmark; the nav's aria-label still names the rail.

## Related

SideNav (organism), SideNavSection (molecule), NavHeadingMenu (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

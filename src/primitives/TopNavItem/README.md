# TopNavItem

Single link in the top nav; marks the current page.

## Use when

- One section link lives inside TopNav or TopNavMenu.
- Exactly one item is current per nav.

## Avoid when

- The row needs a title plus description; use TopNavMegaMenuItem instead.
- The target is an action, not a destination; use a real `<button>`.

## Anatomy

Native `<a href>`; `current` renders `aria-current="page"` with an accent underline.

## Behavior

No motion. `current` defaults to false. The item never manages focus.

## Keyboard / accessibility

- Native link focus and order. Keep labels short so the bar stays scannable.
- Mark the current page with `current`, not with color or bold alone.

## Do / don't

- Do: `<TopNavItem href="/docs" current>Docs</TopNavItem>` on the docs page.
- Don't: set `current` on two items in the same nav.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No disabled state; hide links that cannot be used.
- Label is plain content; no icons or badges inside.

## Related

TopNav (organism), TopNavMenu (molecule), SideNavItem (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

# SideNavItem

Single link in the side rail; marks the current page.

## Use when

- One section link lives inside SideNav or SideNavSection.
- Exactly one item is current per rail.

## Avoid when

- The link lives in a header; use TopNavItem instead.
- The target is an action; use a real `<button>`.

## Anatomy

Native `<a href>`; `current` renders `aria-current="page"` with an accent marker.

## Behavior

No motion. `current` defaults to false. The item never manages focus.

## Keyboard / accessibility

- Native link focus and order. Keep labels short so the rail stays scannable.
- Mark the current page with `current`, not with color alone.

## Do / don't

- Do: `<SideNavItem href="/settings" current>Settings</SideNavItem>` on the settings page.
- Don't: set `current` on two items in the same rail.

## Customization

`current` only. Color and marker come from Cieo tokens.

## Limitations

- No disabled state; hide links that cannot be used.
- Label is content; pair with NavIcon as a sibling, not nested interactivity.

## Related

SideNav (organism), SideNavSection (molecule), NavIcon (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

# TopNav

Sticky site header with a labelled primary nav (brand, section links, a mega menu).

## Use when

- The page needs one persistent header with the brand and primary sections.
- Links belong to a single named nav landmark ("Primary", "Docs").

## Avoid when

- The page needs a side rail or a drawer; use SideNav or MobileNav instead.
- There is only one link; a lone link needs no header landmark.

## Anatomy

`<header>` wraps one `<nav aria-label>`; host brand, items, menus, and mega menus are children. Header sticks to the viewport top.

## Behavior

No motion. Sticky top with a surface background and a bottom border. Nav wraps nothing; overflow is the host's problem.

## Keyboard / accessibility

- Nav carries the name (`aria-label`, defaults to "Primary"). Do not repeat it on children.
- Current page uses TopNavItem `current`, never bold text alone.

## Do / don't

- Do: `<TopNav label="Primary">` with a TopNavHeading, items, and one mega menu.
- Don't: nest a second `<nav>` inside without its own distinct label.

## Customization

Label only. Colors, height, and borders come from Cieo tokens; do not restyle per instance.

## Limitations

- One nav per header. A second landmark needs its own labelled nav outside.
- No overflow menu; too many items clip on narrow screens (use MobileNav).

## Related

TopNavItem (atom), TopNavHeading (atom), TopNavMenu (molecule), TopNavMegaMenu (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

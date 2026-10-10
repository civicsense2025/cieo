# SideNav

Section rail nav; collapsed narrows to an icon rail.

## Use when

- Docs or settings need a persistent vertical section rail.
- Collapsing to icons is host-driven and reversible.

## Avoid when

- The page needs a top header; use TopNav instead.
- The rail must overlay content; that is MobileNav, not a rail.

## Anatomy

`<nav aria-label>` in a vertical flex column. `data-collapsed` narrows the rail; headings hide.

## Behavior

No motion. `label` defaults to "Sections"; `collapsed` defaults to false. Rail never owns its collapsed state.

## Keyboard / accessibility

- Nav carries the name (`aria-label`, defaults to "Sections"). Do not repeat it on children.
- Current page uses SideNavItem `current`; collapsed rail keeps every link focusable.

## Do / don't

- Do: `<SideNav label="Docs sections">` with SideNavSections and a collapse button.
- Don't: remove labels when collapsed; icons alone fail the name test (keep tooltips or sr text).

## Customization

Label and collapsed only. Width, colors, and spacing come from Cieo tokens.

## Limitations

- No flyout submenus; one level of sections only.
- Host must wire SideNavCollapseButton to `collapsed`; the rail never toggles itself.

## Related

SideNavItem (atom), SideNavSection (molecule), SideNavCollapseButton (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

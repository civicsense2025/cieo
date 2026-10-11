# MobileNavToggle

Button that opens the drawer; host owns expanded state.

## Use when

- A header needs a menu button that opens MobileNav.
- `expanded` mirrors the drawer's `open` state.

## Avoid when

- There is no drawer; a toggle without a target confuses users.
- The control navigates; this toggles state only.

## Anatomy

Native `<button aria-expanded>` labelled by `label` (defaults to "Open navigation").

## Behavior

No motion. `expanded` is required; `onToggle` is optional. Button never owns state.

## Keyboard / accessibility

- `aria-expanded` mirrors the drawer. Keep it visible while the drawer is closed.
- Label names the action ("Open navigation"), never "Menu" alone without context.

## Do / don't

- Do: `<MobileNavToggle expanded={open} onToggle={flip} />` next to the brand.
- Don't: hide the toggle while the drawer is open without offering close inside.

## Customization

Label only. Type and hit area come from Cieo tokens.

## Limitations

- Label does not flip automatically; the host supplies state-aware text.
- No icons inside; pair with NavIcon as a sibling.

## Related

MobileNav (organism), SideNavCollapseButton (atom), NavIcon (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

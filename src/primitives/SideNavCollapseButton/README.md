# SideNavCollapseButton

Button that toggles the rail; host owns expanded state.

## Use when

- The rail footer needs a collapse/expand control.
- `expanded` and `onToggle` are wired to SideNav `collapsed`.

## Avoid when

- The rail never collapses; omit the button entirely.
- The control navigates; this toggles state only.

## Anatomy

Native `<button aria-expanded>` labelled by `label` (defaults to "Collapse navigation").

## Behavior

No motion. `expanded` is required; `onToggle` is optional. Button never owns state.

## Keyboard / accessibility

- `aria-expanded` mirrors the rail (expanded true means rail open).
- Keep the label accurate in both states; "Collapse" when open, "Expand" when shut (host text).

## Do / don't

- Do: `<SideNavCollapseButton expanded={open} onToggle={flip} />` in the rail footer.
- Don't: drive two rails from one button; one control per rail.

## Customization

Label only. Type and hit area come from Cieo tokens.

## Limitations

- Label does not flip automatically; the host supplies state-aware text.
- No icons inside; pair with NavIcon as a sibling.

## Related

SideNav (organism), MobileNavToggle (atom), NavIcon (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

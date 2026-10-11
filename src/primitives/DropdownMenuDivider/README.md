# DropdownMenuDivider

Visual split between menu clusters, for separating actions from danger rows.

## Use when

- A menu mixes safe rows and destructive rows and needs a hard visual break.
- Two clusters sit in one menu without group captions.

## Avoid when

- The clusters have names; use DropdownMenuGroup with labels instead.
- There is only one cluster; a divider with nothing to separate is noise.

## Anatomy

Empty `div role="separator"`; one hairline rule, full bleed. No props, no slots, no children.

## Behavior

No motion, no state, no focus. Purely decorative structure; screen readers announce the separation and move on.

## Keyboard / accessibility

- `role="separator"` keeps the break perceivable without adding a tab stop.
- Never make it focusable or clickable; it is not a control.
- One divider between clusters; never two in a row or at the menu edges.

## Do / don't

- Do: `<DropdownMenuDivider />` between the share rows and the delete row.
- Don't: use it as spacing; gap between related rows needs no rule.

## Customization

None. Color and thickness come from Cieo tokens; do not restyle per menu.

## Limitations

- No props or slots by design; any variant is a different component.
- Cannot label the break; labeled breaks are DropdownMenuGroup.

## Related

DropdownMenuGroup (atom), DropdownMenuItem (atom), Divider (primitive).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

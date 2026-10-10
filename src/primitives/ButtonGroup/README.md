# ButtonGroup

Group related buttons into one connected control (clipboard actions, a split save).

## Use when

- 2–5 actions share one purpose and sit in one row or column.
- Each action is still its own real `<button>` with its own label.

## Avoid when

- Actions are unrelated; use separate Buttons with spacing instead.
- You need single-choice semantics; that is a radio or segmented control, not a group.

## Anatomy

Root `role="group"` with `aria-label`; host buttons as children. Borders collapse; only outer corners round.

## Behavior

No motion. Orientation defaults to horizontal; vertical stacks. Group never steals focus.

## Keyboard / accessibility

- Root carries the group name (`aria-label`, required). Do not repeat it on children.
- Children keep native button focus and order. Visible focus must survive the border collapse.

## Do / don't

- Do: `<ButtonGroup label="Clipboard actions">` with Copy/Cut/Paste buttons.
- Don't: wrap unrelated primary actions to save space; the shared border implies relation.

## Customization

Orientation only. Colors, radius, and spacing come from Cieo tokens; do not restyle borders per instance.

## Limitations

- Max 16 children. More means the actions are not related; split the group.
- No selection semantics; for single-choice use a radio or segmented control.

## Related

Button (atom), Toolbar (organism), ToggleButtonGroup (lane plan).

## Evidence

Storybook-free: covered by `test/primitives-button-group.test.mjs` + docs preview. No device acceptance in this plan.

# TableSelectionToolbar

Selected-count bar with bulk table actions.

## Use when

- One or more table rows are selected and bulk actions apply.
- The host can pass an exact `selectedCount` and action buttons.

## Avoid when

- Nothing is selected; hide the bar instead of showing "0 selected".
- Actions apply to the whole table; use a plain Toolbar instead.

## Anatomy

`role="toolbar"` named "N selected"; a count label plus host action children (Delete, Export).

## Behavior

No motion. Renders the count text and actions; selection state stays with the host.

## Keyboard / accessibility

- Toolbar name always matches the visible count; update both together.
- Actions keep native button focus and order inside the toolbar.

## Do / don't

- Do: `<TableSelectionToolbar selectedCount={3}>` with Delete/Export buttons.
- Don't: invent a count; pass the host's real selection length.

## Customization

Count value only. Layout and surface come from Cieo tokens.

## Limitations

- Max 8 actions. More means the bulk workflow needs its own screen.
- No select-all logic; the host owns selection controls.

## Related

Table (organism), TableRow (atom), Toolbar (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

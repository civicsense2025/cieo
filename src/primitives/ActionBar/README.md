# ActionBar

A toolbar for a row of action buttons: one tab stop, arrow keys move between the buttons.

## Use when

- A row of CountButtons under each post in a long feed.
- Any short row of related buttons.

## Avoid when

- The row holds inputs or links; they are not part of the arrow-key order.
- A single button; skip the toolbar.

## Anatomy

A `div` with `role="toolbar"` wrapping the host's buttons.

## Behavior

- Exactly one button has `tabindex="0"`; the rest are `-1`. The last focused button keeps the tab stop.
- `align="between"` spreads the buttons across the row.

## Keyboard / accessibility

ArrowLeft and ArrowRight move focus and wrap; Home and End jump to the ends. Disabled buttons are skipped.

## Do / don't

- Do: label the bar ("Post actions").
- Don't: put non-button controls in it.

## Customization

Size and align props; spacing from tokens.

## Limitations

- Before scripts run every button is tabbable; the single tab stop applies after hydration.

## Related

CountButton, ShareButton, NotifyToggle.

## Evidence

`test/primitives-engagement-actions.test.mjs`.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

# TableRow

Table row with optional selected highlight.

## Use when

- Rendering one row inside a TableHeader, TableBody, or TableFooter.
- The host knows the row is selected and passes `selected`.

## Avoid when

- Outside thead/tbody/tfoot; a bare tr is invalid.
- Selection state lives elsewhere; lift it to the host and pass it down.

## Anatomy

Real `<tr>` with `data-selected` and `aria-selected`; children are TableCell or TableHeaderCell cells. Selected rows get a token highlight.

## Behavior

No motion. `selected` defaults to false. Component renders; host decides.

## Keyboard / accessibility

- `aria-selected` announces selection; keep it in sync with host state.
- Do not make the row itself focusable unless the host wires row activation.

## Do / don't

- Do: `<TableRow selected>` for rows the host has checked.
- Don't: toggle `selected` internally; selection state belongs to the host.

## Customization

Selected flag only. Highlight color comes from Cieo tokens.

## Limitations

- Max 32 cells. Wider rows should become stacked cards, not tables.
- No expand/collapse logic; that is a host pattern.

## Related

TableBody (molecule), TableCell (atom), TableHeaderCell (atom), TableSelectionToolbar (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

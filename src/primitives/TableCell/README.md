# TableCell

Table data cell with standard padding.

## Use when

- Rendering one data value inside a TableRow.
- Content is plain text, a number, or one simple control.

## Avoid when

- Content labels a row or column; use TableHeaderCell instead.
- Outside a TableRow; a bare td is invalid.

## Anatomy

Real `<td>` with token padding and start alignment. One slot for cell content.

## Behavior

No motion. Renders children as-is; owns no logic.

## Keyboard / accessibility

- Inherits table semantics; adds no roles of its own.
- Interactive content keeps native focus; do not wrap it in extra tab stops.

## Do / don't

- Do: short values the column header describes ("47", "Active").
- Don't: stack paragraphs in a cell; move prose out of the table.

## Customization

None. Padding and alignment come from Cieo tokens.

## Limitations

- Max 8 content nodes. More means the cell is a layout, not a value.
- No truncation logic; the host owns overflow policy.

## Related

TableRow (atom), TableHeaderCell (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

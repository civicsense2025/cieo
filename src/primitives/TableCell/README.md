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

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Max 8 content nodes. More means the cell is a layout, not a value.
- No truncation logic; the host owns overflow policy.

## Related

TableRow (atom), TableHeaderCell (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

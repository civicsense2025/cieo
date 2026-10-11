# TableHeaderCell

Table header cell with scope and optional sort button.

## Use when

- Labelling a column (`scope="col"`) or a row (`scope="row"`).
- The host offers sorting and passes `sort` plus `onSort`.

## Avoid when

- Content is data, not a label; use TableCell instead.
- Sorting is unavailable; leave `sort` at none for a plain th.

## Anatomy

Real `<th>` with `scope`. `sort` none renders plain content; asc/desc renders `aria-sort` on the th plus a `<button>` invoking `onSort`.

## Behavior

No motion. Scope defaults to col, sort to none. Pressing the sort button calls `onSort`; the host reorders data.

## Keyboard / accessibility

- `aria-sort` announces ascending/descending on sortable headers.
- Sort button keeps native button focus; label it with the column name.

## Do / don't

- Do: `<TableHeaderCell sort="asc" onSort={...}>Name</TableHeaderCell>` for sortable columns.
- Don't: sort data inside the component; the host owns data order.

## Customization

Scope and sort state only. Type and button reset come from Cieo tokens.

## Limitations

- Max 8 content nodes. Headers must stay short.
- No multi-column sort UI; the host composes that from single sorts.

## Related

TableHeader (molecule), TableCell (atom), TableRow (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

# TableHeader

Table head grouping for column header rows.

## Use when

- A Table needs one or more column header rows.
- Headers describe columns below them in the same table.

## Avoid when

- Outside a Table; thead is meaningless without a table.
- Rows hold data, not headers; use TableBody instead.

## Anatomy

Real `<thead>`; children are TableRow rows holding TableHeaderCell cells. Strong bottom border separates headers from data.

## Behavior

No motion. Renders children in order; owns no data logic.

## Keyboard / accessibility

- Lives inside a labelled Table; adds no name of its own.
- Header cells must carry `scope` so readers map columns correctly.

## Do / don't

- Do: one TableHeader with a single row of TableHeaderCell columns.
- Don't: put data cells in the header; readers announce them as headers.

## Customization

None. Divider color and weight come from Cieo tokens.

## Limitations

- Max 16 rows. More header rows mean the table is over-structured.
- No sticky or fixed behavior; the host page owns scrolling.

## Related

Table (organism), TableHeaderCell (atom), TableBody (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

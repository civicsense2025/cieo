# TableBody

Table body grouping for data rows.

## Use when

- A Table needs data rows under its headers.
- Rows come from host data in document order.

## Avoid when

- Outside a Table; tbody is meaningless without a table.
- Rows summarize data; use TableFooter instead.

## Anatomy

Real `<tbody>`; children are TableRow rows. Row dividers separate consecutive rows.

## Behavior

No motion. Renders rows in order; owns no data logic.

## Keyboard / accessibility

- Lives inside a labelled Table; adds no name of its own.
- Keep row content plain text or simple controls so readers move quickly.

## Do / don't

- Do: map host data to TableRow children in stable order.
- Don't: nest another table inside a body row; flatten the data.

## Customization

None. Dividers come from Cieo tokens.

## Limitations

- Max 256 rows per body. Beyond that the host must paginate.
- No virtualization; large sets stay the host's problem.

## Related

Table (organism), TableRow (atom), TableFooter (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

# TableFooter

Table foot grouping for summary rows.

## Use when

- A Table needs totals or summary rows after its data.
- Footers repeat column meaning from the header.

## Avoid when

- Outside a Table; tfoot is meaningless without a table.
- Rows hold data, not summaries; use TableBody instead.

## Anatomy

Real `<tfoot>`; children are TableRow rows. Strong top border separates summaries from data.

## Behavior

No motion. Renders children in order; owns no data logic.

## Keyboard / accessibility

- Lives inside a labelled Table; adds no name of its own.
- Mark summary labels with TableHeaderCell scope row where they name a row.

## Do / don't

- Do: a totals row ("Total", "1,240") at the end of a numeric table.
- Don't: duplicate the full header; one summary row usually suffices.

## Customization

None. Divider color and weight come from Cieo tokens.

## Limitations

- Max 16 rows. More footer rows mean summaries belong in prose.
- No sticky behavior; the host page owns scrolling.

## Related

Table (organism), TableRow (atom), TableBody (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

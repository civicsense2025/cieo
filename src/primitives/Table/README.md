# Table

Accessible data table wrapper using real table semantics.

## Use when

- Presenting rows of structured data with column headers.
- The host can name the table with a short `label` (e.g. "Registered voters").

## Avoid when

- Content is layout, not data; use Stack or a grid instead.
- A single value list fits better; that is a MetadataList, not a table.

## Anatomy

Real `<table>` with `aria-label`; children are TableHeader, TableBody, and TableFooter parts. Cell borders come from Table CSS descendant rules.

## Behavior

No motion. Full width with collapsed borders and tabular numerals. Component owns rendering; the host owns all data operations.

## useTable* hooks

Sorting, filtering, pagination, and selection hooks do not exist yet. The host owns data operations (sort order, filters, pages, checked rows) and passes rendered parts down; this component owns rendering only.

## Keyboard / accessibility

- Root carries the table name (`aria-label`, required). Do not repeat it on headers.
- Headers must use TableHeaderCell with the right `scope`; never div-grids.
- Keep header text short so screen readers announce columns cleanly.

## Do / don't

- Do: `<Table label="Registered voters">` with TableHeader/TableBody parts.
- Don't: build a table from divs; native semantics carry the meaning.

## Customization

Label only. Width, borders, and type come from Cieo tokens; do not restyle cells per instance.

## Limitations

- Max 3 parts (header, body, footer). More means the content is not one table.
- No sorting, filtering, pagination, or selection logic; the host owns data operations.

## Related

TableHeader (molecule), TableBody (molecule), TableFooter (molecule), TableSelectionToolbar (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

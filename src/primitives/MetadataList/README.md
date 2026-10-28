# MetadataList

Description list grid of term and description pairs.

## Use when

- Showing record facts (status, owner, updated) as term/description pairs.
- Pairs read in document order without column headers.

## Avoid when

- Data has sortable columns; use a Table instead.
- Content is one term with a long article; use prose headings instead.

## Anatomy

Real `<dl>` laid out as a term/description grid; children are MetadataListItem pairs. Items use display contents so the grid applies.

## Behavior

No motion. Renders pairs in order; owns no logic.

## Keyboard / accessibility

- Native dl/dt/dd semantics; adds no roles of its own.
- Keep terms short so readers can scan the list quickly.

## Do / don't

- Do: 3–8 fact pairs ("Status: Active", "Owner: Library team").
- Don't: nest interactive widgets deep in descriptions; link out instead.

## Customization

None. Grid, gaps, and term color come from Cieo tokens.

## Limitations

- Max 64 items. Longer records should become sections, not pairs.
- No two-column value layouts; one term maps to one description.

## Related

MetadataListItem (atom), Table (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

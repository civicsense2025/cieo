# TreeList

Nested list with depth-driven indent for tree data.

## Use when

- Rendering hierarchy (folders, outlines, org charts) as nested lists.
- Each level knows its numeric `depth`.

## Avoid when

- Data is flat; use a List instead.
- Nodes need selection or expansion widgets; the host adds those per item.

## Anatomy

Real `<ul>` with `data-depth`; CSS indents levels 0–6. Recursion: place a deeper TreeList inside an `<li>` of its parent.

## Behavior

No motion. Depth defaults to 0. Component indents; host owns tree data and expansion.

## Keyboard / accessibility

- Native list semantics; nesting level is structural, not announced as depth.
- Keep item labels plain so readers hear hierarchy through nesting.

## Do / don't

- Do: `<li>Folder<ul data-depth…>` nesting, one TreeList per level.
- Don't: skip depths (0 to 2); indent implies missing structure.

## Customization

Depth value only. Indent steps come from Cieo spacing; max depth is 6.

## Limitations

- Max depth 6 and 256 items per level. Deeper trees need search, not indent.
- No expand/collapse or selection logic; host items own that.

## Related

List (molecule), Collapsible (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

# CommandPaletteGroup

Labeled cluster of commands inside the palette list.

## Use when

- Matches split into stable sections (Pages, Actions, People).
- A heading helps scanning more than it costs in noise.

## Avoid when

- There is one section; drop the group and render items directly.
- Headings would repeat the item text; merge instead.

## Anatomy

`div role="group"` with optional `aria-label`; optional heading paragraph plus item children.

## Behavior

No motion. Groups never filter or collapse; the host decides which survive the query.

## Keyboard / accessibility

- `label` renders a presentational heading and names the group; omit it for a single anonymous cluster.
- Headings are text, never controls; focus stays on items.

## Do / don't

- Do: `<CommandPaletteGroup label="Pages">` around page items.
- Don't: nest groups; one level of sections is the whole model.

## Customization

Heading tone only. Spacing comes from Cieo tokens.

## Limitations

- No collapsible sections; show, hide, or cap per host policy.
- Empty groups must be removed by the host, not rendered blank.

## Related

CommandPaletteList (molecule), CommandPaletteItem (atom), ComplexSelector (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

# CollapsibleGroup

Accordion shell grouping related disclosures.

## Use when

- Several Collapsibles form one set (FAQ, settings sections).
- The host coordinates which panels stay open.

## Avoid when

- Only one panel exists; use a lone Collapsible instead.
- Panels are unrelated; separate Collapsibles with spacing instead.

## Anatomy

`role="group"` with `aria-label`; children are Collapsible panels stacked with gaps. Host passes `open`/`onOpenChange` per child for exclusive behavior.

## Behavior

No motion. Renders children; owns no open state. Single-open accordion is a host pattern: track one open id and wire each child.

## Keyboard / accessibility

- Group carries the set name (`aria-label`, required). Do not repeat it on children.
- Children keep native button focus and order.

## Do / don't

- Do: pass `open={id === openId}` per child for exclusive accordion behavior.
- Don't: manage open state inside the group; the host owns it.

## Customization

Label only. Stacking and gaps come from Cieo tokens.

## Limitations

- Max 16 panels. More means the set needs search or sections.
- No exclusive logic built in; host wires it per child.

## Related

Collapsible (molecule), TableSelectionToolbar (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

# InputGroup

Flex addon wrapper that joins a control with its prefix or suffix text ($49.00, 5kg).

## Use when

- A control needs a non-editable prefix or suffix (currency symbol, unit, domain suffix).
- The addons decorate exactly one control and submit nothing themselves.

## Avoid when

- The addons are actions; buttons belong in a ButtonGroup, not an InputGroup.
- The control needs a label/help row; wrap the whole InputGroup in a Field instead.

## Anatomy

Root `div.cieo-p-input-group` (flex): `InputGroupText` addons plus one host control child. Optional `label` adds `role="group"` with `aria-label`.

## Behavior

No motion. Addons join the control visually; the control keeps native focus, value, and form participation.

## Keyboard / accessibility

- Pass `label` when the addons alone do not name the control; the group then announces it once.
- Addons are plain text (`InputGroupText` renders a `span`): never focusable, never interactive.

## Do / don't

- Do: `<InputGroup label="Price in dollars"><InputGroupText>$</InputGroupText><input /><InputGroupText>.00</InputGroupText></InputGroup>`.
- Don't: put buttons, links, or additional inputs inside the addon spans.

## Customization

Label only. Flex rhythm, addon face, and joined borders come from Cieo tokens.

## Limitations

- Exactly one control child; more means the addons no longer decorate one value.
- Addon text must stay short; long prose breaks the joined-control reading.

## Related

InputGroupText (atom), Field (molecule, for the label/help row), FieldStatus (atom, for the help/error line).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

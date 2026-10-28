# InputGroupText

Short non-interactive addon text inside an InputGroup ($, .00, kg).

## Use when

- Rendering one prefix or suffix addon of an `InputGroup`.
- The addon is plain text that decorates the control's value.

## Avoid when

- Outside `InputGroup`; a lone addon has no control to decorate.
- The addon is interactive; buttons and links are never addon text.

## Anatomy

`<span class="cieo-p-input-group-text">` with host text as its content slot. Styled by the shared `design/styles/primitives/input-group.css`.

## Behavior

No motion. Plain text; never focusable, never submitted, never announced as a separate control.

## Keyboard / accessibility

- Addons stay out of tab order (`span`, no tabindex). Screen readers meet them as part of the group's text.
- Keep addon text short so it does not drown the control's own label.

## Do / don't

- Do: `<InputGroupText>$</InputGroupText>` before the price input.
- Don't: put inputs, buttons, or long sentences inside an addon.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Single content slot (max 1). One addon, one short string.
- Requires an `InputGroup` parent for joined borders and rhythm.

## Related

InputGroup (molecule), Field (molecule), FieldStatus (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

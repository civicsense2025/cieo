# Dialog

Controlled modal panel over a scrim for short tasks (rename a file, confirm a choice).

## Use when

- The host needs one focused answer before continuing (a name, a confirmation).
- Content is short: a header, one control group, and 1–2 actions.

## Avoid when

- The flow has multiple steps; that is a wizard or a page, not a dialog.
- The content is reference material the reader keeps open; use an inline panel instead.

## Anatomy

`<Overlay />` scrim plus a `role="dialog"` panel with `aria-modal` and `aria-label`. Host content (header, body, actions) goes in the default slot.

## Behavior

No motion. Renders null when `open` is false or omitted; the host owns open state. Escape calls `onClose`; the host decides what closing means.

## Keyboard / accessibility

- Panel carries the accessible name (`aria-label`, required). Do not repeat it inside.
- Escape invokes `onClose`. Focus management (initial focus, trap, restore) belongs to the host.
- The scrim is presentational (`aria-hidden`) and never dismisses on its own.

## Do / don't

- Do: `<Dialog label="Rename file" open onClose={close}>` with a labeled input and Save/Cancel.
- Don't: leave `open` uncontrolled or omit `label`; an unnamed modal traps assistive tech.

## Customization

None per instance. Surface, border, radius, and width come from Cieo tokens.

## Limitations

- No focus trap or restore; the host wires those around this shell.
- One content subtree (slot max 1). Long scrolling content belongs on a page.

## Related

Overlay (atom), DialogHeader (molecule), AlertDialog (organism), BottomSheet (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

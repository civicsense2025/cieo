# AlertDialog

Dialog wrapper that marks urgent content with alertdialog semantics (delete a conversation, discard work).

## Use when

- The user is about to destroy data or take an irreversible step.
- The message needs alert semantics so assistive tech announces it immediately.

## Avoid when

- The outcome is reversible or low-stakes; use Dialog instead.
- You need a passive notice; that is a banner or toast, not a modal.

## Anatomy

Same-lane Dialog shell (scrim, centered panel, Escape) with an inner `role="alertdialog"` region carrying the label.

## Behavior

No motion. Renders null when `open` is false or omitted; the host owns open state. No extra visuals of its own.

## Keyboard / accessibility

- Inner region carries `role="alertdialog"` plus the label; the outer dialog keeps the same name.
- Escape invokes `onClose`. Focus management belongs to the host, as with Dialog.

## Do / don't

- Do: `<AlertDialog label="Delete conversation" open onClose={close}>` with Delete/Cancel actions.
- Don't: use it for routine confirms; alert semantics lose force when overused.

## Customization

None. AlertDialog has no style parts of its own; it reuses Dialog visuals exactly.

## Limitations

- No focus trap or restore; the host wires those around this shell.
- One content subtree (slot max 1). Destructive wording belongs to the host copy.

## Related

Dialog (organism), DialogHeader (molecule), BottomSheet (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

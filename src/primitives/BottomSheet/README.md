# BottomSheet

Bottom-anchored dialog sheet for short choices on narrow screens (share options, sort order).

## Use when

- The choice list is short and thumb-reachable on small viewports.
- The host already dismisses the same content as a Dialog on wide screens.

## Avoid when

- Content is long or form-heavy; that is a page or a centered Dialog.
- The sheet would cover the input it relates to; anchor it to the triggering view instead.

## Anatomy

`<Overlay />` scrim plus a `role="dialog"` panel with `data-side="bottom"`, `aria-modal`, and `aria-label`.

## Behavior

Stays mounted through the exit spring and unmounts when done; the host owns open state. Escape calls `onClose`.

## Motion

Springs in on open and plays the exit spring before unmounting on close. Reversal retargets continuously mid-flight. `motion={false}` renders the end state instantly. Reduced motion (OS setting or `data-motion="reduced"`) jumps to end states.

## Keyboard / accessibility

- Panel carries the accessible name (`aria-label`, required). Do not repeat it inside.
- Escape invokes `onClose`. Focus management (initial focus, trap, restore) belongs to the host.

## Do / don't

- Do: `<BottomSheet label="Share options" open onClose={close}>` with a short option list.
- Don't: stack sheets or open one from another; close the first before opening the next.

## Customization

None per instance. Surface, border, radius, and sheet width come from Cieo tokens.

## Limitations

- No focus trap, restore, or drag-to-dismiss; the host wires dismissal around this shell.
- One content subtree (slot max 1).

## Related

Dialog (organism), AlertDialog (organism), BottomSheetSwitcher (molecule), Overlay (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

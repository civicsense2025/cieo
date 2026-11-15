# Toast

Transient status notice with auto-dismiss and an optional action. Host owns open state; closing plays the exit spring before unmounting.

## Use when

- A background job finishes (export ready, file saved, encoder unavailable) and the user keeps working.
- A recovery or undo action belongs with the notice itself; pass it as children.

## Avoid when

- The notice must persist until acknowledged inline; use Banner.
- The content needs a title and body; this is one message plus one action.

## Anatomy

Fixed bottom notice on the toast layer: message, optional action slot, dismiss button. `role="status"` for info/success, `role="alert"` for warning/danger. Tone paints a leading-edge marker only — never color alone.

## Behavior

Entering rises on the base spring; closing (timer, Escape, dismiss) plays the exit spring before unmounting. Hovering or focusing pauses the auto-dismiss deadline and leaving or blurring outside resumes it with the time that was left, so a slow read never loses the notice. Reduced motion and `motion={false}` show and hide the end state. Stacking is host-owned: render one Toast per notice in a column.

## Keyboard / accessibility

- Dismiss button carries `dismissLabel`; Escape calls `onDone` like the button.
- Timer resets when `message` changes, so a replaced notice gets its full read time.
- `duration <= 0` disables auto-dismiss for notices that wait on the user.

## Do / don't

- Do: `<Toast message="Saved" tone="success" onDone={close}><button type="button" onClick={undo}>Undo</button></Toast>`.
- Don't: mount a Toast without wiring `onDone` back to `open`; the timer alone never unmounts.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One message, one action; longer content belongs in a Dialog.
- No queue; concurrent notices stack in host order.

## Related

Banner (molecule, persistent notice bar), Dialog (molecule, modal panel), EmptyState (molecule, centered no-result message).

## Evidence

Covered by `test/forma-gaps.test.mjs` (roles, timer, Escape, exit unmount). No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `message`, `action`, `dismiss`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, timers, presence, and focus order remain component-owned. Existing content props retain their original semantics.

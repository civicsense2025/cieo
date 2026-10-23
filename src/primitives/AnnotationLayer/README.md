# AnnotationLayer

Wraps any content for pin-and-comment review. Comment mode captures clicks or keyboard placement, pins are numbered, and the thread opens beside its pin.

## Use when

- Reviewers comment on a published page, image or prototype.
- The host stores comments and wants normalized 0..1 points.

## Avoid when

- Comments are not tied to a place; use a comment list.
- The content scrolls inside the layer; point math assumes the layer is the reference box.

## Anatomy

A relative wrapper with the content, an overlay present only in comment mode (crosshair cursor, keyboard reticle), a pin layer, and a popover slot placed next to the draft or selected pin.

## Behavior

- `active` turns comment mode on. A click calls `onPlace({ x, y })` with a point clamped to 0..1; the host creates `draft`.
- Pins are numbered 1..n in array order; the draft takes the next number.
- `selectedId` opens an existing pin's thread; `renderPopover` supplies the content, usually a `FeedbackPopover` without an anchor.
- `onSelect(null)` means close the thread or cancel the draft. Pressing the selected pin again closes it.
- The content is inert while comment mode is on.

## Keyboard / accessibility

- The active overlay is focusable. Arrow keys move a visible reticle by 2 percent, Shift by 10 percent. Enter or Space places.
- Escape cancels a draft or closes a thread first, then leaves comment mode through `onActiveChange(false)`.
- Pins are real buttons in index order.
- A polite status announces "Comment mode on. Click or press Enter to place a comment." and "Comment mode off."

## Do / don't

- Do keep points in 0..1 so pins follow the layout.
- Don't put the layer inside another scroll container that moves the content independently.

## Customization

The popover uses `FeedbackPopover` styling; pins use `AnnotationPin` tokens. The overlay tint comes from the accent token.

## Limitations

- The popover leaves without an exit animation when the host stops rendering it.
- Pointer placement needs the layer's box; it recomputes on resize through `ResizeObserver` where available.

## Related

`AnnotationPin`, `FeedbackPopover`.

## Evidence

Covered by `test/primitives-feedback.test.mjs` (normalizePoint, moveReticle, Escape order, numbering, overlay markup).

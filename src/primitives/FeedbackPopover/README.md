# FeedbackPopover

A small non-modal comment box with an optional thread above it. It can place itself beside a point and flip to stay inside its container.

## Use when

- A reviewer writes or reads a comment next to a pin.
- You need a compact reply box with Cmd/Ctrl+Enter to send.

## Avoid when

- The user must answer before continuing; use a dialog.
- You need rich text or attachments; compose those in `children` or the host form.

## Anatomy

A `role="dialog"` panel with an optional title, a thread slot (`children`), a textarea, and an action row (`secondaryActions` plus the submit button).

## Behavior

- Controlled by `open` and `onOpenChange`. Closing clears the draft text.
- Submit sends trimmed text once, then closes. The button is disabled while the text is blank.
- With `anchor` and `container` it is absolutely placed by `placePopover`: right first, then left, below, above, then the side with the most room, always clamped inside.
- Without them it renders in normal flow and the host positions it; `--cieo-feedback-origin` sets the scale origin.
- Opens from 0.96 scale with a fade, from the anchor side; closes faster. Reduced motion skips both.

## Keyboard / accessibility

- `aria-modal="false"`, named by its title or placeholder. Focus moves to the textarea on open and returns to the opener on close.
- Cmd or Ctrl plus Enter submits. Escape and a press outside close it.
- Tab is not trapped, because the page behind stays usable.

## Do / don't

- Do show the existing thread in `children`.
- Don't call `onSubmit` for whitespace; the component already blocks it.

## Customization

Width follows `min(17.5rem, 100%)`. Style through the raised, border and accent tokens.

## Limitations

- Placement is measured after first paint, so the first frame uses a default size.
- Text state is internal; the host receives it only on submit.

## Related

`AnnotationLayer`, `AnnotationPin`, `Popover`.

## Evidence

Covered by `test/primitives-feedback.test.mjs` (all four placement sides, clamping, shortcut, dialog markup).

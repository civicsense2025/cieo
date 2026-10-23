# CountButton

A ghost icon button with a rolling count. A toggle when `pressed` is given (like, repost), a plain action otherwise (reply).

## Use when

- Under a post: like, reply, repost.
- A single action with a count that changes while people watch.

## Avoid when

- The control is only a link to another page; use a link.
- No count and no toggle; use IconButton.

## Anatomy

A `button` holding an icon (with an optional active icon layered over it) and a `CompactCount`.

## Behavior

- Accessible name is `countButtonLabel(label, count, unit)`: "Like, 164 likes". Zero or missing count gives just the label.
- The visible count is shortened and rolls; the exact number lives in the name.
- On press the icon dips to 80% and settles back on the snap spring; the active icon and tone fade in. Reduced motion has no dip.
- `tone` colors hover and pressed states. The host flips `pressed`.

## Keyboard / accessibility

A real button. `aria-pressed` only when `pressed` is defined. Visible focus ring; hit target grows to the touch target on coarse pointers.

## Do / don't

- Do: give a verb label ("Like") and the exact count.
- Don't: add the count to the label yourself.

## Customization

Tone and size props; colors come from tokens.

## Limitations

- The icon is host supplied and must be decorative.

## Related

ActionBar, CompactCount, IconButton, ToggleButton.

## Evidence

`test/primitives-engagement-actions.test.mjs`.

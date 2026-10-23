# NotifyToggle

A bell toggle for "notify me about new replies". Turning it on rings the bell once and pops a check badge.

## Use when

- Following a thread or a post.

## Avoid when

- Notification channels or schedules; use a settings form.

## Anatomy

A `button` with a bell icon and a check badge.

## Behavior

- Turning on rings the bell once, a damped swing of a few degrees in under 440ms (`bellWiggleAngle`).
- Turning off settles without ringing.
- Reduced motion skips the ring.

## Keyboard / accessibility

A real button with `aria-pressed` and a plain-language label.

## Do / don't

- Do: word the label as a request.
- Don't: ring on page load.

## Customization

Size and label props.

## Limitations

- The ring runs through the Web Animations API; environments without it skip it.

## Related

FollowButton, CountButton.

## Evidence

`test/primitives-engagement-actions.test.mjs`.

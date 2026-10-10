# AvatarStatusDot

Presence dot pinned to one face (online, busy, away).

## Use when

- One face needs a presence cue that sighted readers see at a glance.
- Status pairs with adjacent text; the dot never carries meaning alone.

## Avoid when

- Status is conveyed by color alone; pair with text so meaning survives without color.
- The face sits in a dense stack; dots on every face become noise.

## Anatomy

Wrapper `span.cieo.cieo-p-avatar-status-dot-wrap` holds the face child plus a decorative `span.cieo-p-avatar-status-dot` with `data-status`.

## Behavior

No motion. Status defaults to `default`; `success`, `warning`, `danger`, and `info` recolor the dot. The dot never moves or pulses.

## Keyboard / accessibility

- Dot is `aria-hidden="true"`; it takes no focus and adds no name.
- Put the status in adjacent text (e.g. "Warren — online"), never in the dot alone.

## Do / don't

- Do: `<AvatarStatusDot status="success"><Avatar … /></AvatarStatusDot>` beside an "Online" label.
- Don't: use the dot as the only online indicator with no readable status text.

## Customization

Status only. Dot size, ring, and position come from Cieo tokens; do not restyle per instance.

## Limitations

- One face child only; stacks need one wrapper per face at most.
- Five statuses only; no custom colors.

## Related

Avatar (atom), StatusDot (atom), Badge (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

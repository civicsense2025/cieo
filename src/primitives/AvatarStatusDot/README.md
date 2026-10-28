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

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One face child only; stacks need one wrapper per face at most.
- Five statuses only; no custom colors.

## Related

Avatar (atom), StatusDot (atom), Badge (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `dot`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

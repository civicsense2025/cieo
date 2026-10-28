# StatusDot

Bare presence dot, named only when labelled.

## Use when

- A row needs a compact presence cue beside text that already names the state.
- The dot decorates; the adjacent words carry the meaning.

## Avoid when

- No adjacent text names the state; then `label` is required, not optional.
- The cue sits on a face; use AvatarStatusDot instead.

## Anatomy

Single `span.cieo.cieo-p-status-dot` with `data-status`. Labelled form uses `role="img"` + `aria-label`; unlabelled form is `aria-hidden`.

## Behavior

No motion. Status defaults to `default`; `success`, `warning`, `danger`, and `info` recolor the dot. Never pulses.

## Keyboard / accessibility

- Unlabelled dots are `aria-hidden`; the nearby text must name the state.
- Labelled dots use `role="img"` so lone dots still announce (e.g. a legend).

## Do / don't

- Do: `<StatusDot status="success" />` beside a visible "Online" word.
- Don't: a lone `<StatusDot status="danger" />` with no text or label anywhere.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Dot only; no text, no children, no slots.
- Five statuses only; no custom colors.

## Related

AvatarStatusDot (atom), Badge (atom), Text (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

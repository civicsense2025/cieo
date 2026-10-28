# AnnotationPin

A numbered teardrop marker whose tip sits on a point of a layer. One pin is one comment thread.

## Use when

- Reviewers drop comments on a specific spot of a page, image or design.
- You need a button that points at a location and carries a number.

## Avoid when

- The comment is about the whole page; use a plain comment list.
- Positions are in pixels and the layout can change; store 0..1 fractions instead.

## Anatomy

A zero-size button placed with `left` and `top` percentages, holding a rotated teardrop body with the number (or initials) counter-rotated inside. The tip is the point.

## Behavior

- `x` and `y` are 0..1 fractions of the positioned parent and are clamped.
- `state` draft, open or resolved changes color; resolved is muted and smaller.
- `selected` draws a focus-like ring and sets `aria-pressed`.
- Pops in from 0.45 scale about its tip. Reduced-motion and `data-motion='off'` skip it.

## Keyboard / accessibility

- A native button; Enter and Space call `onSelect`.
- Name reads "Comment 3, open" or "Comment 3 by Ava, resolved". The drawn number is hidden from assistive tech.
- The touch hit area extends beyond the drawn body.

## Do / don't

- Do number pins from array order.
- Don't put long text in a pin; use initials of at most three characters.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Needs a positioned parent; `AnnotationLayer` provides one.
- Does not open a thread itself.

## Related

`AnnotationLayer`, `FeedbackPopover`.

## Evidence

Covered by `test/primitives-feedback.test.mjs` (name contract, clamping, coordinates, state attributes).

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `body`, `text`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

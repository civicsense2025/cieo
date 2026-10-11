# AvatarGroup

Static overlapping face stack for rows. Decorative; the row owns the accessible name.

## Use when

- A story, event, timeline, vote, or bill row needs "who" at a glance: up to 4 faces plus +N.

## Avoid when

- You need hover fan-out or name popovers in a list. That demo is `AvatarGroupAnimated` on the catalogue page only; it costs too much across dozens of rows and breaks reduced-motion.
- A face has no approved photo: render `initials`, never a guessed photo. Earl Warren shows EW.

## Accessibility

- Stack root is `aria-hidden="true"`. Put names in the row: `<li aria-label="Brown v. Board, Warren, Marshall, +2 more">`.
- Never render one name twice (once visible on hover, once hidden). There is no hover text here.

## Customization

Size `sm|md` and `max` only. Overlap, ring, and initials styling come from tokens.

## Limitations

- Decorative only; it never carries the accessible name itself.
- Photos must be pre-approved URLs; no fetching, no guessing, no wrong-photo fallback.

## Related

Avatar (atom, single face), AvatarGroupAnimated (catalogue demo only), List (organism rows).

## Evidence

Covered by `test/primitives-avatar-group.test.mjs` + docs preview. No device acceptance in this plan.

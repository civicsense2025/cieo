# Avatar

Single face with photo or initials (one person, at a glance).

## Use when

- One person needs a face beside a name, row, or comment.
- A photo exists as a pre-approved URL; otherwise initials render.

## Avoid when

- Several faces share one row; use AvatarGroup with AvatarGroupOverflow instead.
- No name exists; Avatar requires `name` for its accessible label.

## Anatomy

Root `span[role="img"]` with `aria-label={name}` and `data-size`; approved `img` or initials span inside. Own classes `cieo-p-avatar-one`.

## Behavior

No motion. Size defaults to `md`; `sm` shrinks the circle. Photo fills and crops; initials center.

## Keyboard / accessibility

- Root carries the person's name (`role="img"` + `aria-label`, both required by types).
- Photo `alt` stays empty so the name is announced once, not twice.

## Do / don't

- Do: `<Avatar name="Earl Warren" initials="EW" />` beside a row label.
- Don't: pass a guessed photo URL; omit `src` and let initials render.

## Customization

Size only. Circle, ring, and initials styling come from Cieo tokens; do not restyle per instance.

## Limitations

- One face only; stacks need AvatarGroup.
- Photos must be pre-approved URLs; no fetching, no fallback guessing.

## Related

AvatarGroup (molecule), AvatarGroupOverflow (atom), AvatarStatusDot (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

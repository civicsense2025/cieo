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

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One face only; stacks need AvatarGroup.
- Photos must be pre-approved URLs; no fetching, no fallback guessing.

## Related

AvatarGroup (molecule), AvatarGroupOverflow (atom), AvatarStatusDot (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `initials`, `image`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

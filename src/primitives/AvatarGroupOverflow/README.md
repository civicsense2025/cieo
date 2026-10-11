# AvatarGroupOverflow

The +N disc that closes a face stack (how many faces are hidden).

## Use when

- A custom stack needs its own overflow disc outside AvatarGroup.
- The hidden count is known and positive.

## Avoid when

- AvatarGroup already renders its overflow; do not add a second disc.
- The count is zero; render nothing instead of +0.

## Anatomy

Single `span.cieo.cieo-p-avatar-group-overflow` with `data-size` and `+{count}` text. Decorative; the row owns names.

## Behavior

No motion. Size defaults to `md` and must match the stack faces. Renders the count verbatim.

## Keyboard / accessibility

- Root is `aria-hidden="true"`; put names and the full count in the row label.
- Never the sole conveyor of "who else"; the row text carries that.

## Do / don't

- Do: `<AvatarGroupOverflow count={3} />` after three faces sized `md`.
- Don't: render `<AvatarGroupOverflow count={0} />`; a zero overflow is noise.

## Customization

Count and size only. Disc fill, ring, and type come from Cieo tokens; do not restyle per instance.

## Limitations

- Count only, range 1–999; it never renders faces itself.
- Decorative only; it never carries the accessible name itself.

## Related

AvatarGroup (molecule), Avatar (atom), AvatarStatusDot (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

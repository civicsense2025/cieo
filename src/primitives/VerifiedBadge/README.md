# VerifiedBadge

A small seal with a check that marks an account as verified. It inherits the accent color and has an accessible name.

## Use when

- Next to a display name whose account the host has verified.

## Avoid when

- Marking anything that is not a verification (new, staff picks); use `Badge`.

## Anatomy

One inline `svg` with `role="img"` and an `aria-label`, a filled seal and a check stroke.

## Behavior

- `size="sm"` sits inline with caption text, `md` (default) with body text. Unknown sizes fall back to `md`.
- No motion.

## Keyboard / accessibility

Not focusable. Screen readers read the label ("Verified") after the name.

## Do / don't

- Do: pass a translated `label` in non-English interfaces.
- Don't: show it without the host having verified the account.

## Customization

Sized in `em`, so it scales with the surrounding text. Color comes from `--cieo-color-accent`.

## Limitations

- One seal shape; it does not carry verification kinds or dates.

## Related

`Badge`, `Avatar`, `Mention`.

## Evidence

Covered by `test/primitives-social-content.test.mjs` (role, label, size fallback).

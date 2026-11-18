# Button

First-class primitive contract over the Button control with async state morphing, tone, size, and asChild.

## Use when

- You need `Button` from `cieo/Button` or `cieo/primitives`.
- Use Button directly from cieo/Button or cieo/controls; both resolve to the single Button control.

## Avoid when

- Do not map an unconfirmed network timeout to done; pass state="uncertain" instead.

## Anatomy

Direct re-export of `Button` from `src/controls/Button.tsx`. Zero wrapper DOM and zero behavior fork.

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Use Button directly from cieo/Button or cieo/controls; both resolve to the single Button control.
- Don't: Do not map an unconfirmed network timeout to done; pass state="uncertain" instead.

## Customization

This alias retains the owning control’s customization API; see Host customization below.

## Limitations

- Keep usage aligned with the documented props and accessibility contract.

## Related

Slot (primitive), MotionFrame (primitive), Button (atom).

## Evidence

Verified by `test/wave2-primitives-and-wiring.test.mjs` and registry/customization checks.

## Host customization

Alias of Button; preserves its native/owning component props instead of creating a second control contract.

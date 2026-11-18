# Slot

Polymorphic asChild wrapper merging className, style, ref, ARIA attributes, and event handlers.

## Use when

- You need `Slot` from `cieo/Slot` or `cieo/primitives`.
- Pass a single valid React element when asChild is true so refs, styles, and handlers merge cleanly.

## Avoid when

- Do not pass multiple sibling elements when asChild is enabled.

## Anatomy

 Token-backed `primitive` with typed `slotProps` (root).

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Pass a single valid React element when asChild is true so refs, styles, and handlers merge cleanly.
- Don't: Do not pass multiple sibling elements when asChild is enabled.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Keep usage aligned with the documented props and accessibility contract.

## Related

Slot (primitive), MotionFrame (primitive), Button (atom).

## Evidence

Verified by `test/wave2-primitives-and-wiring.test.mjs` and registry/customization checks.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`.

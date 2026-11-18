# MorphSurface

Interruptible FLIP Container Transform driven by 5-channel SpringRect geometry.

## Use when

- You need `MorphSurface` from `cieo/MorphSurface` or `cieo/primitives`.
- Share one unique layoutId between compact and expanded representations of the same object.

## Avoid when

- Do not assign the same layoutId to two simultaneously visible unrelated surfaces.

## Anatomy

 Token-backed `primitive` with typed `slotProps` (root).

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Share one unique layoutId between compact and expanded representations of the same object.
- Don't: Do not assign the same layoutId to two simultaneously visible unrelated surfaces.

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

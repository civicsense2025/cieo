# MotionFrame

ResizeObserver height spring with directional shared-axis contentKey swaps.

## Use when

- You need `MotionFrame` from `cieo/MotionFrame` or `cieo/primitives`.
- Pair contentKey with a truthful direction sign (+1 forward, -1 backward) when stepping between views.

## Avoid when

- Do not animate height with raw CSS transitions; MotionFrame owns critically damped measurement.

## Anatomy

 Token-backed `primitive` with typed `slotProps` (root, content).

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Pair contentKey with a truthful direction sign (+1 forward, -1 backward) when stepping between views.
- Don't: Do not animate height with raw CSS transitions; MotionFrame owns critically damped measurement.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Keep usage aligned with the documented props and accessibility contract.

## Related

Slot (primitive), MotionFrame (primitive), Button (atom).

## Evidence

Verified by `test/wave2-primitives-and-wiring.test.mjs` and registry/customization checks.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `content`.

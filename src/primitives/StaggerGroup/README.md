# StaggerGroup

Bounded stagger entrance across direct children capped within a 300ms total window.

## Use when

- You need `StaggerGroup` from `cieo/StaggerGroup` or `cieo/primitives`.
- Keep budget at or below 300ms so long lists never make users wait for trailing items.

## Avoid when

- Do not stagger every keystroke filter update; reserve stagger for initial or route-level entrances.

## Anatomy

 Token-backed `primitive` with typed `slotProps` (root).

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Keep budget at or below 300ms so long lists never make users wait for trailing items.
- Don't: Do not stagger every keystroke filter update; reserve stagger for initial or route-level entrances.

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

# I18nProvider

Root-installable locale, writing direction (LTR/RTL), and built-in UI string overrides via CieoI18nProvider.

## Use when

- You need `I18nProvider` from `cieo/I18nProvider` or `cieo/primitives`.
- Install CieoI18nProvider near the application root to set locale, direction, and shared interface copy in one place.

## Avoid when

- Do not hardcode physical left/right styles inside RTL-capable subtrees; rely on logical properties.

## Anatomy

 Token-backed `primitive` with typed `slotProps` (root).

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Install CieoI18nProvider near the application root to set locale, direction, and shared interface copy in one place.
- Don't: Do not hardcode physical left/right styles inside RTL-capable subtrees; rely on logical properties.

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

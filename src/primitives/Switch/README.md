# Switch

First-class primitive contract over the native-backed Switch control.

## Use when

- You need `Switch` from `cieo/Switch` or `cieo/primitives`.
- Use Switch for binary preferences that take effect immediately or belong to a settings form.

## Avoid when

- Do not omit label; pass hideLabel when visual chrome already names the row.

## Anatomy

Direct re-export of `Switch` from `src/controls/Toggles.tsx`. Zero wrapper DOM and zero behavior fork.

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Use Switch for binary preferences that take effect immediately or belong to a settings form.
- Don't: Do not omit label; pass hideLabel when visual chrome already names the row.

## Customization

This alias retains the owning control’s customization API; see Host customization below.

## Limitations

- Keep usage aligned with the documented props and accessibility contract.

## Related

Slot (primitive), MotionFrame (primitive), Button (atom).

## Evidence

Verified by `test/wave2-primitives-and-wiring.test.mjs` and registry/customization checks.

## Host customization

Alias of Switch; preserves its native/owning component props instead of creating a second control contract.

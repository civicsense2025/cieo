# TextField

First-class primitive contract over the TextField control with reward-early / punish-late validation.

## Use when

- You need `TextField` from `cieo/TextField` or `cieo/primitives`.
- Always supply a real visible label; TextField wires label, description, and error descriptions automatically.

## Avoid when

- Do not replace a visible label with placeholder text.

## Anatomy

Direct re-export of `TextField` from `src/controls/TextField.tsx`. Zero wrapper DOM and zero behavior fork.

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Always supply a real visible label; TextField wires label, description, and error descriptions automatically.
- Don't: Do not replace a visible label with placeholder text.

## Customization

This alias retains the owning control’s customization API; see Host customization below.

## Limitations

- Keep usage aligned with the documented props and accessibility contract.

## Related

Slot (primitive), MotionFrame (primitive), Button (atom).

## Evidence

Verified by `test/wave2-primitives-and-wiring.test.mjs` and registry/customization checks.

## Host customization

Alias of TextField; preserves its native/owning component props instead of creating a second control contract.

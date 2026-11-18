# RadioGroup

First-class primitive contract over the fieldset-backed RadioGroup and Radio controls.

## Use when

- You need `RadioGroup` from `cieo/RadioGroup` or `cieo/primitives`.
- Render 2 to 6 mutually exclusive choices when seeing every option at once helps comparison.

## Avoid when

- Do not render standalone Radio inputs without a naming fieldset or RadioGroup.

## Anatomy

Direct re-export of `RadioGroup` from `src/controls/Toggles.tsx`. Zero wrapper DOM and zero behavior fork.

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Render 2 to 6 mutually exclusive choices when seeing every option at once helps comparison.
- Don't: Do not render standalone Radio inputs without a naming fieldset or RadioGroup.

## Customization

This alias retains the owning control’s customization API; see Host customization below.

## Limitations

- Keep usage aligned with the documented props and accessibility contract.

## Related

Slot (primitive), MotionFrame (primitive), Button (atom).

## Evidence

Verified by `test/wave2-primitives-and-wiring.test.mjs` and registry/customization checks.

## Host customization

Alias of RadioGroup; preserves its native/owning component props instead of creating a second control contract.

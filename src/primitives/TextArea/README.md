# TextArea

First-class primitive contract over the auto-growing TextArea control with rolling character counter.

## Use when

- You need `TextArea` from `cieo/TextArea` or `cieo/primitives`.
- Set sensible minRows and maxRows bounds so long drafts grow smoothly without pushing actions off screen.

## Avoid when

- Do not fork textarea auto-sizing in application CSS; TextArea springs height natively.

## Anatomy

Direct re-export of `TextArea` from `src/controls/TextArea.tsx`. Zero wrapper DOM and zero behavior fork.

## Behavior

Critically damped spring motion where applicable; respects `prefers-reduced-motion` and `data-motion="reduced"` automatically.

## Keyboard / accessibility

- Preserves native HTML roles, labels, focus order, and ARIA relationships.
- Never relies on color or motion alone to convey state.

## Do / don't

- Do: Set sensible minRows and maxRows bounds so long drafts grow smoothly without pushing actions off screen.
- Don't: Do not fork textarea auto-sizing in application CSS; TextArea springs height natively.

## Customization

This alias retains the owning control’s customization API; see Host customization below.

## Limitations

- Keep usage aligned with the documented props and accessibility contract.

## Related

Slot (primitive), MotionFrame (primitive), Button (atom).

## Evidence

Verified by `test/wave2-primitives-and-wiring.test.mjs` and registry/customization checks.

## Host customization

Alias of TextArea; preserves its native/owning component props instead of creating a second control contract.

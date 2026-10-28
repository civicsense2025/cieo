# CheckboxInput

Single checkbox under its Astryx name: a thin contract over the Checkbox control.

## Use when

- The design calls the control CheckboxInput. Import from this path, not from controls directly.
- You need one labelled native checkbox with optional indeterminate state.

## Avoid when

- You want different checkbox behavior; there is exactly one checkbox behavior, owned by `src/controls/Toggles.tsx`. Change it there, never here.
- You need a group of related checkboxes; that is a CheckboxList of CheckboxListItems.

## Anatomy

Re-export only: `Checkbox as CheckboxInput`, `CheckboxProps as CheckboxInputProps`. Label, optional description, native `<input type="checkbox">` — all owned by Checkbox.

## Behavior

Equals Checkbox exactly: native form participation, indeterminate set after mount, check draws on the spring tokens. This file declares no component and no logic.

## Keyboard / accessibility

- Inherits Checkbox: native checkbox keyboard support (Space toggles), `label` required (or visually hidden via `hideLabel`).
- `description` binds via `aria-describedby`; `indeterminate` is visual plus native state, never a third value.

## Do / don't

- Do: `import { CheckboxInput } from '../../primitives/CheckboxInput/CheckboxInput.js'` wherever Astryx says CheckboxInput.
- Don't: add props, styling, or wrappers here; extend Checkbox if behavior must change.

## Customization

This alias retains the owning control’s customization API; see Host customization below.

## Limitations

- No new CSS and no new behavior by design. Any limitation is Checkbox's limitation.
- Manifest `extensions.wraps` points at `src/controls/Toggles.tsx` as the single source of truth.

## Related

CheckboxList (molecule, for grouped checkboxes), RadioListItem (atom, the single-choice peer), Field (molecule, for the label/help row around other controls).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

Alias of Checkbox; preserves its native/owning component props instead of creating a second control contract. Use the underlying component’s supported `className`, style/native props, and content slots. This alias intentionally does not fork behavior or introduce a competing `slotProps` shape.

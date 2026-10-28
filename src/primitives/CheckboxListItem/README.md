# CheckboxListItem

One checkbox row inside a CheckboxList: a thin contract over the Checkbox control.

## Use when

- Rendering one option of a `CheckboxList` group.
- The design calls the row CheckboxListItem. Import from this path, not from controls directly.

## Avoid when

- You want different checkbox behavior; there is exactly one checkbox behavior, owned by `src/controls/Toggles.tsx`. Change it there, never here.
- The option stands outside any list; use CheckboxInput instead.

## Anatomy

Re-export only: `Checkbox as CheckboxListItem`, `CheckboxProps as CheckboxListItemProps`. Label, optional description, native `<input type="checkbox">` — all owned by Checkbox.

## Behavior

Equals Checkbox exactly: native form participation, Space toggles, indeterminate supported. This file declares no component and no logic.

## Keyboard / accessibility

- Inherits Checkbox: native checkbox keyboard support, `label` required (or visually hidden via `hideLabel`).
- The parent CheckboxList owns the group name; never repeat it on the item.

## Do / don't

- Do: `<CheckboxListItem label="Email" />` inside `<CheckboxList label="...">`.
- Don't: add props, styling, or wrappers here; extend Checkbox if behavior must change.

## Customization

This alias retains the owning control’s customization API; see Host customization below.

## Limitations

- No new CSS and no new behavior by design. Any limitation is Checkbox's limitation.
- Requires a `CheckboxList` parent for group semantics.

## Related

CheckboxList (molecule), CheckboxInput (atom, the standalone peer), RadioListItem (atom, the single-choice peer).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

Alias of Checkbox; preserves its native/owning component props instead of creating a second control contract. Use the underlying component’s supported `className`, style/native props, and content slots. This alias intentionally does not fork behavior or introduce a competing `slotProps` shape.

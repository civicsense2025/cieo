# RadioListItem

One radio option inside a RadioList: a thin contract over the Radio control.

## Use when

- Rendering one option of a `RadioList` group.
- The design calls the row RadioListItem. Import from this path, not from controls directly.

## Avoid when

- You want different radio behavior; there is exactly one radio behavior, owned by `src/controls/Toggles.tsx`. Change it there, never here.
- The option allows multi-select; use CheckboxListItem instead.

## Anatomy

Re-export only: `Radio as RadioListItem`, `RadioProps as RadioListItemProps`. Label, required `value`, optional description, native `<input type="radio">` — all owned by Radio.

## Behavior

Equals Radio exactly: native form participation, dot grows on the snap token. This file declares no component and no logic.

## Keyboard / accessibility

- Inherits Radio: native radio keyboard support, `label` and `value` required (label visually hidden via `hideLabel` when needed).
- The parent RadioList owns the group name; never repeat it on the item.

## Do / don't

- Do: `<RadioListItem label="Express" value="express" />` inside `<RadioList label="...">`.
- Don't: add props, styling, or wrappers here; extend Radio if behavior must change.

## Customization

None here. Props mirror Radio (`label`, `value`, `hideLabel`, `description` plus native input attrs); tokens and styling live with the Radio control.

## Limitations

- No new CSS and no new behavior by design. Any limitation is Radio's limitation.
- Requires a `RadioList` parent for group semantics.

## Related

RadioList (molecule), Radio (control, the implementation), CheckboxListItem (atom, the multi-select peer).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

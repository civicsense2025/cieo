# DropdownMenuCheckboxItem

Menu row that flips one setting on or off without closing the menu.

## Use when

- A menu row toggles an independent setting (show line numbers, word wrap).
- Several such rows can be on at once; each keeps its own `aria-checked`.

## Avoid when

- The row runs a one-shot action; use DropdownMenuItem instead.
- The row picks one of many; use DropdownMenuRadioItem instead.

## Anatomy

Native `<button>` with `role="menuitemcheckbox"` and `aria-checked`. `data-checked` mirrors state for styling.

## Behavior

No motion. `checked` defaults to false; clicks report `onCheckedChange` with the next state. Host owns the value and persistence; the menu stays open so more settings can flip.

## Keyboard / accessibility

- `label` (required) names the setting; keep it a noun phrase ("Word wrap", not "Toggle word wrap").
- `aria-checked` always present; never swap in `aria-pressed`.
- Native button focus; keep a visible focus ring from tokens.

## Do / don't

- Do: `<DropdownMenuCheckboxItem label="Word wrap" checked={wrap} onCheckedChange={setWrap}>`.
- Don't: close the menu on toggle; the point is flipping several settings in one visit.

## Customization

Checked mark only. Type, spacing, and radius come from Cieo tokens.

## Limitations

- Prop-driven state; the component never persists. Host stores the value.
- No indeterminate state; a tri-state setting needs a custom row.

## Related

DropdownMenuItem (atom), DropdownMenuRadioItem (atom), DropdownMenuGroup (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

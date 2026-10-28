# Selector

Thin contract over the Select control; reuses select styling.

## Use when

- A form needs the full Select (native fallback, combobox enhance, auto-submit).
- You want the primitive-layer name without forking the control.

## Avoid when

- Options group into sections; use ComplexSelector instead.
- Multiple picks are allowed; use MultiSelector instead.

## Anatomy

Direct re-export of `Select` (plus `SelectProps` as `SelectorProps`) from `src/controls/Select.tsx`. No wrapper, no new paint.

## Behavior

Whatever Select does: native select pre-hydration, combobox after, motion on the dropdown recipe.

## Keyboard / accessibility

- Inherits Select: label names both select and combobox; full listbox keyboard after enhance.
- Keep `label` real; `hideLabel` only hides it visually.

## Do / don't

- Do: `import { Selector } from './Selector.js'` as a drop-in Select.
- Don't: wrap or restyle it here; fixes go to `src/controls/Select.tsx`.

## Customization

This alias retains the owning control’s customization API; see Host customization below.

## Limitations

- No new API; every prop mirrors Select exactly.
- No new CSS; select styling is the single source.

## Related

SelectorOption (atom), MultiSelector (molecule), ComplexSelector (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

Alias of Select; preserves its native/owning component props instead of creating a second control contract. Use the underlying component’s supported `className`, style/native props, and content slots. This alias intentionally does not fork behavior or introduce a competing `slotProps` shape.

# PowerSearch

Full search box under its Astryx name: a thin contract over the SearchField control.

## Use when

- The design calls the control PowerSearch. Import from this path, not from controls directly.
- You need a labelled native search input with clear button and optional collapsible form.

## Avoid when

- You want different search behavior; there is exactly one search behavior, owned by `src/controls/SearchField.tsx`. Change it there, never here.
- You need a plain text input; that is a Field-wrapped input, not a search box.

## Anatomy

Re-export only: `SearchField as PowerSearch`, `SearchFieldProps as PowerSearchProps`. Label, clear button, collapsible icon-button form, native `<input type="search">` — all owned by SearchField.

## Behavior

Equals SearchField exactly: Enter submits its form with no JavaScript, clear button springs in while there is text, collapsible variant widens from an icon button. This file declares no component and no logic.

## Keyboard / accessibility

- Inherits SearchField: native search keyboard support (Enter searches, Escape collapses the collapsible form), `label` required (shown only with `showLabel`).
- `onSearch` fires with the value on Enter; `onClear` fires when the field is cleared.

## Do / don't

- Do: `import { PowerSearch } from '../../primitives/PowerSearch/PowerSearch.js'` wherever Astryx says PowerSearch.
- Don't: add props, styling, or wrappers here; extend SearchField if behavior must change.

## Customization

None here. Props mirror SearchField (`label`, `showLabel`, `onSearch`, `onClear`, `collapsible` plus native input attrs); tokens and styling live with the SearchField control.

## Limitations

- No new CSS and no new behavior by design. Any limitation is SearchField's limitation.
- Manifest `extensions.wraps` points at `src/controls/SearchField.tsx` as the single source of truth.

## Related

SearchField (control, the implementation), Field (molecule, for the label/help row around other controls), InputGroup (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

This alias preserves the production `SearchFieldProps` contract, including native input props and className. Its control owns its internal label, search affordance, and clear action. It does not copy or fork that control to add a second slot contract.

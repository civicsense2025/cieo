# TypeaheadItem

One match row inside Typeahead; host owns filtering and commit.

## Use when

- One row commits one match from a typeahead list.
- The row is title plus small detail text.

## Avoid when

- Rows need sections; that grouping is CommandPalette territory.
- The row toggles; use a checkbox row instead.

## Anatomy

`div role="option"` with a stable `data-value`; children are the row content.

## Behavior

No motion. Click calls `onSelect(value)`; highlight and keyboard commit are host-owned.

## Keyboard / accessibility

- `value` is required and stable across keystrokes; rows announce content only.
- Never nest controls inside a row; the row is the option.

## Do / don't

- Do: `<TypeaheadItem value="hr-12">H.R. 12 — text</TypeaheadItem>`.
- Don't: manage active state here; the host owns it.

## Customization

Row paint only. Padding and radius come from Cieo tokens.

## Limitations

- Pointer-only commit here; keyboard commit lives with the host.
- No disabled state; the host drops unactionable matches.

## Related

Typeahead (molecule), CommandPaletteItem (atom), SelectorOption (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

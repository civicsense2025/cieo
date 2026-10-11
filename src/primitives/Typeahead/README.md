# Typeahead

Controlled combobox shell; host owns filtering, open reflects match presence.

## Use when

- A text field narrows a short match list as the user types.
- Matches are host data (search results, directory names).

## Avoid when

- The menu is command-first with groups and footers; use CommandPalette instead.
- Options are static and few; use Selector instead.

## Anatomy

`<label>` plus combobox `<input>` plus a conditional `role="listbox"` of TypeaheadItems.

## Behavior

No motion. `open` reflects host match presence; `value`/`onChange` carry text. Filtering stays host-side.

## Keyboard / accessibility

- Input carries `role="combobox"`, `aria-expanded`, and `aria-controls`; label is required and bound.
- Item commit is host-owned; keep one tab stop (the input) per field.

## Do / don't

- Do: `<Typeahead label="Find a bill" open={matches.length > 0}>` with item children.
- Don't: open with zero matches; close the list instead.

## Customization

Field paint only. Borders and list shadow come from Cieo tokens.

## Limitations

- No active-descendant management; host owns highlight and commit.
- No debounce or fetch; the host supplies matches.

## Related

TypeaheadItem (atom), CommandPalette (molecule), Selector (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

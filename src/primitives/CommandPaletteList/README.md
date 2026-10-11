# CommandPaletteList

Option container inside CommandPalette; host filters children from the query.

## Use when

- Palette results need listbox semantics around items and groups.
- Empty and footer rows must sit outside the option set.

## Avoid when

- Results are a flat native list; use List instead.
- You need multi-select; this list is single-pick.

## Anatomy

`div role="listbox"` with optional `aria-label`; children are Items, Groups, or the Empty note.

## Behavior

No motion. Renders children as given; scrolling is CSS. Filtering stays with the host.

## Keyboard / accessibility

- Optional `label` names the result set ("Matching pages"); omit it when the palette label already says enough.
- Never nest interactive controls inside an item; the item is the control.

## Do / don't

- Do: wrap only option children; keep Empty and Footer as siblings.
- Don't: render raw text nodes as direct children; every result is an Item.

## Customization

Spacing and scroll height only. Dividers and type come from Cieo tokens.

## Limitations

- No virtualization; past a few dozen matches the host pages or caps.
- No selection memory; the host owns the active item.

## Related

CommandPalette (molecule), CommandPaletteItem (atom), List (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

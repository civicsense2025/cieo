# CommandPaletteInput

Filter field for CommandPalette with a visually hidden label.

## Use when

- The palette needs a filter row bound to host query state.
- The visible design has no room for a label but AT still needs a name.

## Avoid when

- Outside a palette; use Field plus a native input instead.
- You need autocomplete suggestions; that is Typeahead, not this passthrough.

## Anatomy

Visually hidden `<label>` plus a plain text `<input>`; `value`, `onChange`, and `placeholder` pass straight through.

## Behavior

No motion. Controlled when `value`/`onChange` are set; uncontrolled otherwise. Never filters anything itself.

## Keyboard / accessibility

- Label is required and always rendered (visually hidden); input keeps native focus and editing keys.
- Do not add a second visible label; one name per field.

## Do / don't

- Do: `<CommandPaletteInput label="Filter commands" placeholder="Type to filter…" />`.
- Don't: restyle the input per palette; the paint is shared.

## Customization

Placeholder text only. Borders and type come from Cieo tokens.

## Limitations

- No debounce, no history; the host owns query policy.
- Combobox wiring (`aria-controls`) is host-owned per palette instance.

## Related

CommandPalette (molecule), Typeahead (molecule), Field (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

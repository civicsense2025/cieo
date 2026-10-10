# Tokenizer

Token chips plus an add input; host owns the value list.

## Use when

- A field collects a short set of freeform tokens (tags, invitees).
- Each token needs its own remove control.

## Avoid when

- Picks come from a fixed list; use MultiSelector instead.
- Values are sentences; use a textarea, not chips.

## Anatomy

`<label>` plus chip row (own spans with remove buttons) plus a text input; Enter adds the draft.

## Behavior

No motion. `values` is host state; remove buttons call `onRemove(index)`; Enter calls `onAdd(trimmed)` and clears. Chips are own spans, never the Token primitive.

## Keyboard / accessibility

- Each remove button is named `Remove ${value}`; the input keeps native editing keys.
- Label is required and bound; announce list changes from the host.

## Do / don't

- Do: `<Tokenizer label="Tags" values={tags} onRemove={rm} onAdd={add} />`.
- Don't: import Lane Content's Token here; cross-lane imports are forbidden.

## Customization

Chip paint only. Borders, radius, and spacing come from Cieo tokens.

## Limitations

- No drag reorder, no validation; the host owns value policy.
- Duplicate values render twice; the host dedupes.

## Related

MultiSelector (molecule), Typeahead (molecule), Field (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

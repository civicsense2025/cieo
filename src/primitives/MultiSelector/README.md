# MultiSelector

Label plus a native multi-select reusing the design-system input style.

## Use when

- A form field takes zero or more picks from a short list.
- Native multi-select keyboard (arrows, shift-extend) is acceptable.

## Avoid when

- The list is long; a tokenizer or checkbox group scans better.
- Single pick only; use Selector instead.

## Anatomy

`<label>` plus `<select multiple class="cieo-input">`; children are SelectorOptions. No new CSS.

## Behavior

No motion. `values` controls, `onChange` reports the full selected set. Uncontrolled when `values` is unset.

## Keyboard / accessibility

- `label` is required and bound via `htmlFor`; the select keeps native multi keyboard.
- Announce the multi instruction ("Hold Command to pick several") in help text when users may miss it.

## Do / don't

- Do: `<MultiSelector label="Committees" values={v} onChange={setV}>` with option children.
- Don't: restyle the select; `.cieo-input` is the shared paint.

## Customization

None here. Input paint belongs to the design system.

## Limitations

- Native multi UX (no chips, no search); rich picking is Tokenizer territory.
- No size prop; the host wraps for height.

## Related

Selector (atom), SelectorOption (atom), Tokenizer (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `input`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

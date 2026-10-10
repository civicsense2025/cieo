# SelectorOption

Native option wrapper for Selector-family selects.

## Use when

- MultiSelector children should read as data, not raw `<option>` tags.
- A disabled state needs naming at the call site.

## Avoid when

- Options come from a record list; map records to `<option>` directly.
- You are inside the enhanced Select; it builds its own options.

## Anatomy

Plain `<option>` with `value`, optional `label` (defaults to value), and `disabled`.

## Behavior

No motion. Native semantics; the owning select handles selection.

## Keyboard / accessibility

- `value` is required; `label` is what sighted users read, value what AT announces when label is absent.
- Disabled options are skipped by native keyboard travel.

## Do / don't

- Do: `<SelectorOption value="hr" label="House rules" />` inside MultiSelector.
- Don't: style options; native option paint belongs to the platform.

## Customization

None. Text comes from props; paint from the platform.

## Limitations

- No rich content; options are text only.
- Must live inside a select; standalone it renders nothing useful.

## Related

Selector (atom), MultiSelector (molecule), ComplexSelector (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

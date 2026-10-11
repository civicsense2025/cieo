# RadioList

Labelled single-choice group with radiogroup semantics for its radios (delivery speed, plan tier).

## Use when

- 2+ options share one question and exactly one answer is allowed.
- The group needs a single accessible name announced once for the whole set.

## Avoid when

- Zero or many answers are allowed; that is a CheckboxList, not a RadioList.
- The radio stands alone; a lone radio cannot be unchecked, so always group radios.

## Anatomy

Root `role="radiogroup"` with `aria-label`; `RadioListItem` children as content. Single grid gap; no fieldset, no checked-state logic.

## Behavior

No motion. Children stack vertically with the spacing token. The group never steals focus; each radio owns its own checked state.

## Keyboard / accessibility

- Root carries the group name (`aria-label`, required). Do not repeat it on items.
- Items keep native radio focus and order. The group adds no arrow-key handling; screen readers announce the set via the radiogroup role.

## Do / don't

- Do: `<RadioList label="Delivery speed">` with Standard/Express/Overnight items.
- Don't: use RadioList for multi-select; the radiogroup role promises single-choice.

## Customization

Label only. Gap and rhythm come from Cieo tokens; do not restyle gaps per instance.

## Limitations

- At least one child item. One question with no options means the question is wrong, not the group.
- No value-group state here; if radios must share a `name`, manage it in the host (or use the `RadioGroup` control).

## Related

RadioListItem (atom), CheckboxList (molecule, the multi-select peer), FieldStatus (atom, for the help/error line under the group).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

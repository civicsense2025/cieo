# CheckboxList

Labelled group of related checkboxes with one shared group name (notification channels, report columns).

## Use when

- 2+ checkboxes share one question and allow zero, one, or many answers.
- The group needs a single accessible name announced once for the whole set.

## Avoid when

- Only one answer is allowed; that is a RadioList, not a CheckboxList.
- The checkbox stands alone; use a bare CheckboxInput instead.

## Anatomy

Root `role="group"` with `aria-label`; `CheckboxListItem` children as content. Single grid gap; no fieldset, no selection logic.

## Behavior

No motion. Children stack vertically with the spacing token. The group never steals focus and never constrains how many items are checked.

## Keyboard / accessibility

- Root carries the group name (`aria-label`, required). Do not repeat it on items.
- Items keep native checkbox focus and order (Space toggles each). The group adds no arrow-key handling.

## Do / don't

- Do: `<CheckboxList label="Notification channels">` with Email/SMS/Push items.
- Don't: use CheckboxList for single-choice; the group role promises multi-select.

## Customization

Label only. Gap and rhythm come from Cieo tokens; do not restyle gaps per instance.

## Limitations

- At least one child item. One question with no options means the question is wrong, not the group.
- No select-all or indeterminate-summary behavior; own that in the host if needed.

## Related

CheckboxListItem (atom), RadioList (molecule, the single-choice peer), FieldStatus (atom, for the help/error line under the group).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

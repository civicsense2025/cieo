# DropdownMenuRadioGroup

Single-select group of menu radio rows, for one sort order out of several.

## Use when

- A menu cluster picks exactly one of 2–5 peer values (sort order, page size).
- The pick applies instantly and the menu can stay open.

## Avoid when

- Several values can hold at once; use DropdownMenuCheckboxItem instead.
- The choice runs an action; use DropdownMenuItem instead.

## Anatomy

`div role="group"` carrying context only — no box, no caption, no CSS file. Child DropdownMenuRadioItems follow the value by their `value` key.

## Behavior

No motion, no visuals. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue` with internal state). Picking a row reports its `value`; host owns persistence.

## Keyboard / accessibility

- `label` is optional; the menu label usually covers the cluster, so omit it unless the group needs its own announcement.
- Each row keeps `aria-checked` from context and native button focus order.
- Exactly one row reads checked at a time.

## Do / don't

- Do: `<DropdownMenuRadioGroup value={order} onValueChange={setOrder}>` with valued radio rows.
- Don't: add presentational wrappers between group and rows; context passes through providers, not DOM.

## Customization

None. The group renders no visuals; style the rows, not the group.

## Limitations

- Max 16 children. Style-free by design (`styleParts: []`); do not add a CSS file for spacing.
- Host persists the value; the group never writes storage.

## Related

DropdownMenuRadioItem (atom), DropdownMenuCheckboxItem (atom), ToggleButtonGroup (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

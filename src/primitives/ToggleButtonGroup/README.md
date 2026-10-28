# ToggleButtonGroup

Single-select group of toggle buttons, for one alignment out of left, center, and right.

## Use when

- Exactly one of 2–5 peer options is active and switching is instant (alignment, view density).
- The options read as modes of one control, not separate actions.

## Avoid when

- Several options can be on at once; use standalone ToggleButtons instead.
- The options navigate between panels; use TabList, not a toggle group.

## Anatomy

Root `role="group"` with `aria-label`; context carries the selected value to child ToggleButtons by their `value` key. Borders collapse; only outer corners round.

## Behavior

No motion. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue` with internal state). Selecting a button reports its `value`; host owns persistence.

## Keyboard / accessibility

- Root carries the group name (`aria-label`, required). Do not repeat it on children.
- Each child keeps `aria-pressed` from context and native button focus order.
- Visible focus must survive the border collapse.

## Do / don't

- Do: `<ToggleButtonGroup label="Text style" value={v} onValueChange={setV}>` with valued ToggleButtons.
- Don't: mix valued and unvalued ToggleButtons; unvalued ones never join the selection.

## Customization

Selection only. Colors, radius, and spacing come from Cieo tokens; do not restyle borders per instance.

## Limitations

- Max 16 children. Single-select only; multi-select needs standalone toggles.
- Host persists the value; the group never writes storage.

## Related

ToggleButton (atom), SegmentedControl (molecule), TabList (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

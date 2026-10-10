# SegmentedControl

Single-select pill of segments, for day, week, and month views of one panel.

## Use when

- One panel offers 2–5 exclusive views and switching is instant (day/week/month, map/list).
- The options read as segments of one control, not separate buttons.

## Avoid when

- Segments navigate between pages; use TabList or real navigation instead.
- Several options can hold at once; use standalone ToggleButtons instead.

## Anatomy

Pill container with `role="group"` and `aria-label`; context carries the picked value to child SegmentedControlItems by their `value` key.

## Behavior

No motion. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue` with internal state). Picking a segment reports its `value`; host owns persistence.

## Keyboard / accessibility

- Container carries the control name (`aria-label`, required). Do not repeat it on segments.
- Each segment keeps `aria-pressed` from context and native button focus order.
- Keep segment text to one or two words so the pill never overflows.

## Do / don't

- Do: `<SegmentedControl label="Calendar view" value={v} onValueChange={setV}>` with valued segments.
- Don't: put icons without text in segments; the pill needs readable labels.

## Customization

Picked-segment fill only. Container, radius, and spacing come from Cieo tokens.

## Limitations

- Max 8 children. Single-select only; multi-select needs standalone toggles.
- Host persists the value; the control never writes storage.

## Related

SegmentedControlItem (atom), ToggleButtonGroup (molecule), TabList (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

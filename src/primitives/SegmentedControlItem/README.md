# SegmentedControlItem

One segment inside a segmented control, pressed when the control value matches.

## Use when

- The segment is one of 2–5 peer views in a SegmentedControl (day, week, month).
- Clicking the segment should pick it and report upward, nothing else.

## Avoid when

- The segment toggles independently; use ToggleButton instead.
- The segment navigates pages; use Tab instead.

## Anatomy

Native `<button>` with `aria-pressed`. `data-picked` mirrors state for styling; picked segments lift off the pill container.

## Behavior

No motion, no own state. `picked` reads `control.value === value` from context; standalone (no provider) it reads unpicked and documents as misplaced. Clicks call the control `onSelect` with `value`.

## Keyboard / accessibility

- Children text is the name; keep it to one or two words.
- `aria-pressed` always present; never swap in `aria-checked`.
- Native button focus; keep a visible focus ring from tokens.

## Do / don't

- Do: `<SegmentedControlItem value="week">Week</SegmentedControlItem>` inside a valued control.
- Don't: reuse a `value` across segments; duplicates press together and confuse.

## Customization

Picked-segment fill only. Container, radius, and spacing come from Cieo tokens.

## Limitations

- Useless outside SegmentedControl; standalone segments never press.
- One text node per segment; icons without text are not supported.

## Related

SegmentedControl (molecule), ToggleButton (atom), Tab (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

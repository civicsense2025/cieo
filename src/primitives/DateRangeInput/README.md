# DateRangeInput

Labelled start/end date pair: two native date inputs under one group name (trip dates, report window).

## Use when

- The form needs a date range as two whole dates with one shared question.
- Start and end can stay two native date inputs with fixed `start`/`end` names.

## Avoid when

- Only one date is needed; use DateInput.
- You need a visual month grid with range highlighting; that is host-owned Calendar state, not this pair.

## Anatomy

Root `role="group"` with `aria-label`: two wrapping labels ("Start", "End"), each with `<input type="date" class="cieo cieo-input">`. No new CSS; faces come from `design/styles/controls.css`.

## Behavior

No motion. Native pickers and native form values. No cross-validation; start-before-end checks live in the host.

## Keyboard / accessibility

- Root carries the range name (`aria-label`, required). Each input keeps its own Start/End label.
- Native date keyboard support per input; tab order is Start then End.

## Do / don't

- Do: `<DateRangeInput label="Trip dates" />`.
- Don't: validate the range inside the component; report violations with FieldStatus from the host.

## Customization

Label only. Colors, radius, and spacing come from Cieo tokens via the shared input style.

## Limitations

- Uncontrolled; values live in the host form (`start`/`end` names).
- No min/max wiring between the two inputs; the host constrains them if needed.

## Related

DateInput (atom), Calendar (molecule, for month-grid picking), FieldStatus (atom, for range violations).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `startField`, `startLabel`, `startInput`, `endField`, `endLabel`, `endInput`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

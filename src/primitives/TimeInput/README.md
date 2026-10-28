# TimeInput

Labelled time-of-day field: one native time input reusing the shared input style.

## Use when

- The form needs one time of day (opens at, daily digest hour).
- A single native value without date context is acceptable.

## Avoid when

- A date is also needed; use DateInput or DateTimeInput.
- You need duration entry (2h 30m); that is a NumberInput pair or host-owned control, not a time input.

## Anatomy

Wrapping `<label>`: visible `.cieo-label` span plus `<input type="time" class="cieo cieo-input">`. No new CSS; the input face comes from `design/styles/controls.css`.

## Behavior

No motion. Native picker and native form value (`HH:MM`).

## Keyboard / accessibility

- Label wraps the input, so label focus works without an `id`.
- Native time keyboard support and platform picker; the visible label text is required.

## Do / don't

- Do: `<TimeInput label="Opens at" />`.
- Don't: use TimeInput for durations; clocks and stopwatches are different inputs.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Uncontrolled; value state lives in the host.
- Picker chrome is platform-owned and varies by browser and locale.

## Related

DateInput (atom), DateTimeInput (atom), FieldStatus (atom, for the help/error line).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `label`, `input`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

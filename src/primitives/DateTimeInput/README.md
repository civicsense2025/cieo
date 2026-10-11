# DateTimeInput

Labelled date-and-time field: one native datetime-local input reusing the shared input style.

## Use when

- The form needs one local date plus time (meeting time, reminder fires at).
- A single native value without time-zone conversion is acceptable.

## Avoid when

- Only a date is needed; use DateInput. Only a time; use TimeInput.
- You need time-zone-aware scheduling; that is host-owned logic over a plainer input.

## Anatomy

Wrapping `<label>`: visible `.cieo-label` span plus `<input type="datetime-local" class="cieo cieo-input">`. No new CSS; the input face comes from `design/styles/controls.css`.

## Behavior

No motion. Native picker and native form value (local, no zone offset).

## Keyboard / accessibility

- Label wraps the input, so label focus works without an `id`.
- Native datetime keyboard support and platform picker; the visible label text is required.

## Do / don't

- Do: `<DateTimeInput label="Meeting time" />`.
- Don't: pretend the value carries a zone; convert explicitly in the host if the backend needs one.

## Customization

Label only. Colors, radius, and spacing come from Cieo tokens via the shared input style.

## Limitations

- Uncontrolled; value state lives in the host.
- Picker chrome is platform-owned and varies by browser and locale.

## Related

DateInput (atom), TimeInput (atom), FieldStatus (atom, for the help/error line).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

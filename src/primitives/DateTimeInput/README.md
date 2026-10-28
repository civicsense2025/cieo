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

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Uncontrolled; value state lives in the host.
- Picker chrome is platform-owned and varies by browser and locale.

## Related

DateInput (atom), TimeInput (atom), FieldStatus (atom, for the help/error line).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `label`, `input`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

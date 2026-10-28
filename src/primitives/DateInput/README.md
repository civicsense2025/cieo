# DateInput

Labelled calendar-date field: one native date input reusing the shared input style.

## Use when

- The form needs one calendar date (start date, birthday).
- A text date entry suffices and no month grid is needed.

## Avoid when

- The user should see and pick from a month grid; that is a Calendar.
- You need a start/end pair; that is a DateRangeInput.

## Anatomy

Wrapping `<label>`: visible `.cieo-label` span plus `<input type="date" class="cieo cieo-input">`. No new CSS; the input face comes from `design/styles/controls.css`.

## Behavior

No motion. Native date picker and native form value (`YYYY-MM-DD`).

## Keyboard / accessibility

- Label wraps the input, so label focus works without an `id`.
- Native date keyboard support and platform picker; the visible label text is required.

## Do / don't

- Do: `<DateInput label="Start date" />`.
- Don't: split one date across three text fields; the native input validates as a whole.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Uncontrolled; value state lives in the host.
- Picker chrome is platform-owned and varies by browser and locale.

## Related

Calendar (molecule, for month-grid picking), DateRangeInput (molecule, for start/end pairs), DateTimeInput (atom, for date plus time).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `label`, `input`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

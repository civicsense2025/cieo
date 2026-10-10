# NumberInput

Labelled numeric field: one native number input reusing the shared input style.

## Use when

- The form needs a real number (quantity, seats, retry count).
- Min, max, or step constraints can stay declarative and native.

## Avoid when

- The value is numeric-looking text (ZIP, phone, card number); use a text input so leading zeros and spacing survive.
- You need a slider with live readout; that is a Slider.

## Anatomy

Wrapping `<label>`: visible `.cieo-label` span plus `<input type="number" class="cieo cieo-input">`. No new CSS; the input face comes from `design/styles/controls.css`.

## Behavior

No motion. Native spinners and keyboard stepping; `defaultValue` sets the uncontrolled initial value.

## Keyboard / accessibility

- Label wraps the input, so label focus works without an `id`.
- Native number keyboard support (arrows step); out-of-range values fail native validation with the platform message.

## Do / don't

- Do: `<NumberInput label="Quantity" min={1} max={10} defaultValue={1} />`.
- Don't: use NumberInput for ZIP codes or phone numbers; text preserves formatting.

## Customization

Props only (`min`, `max`, `step`, `defaultValue`). Colors, radius, and spacing come from Cieo tokens via the shared input style.

## Limitations

- Uncontrolled only (`defaultValue`); controlled value state lives in the host.
- Spinner and locale formatting are platform-owned and vary by browser.

## Related

Slider (atom, for ranged choice with readout), Field (molecule, for the label/help row), FieldStatus (atom, for the help/error line).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

# FieldStatus

One help or error line under a control; errors announce via role alert.

## Use when

- A control needs one help line ("Use your work email") or one validation message ("Email is required").
- The message belongs to a control that Field does not wrap (groups, calendars, custom composites).

## Avoid when

- A Field already renders the help/error row; do not double it with FieldStatus.
- You need both help and error at once; error wins, so render one FieldStatus with `tone="error"`.

## Anatomy

One `<p class="cieo-p-field-status">` with `data-tone`. Error tone adds `role="alert"`; description tone renders plain help text.

## Behavior

No motion. `tone` defaults to description. Error replaces help; the two never stack.

## Keyboard / accessibility

- `role="alert"` appears only when `tone="error"`, so assistive tech announces failures and stays quiet for help.
- Keep messages short and name the fix ("Enter a date after today"), not just the rule.

## Do / don't

- Do: `<FieldStatus message="Enter a date after today" tone="error" />` under the failing control.
- Don't: render description and error together; pass `tone="error"` and let it win.

## Customization

Tone only. Type size and tone colors come from Cieo tokens; error tone is `danger`.

## Limitations

- One message per instance. Two problems means two lines, each its own FieldStatus — or fix the form.
- No `id` wiring here; bind to the control with `aria-describedby` in the host.

## Related

Field (molecule, which owns this row for wrapped controls), InputGroup (molecule), Calendar (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

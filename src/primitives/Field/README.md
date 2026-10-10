# Field

Label plus one control plus a help or error row (every labelled input, select, or custom control).

## Use when

- Every labelled control: wrap the control so label, input, and help text stay in one grid stack.
- The control needs help text (`description`) or a validation message (`error`).

## Avoid when

- The control has no visible label; give it one instead of skipping Field.
- You need grouped choice semantics; that is a radio, checkbox group, or segmented control, not a Field.

## Anatomy

Root `.cieo-p-field` grid: `<label>`, host control child, then one `.cieo-p-help` paragraph. The host supplies the control with a matching `id` for `htmlFor`.

## Behavior

Error wins over description: only one help row renders. The help `id` derives from `htmlFor` (`-error` / `-help` suffix); no `htmlFor` means no help `id`.

## Keyboard / accessibility

- `label` is required. Pass `htmlFor` matching the control's `id` so label focus works.
- Error renders with `role="alert"` so assistive tech announces it; it replaces (never stacks with) the description.

## Do / don't

- Do: `<Field label="Email" htmlFor="email" error={err}>` with `<input id="email">` as child.
- Don't: render both description and error; pass `error` and let it win.

## Customization

None per instance. Gap, label weight/size, and help tone colors come from Cieo tokens; error tone is `danger`.

## Limitations

- Exactly one child control (default slot min 1, max 1). More means the controls need separate Fields.
- No label-position variants; label always sits above the control.

## Related

Slider (atom), Range (control), ButtonGroup (molecule).

## Evidence

Storybook-free: covered by `test/primitives-form.test.mjs` + docs preview. No device acceptance in this plan.

# FileInput

Labelled file picker: one native file input reusing the shared input style.

## Use when

- The form needs one file upload (avatar, report attachment).
- Accept types or multi-select can stay declarative (`accept`, `multiple`).

## Avoid when

- You need drag-and-drop or upload progress; that is a dropzone organism, not a FileInput.
- The picker has no visible label; give it one instead of hiding it.

## Anatomy

Wrapping `<label>`: visible `.cieo-label` span plus `<input type="file" class="cieo cieo-input">`. No new CSS; the input face comes from `design/styles/controls.css`.

## Behavior

No motion. Native file dialog, native form participation. `multiple` defaults to false; `accept` narrows the dialog filter.

## Keyboard / accessibility

- Label wraps the input, so label focus works without an `id`.
- The visible label text is required; never rely on placeholder or surrounding prose.

## Do / don't

- Do: `<FileInput label="Upload report" accept=".pdf,.docx" />`.
- Don't: restyle the file button per instance; the native control plus shared input style is the contract.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No drag-and-drop, no progress, no preview. Pair with host UI for those.
- Styling is limited to what the shared `.cieo-input` plus native control allow.

## Related

InputGroup (molecule, for prefix/suffix addons), Field (molecule, for the label/help row around other controls), FieldStatus (atom, for the help/error line).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `label`, `input`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

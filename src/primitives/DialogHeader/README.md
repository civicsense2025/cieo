# DialogHeader

Title row for a dialog with an optional close button (rename a file, then dismiss).

## Use when

- A Dialog needs a visible title plus a dismiss affordance in one row.
- The close action maps to the host's existing `onClose` handler.

## Avoid when

- The dialog must not be dismissible (a blocking confirm); omit the header button instead.
- You need actions beyond closing; those live in the dialog footer, not the header.

## Anatomy

Title `h2` plus a conditional native close `<button>`. No button renders when `onClose` is omitted.

## Behavior

No motion. The button calls `onClose` and nothing else; the host decides what closing means.

## Keyboard / accessibility

- Title is a real heading so screen readers announce the dialog purpose.
- Close button keeps its native focus and label (`closeLabel`, defaults to Close).

## Do / don't

- Do: `<DialogHeader title="Rename file" onClose={close} />` at the top of the dialog.
- Don't: render a decorative × that is not a button or has no label.

## Customization

Close label text only. Type, spacing, and rule styling come from Cieo tokens.

## Limitations

- No slot; subtitle or icon content belongs to the host body, not this row.
- One heading level (`h2`); do not restyle it as body copy.

## Related

Dialog (organism), AlertDialog (organism), BottomSheet (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

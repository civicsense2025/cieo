# ChatComposerInput

Controlled textarea for composing a message inside a composer (a reply to support).

## Use when

- The composer needs a growing text field the host fully controls.
- Value, edits, and clearing all live in host state.

## Avoid when

- The field edits a saved record; use a labeled form field instead.
- The input is single-line and fixed; a search or text input fits better.

## Anatomy

Native `textarea` with `aria-label`; value, change, rows, and placeholder pass straight through.

## Behavior

No motion. Controlled: the host passes `value` and updates it in `onChange`. Rows default to 1.

## Keyboard / accessibility

- Input carries its own name (`label`, required). Do not repeat the composer name on it.
- Native textarea keeps focus, wrapping, and screen-reader editing behavior.

## Do / don't

- Do: `<ChatComposerInput label="Message support" value={draft} onChange={setDraft} />`.
- Don't: leave it uncontrolled while the composer clears on send; the draft would linger.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No auto-grow; the host adjusts rows when the draft wraps.
- No send-on-Enter; the composer form owns submit behavior.

## Related

ChatComposer (molecule), ChatMessageList (organism), Field (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

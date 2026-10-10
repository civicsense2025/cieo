# ChatComposer

Controlled form shell for composing and sending a message (input plus a Send button).

## Use when

- The transcript needs a send row wired to the host's send handler.
- Enter-to-send and button-to-send must behave identically.

## Avoid when

- The input edits existing content; that is a form field, not a composer.
- Sending needs attachments or formatting UI; the host adds those as siblings.

## Anatomy

`form` with `aria-label`; host input (ChatComposerInput) plus a submit button as children.

## Behavior

No motion. Submit prevents the default navigation, then calls `onSubmit`. The host sends and clears.

## Keyboard / accessibility

- Form carries the composer name (`label`, defaults to Send a message).
- Native submit keeps Enter-to-send; the send button keeps native focus.

## Do / don't

- Do: `<ChatComposer onSubmit={send}>` with an input and a `type="submit"` Send button.
- Don't: attach a second click-send that bypasses submit; one path sends.

## Customization

Label only. Row layout, border, and padding come from Cieo tokens.

## Limitations

- No input of its own; the host always supplies ChatComposerInput or equivalent.
- No draft, validation, or retry; the host owns message state around this shell.

## Related

ChatComposerInput (atom), ChatMessageList (organism), ChatLayout (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

# ShareButton

Opens the device share sheet, or copies the link where there is none, and confirms with Link copied.

## Use when

- Sharing a post or comment link.

## Avoid when

- Sharing a non-web URL; only http and https are shared.

## Anatomy

A `button` with an icon and swapping label, plus a polite live region.

## Behavior

- `shareMethod(navigator)` picks native, copy or none.
- After copying, the label reads Link copied for 2 seconds and the live region says it.
- Cancelling the native sheet is silent. Any other native failure falls back to copying.
- `onShared` runs only after a success.

## Keyboard / accessibility

A real button; the live region announces the copy and failures politely. Disabled for unsafe URLs.

## Do / don't

- Do: pass a full https URL.
- Don't: treat a cancel as an error.

## Customization

Label text and the native sheet fields.

## Limitations

- Copying needs a secure context and user gesture.

## Related

ActionBar, CountButton.

## Evidence

`test/primitives-engagement-actions.test.mjs`.

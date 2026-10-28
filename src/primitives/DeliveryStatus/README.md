# DeliveryStatus

Where one sent message is on its way: an icon that changes shape as it progresses, plus a spoken word.

## Use when

- Next to an outgoing message that shows sending, sent, delivered, read or failed.

## Avoid when

- Showing who read a message; use SeenBy.

## Anatomy

A span holding an SVG with four stacked glyphs (clock, check, double check, exclamation), an optional visible time, and a screen-reader sentence.

## Behavior

- `deliveryLabel(status)` gives Sending, Sent, Delivered, Read, Not delivered.
- The icon cross-fades between glyphs with the shared spring timing; read turns the double check to the accent color.
- Failed shows a danger exclamation and the visible words "Not delivered".
- Reduced motion switches glyphs instantly.

## Keyboard / accessibility

Spoken text is "Delivered, 9:41 AM" when a time is given. Only failure is a `role="alert"`; other changes are silent so a busy thread does not chatter.

## Do / don't

- Do: update `status` as soon as the host knows.
- Don't: use color alone to show read.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- The component shows one status; the host decides which message gets one.

## Related

ChatMessageMetadata, SeenBy.

## Evidence

`test/primitives-messaging.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `icon`, `glyph`, `text`, `time`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

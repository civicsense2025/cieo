# ChatMessageMetadata

Small muted line for delivery details under a message (seen by 3, edited, sending…).

## Use when

- A message needs one quiet status or detail line.
- The detail is text the host already computed.

## Avoid when

- The detail needs an action (retry, dismiss); use a labeled button instead.
- The line is the message body; that belongs in the bubble.

## Anatomy

Single muted `p`; host text as children.

## Behavior

No motion. Static text; updates come from the host re-rendering.

## Keyboard / accessibility

- Plain paragraph; it takes no focus and adds no role.
- Keep wording short so log announcements stay skimmable.

## Do / don't

- Do: `<ChatMessageMetadata>Seen by Ava and Mo</ChatMessageMetadata>`.
- Don't: stack metadata lines; one detail per message keeps the transcript clean.

## Customization

None. Size and muted color come from Cieo tokens.

## Limitations

- Text only (slot max 1); no icons or links inside.
- No timestamps formatting; the host formats before rendering.

## Related

ChatMessage (molecule), ChatSystemMessage (atom), ChatMessageBubble (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

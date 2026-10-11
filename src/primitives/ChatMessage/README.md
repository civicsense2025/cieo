# ChatMessage

One transcript entry with optional author and time (a reply from Ava at 9:41 AM).

## Use when

- Rendering one message inside a ChatMessageList transcript.
- The entry needs an author or timestamp line above its bubble.

## Avoid when

- The note is from the system, not a participant; use ChatSystemMessage instead.
- The line is metadata without a body; use ChatMessageMetadata instead.

## Anatomy

`article` root with optional author `span`, optional `time`, then host body (usually a ChatMessageBubble).

## Behavior

No motion. Static container; delivery state and retries belong to the host.

## Keyboard / accessibility

- Article groups one message so screen readers move entry by entry.
- Time uses a real `<time>` element; author is plain text, never a heading.

## Do / don't

- Do: `<ChatMessage author="Ava" time="9:41 AM">` with a bubble child.
- Don't: nest messages inside messages; siblings belong to the list.

## Customization

None per instance. Spacing and type come from Cieo tokens.

## Limitations

- No bubble styling of its own; pair with ChatMessageBubble for the visible bubble.
- No status (sent, read); the host adds that beside the body when needed.

## Related

ChatMessageBubble (atom), ChatMessageList (organism), ChatMessageMetadata (atom), ChatSystemMessage (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

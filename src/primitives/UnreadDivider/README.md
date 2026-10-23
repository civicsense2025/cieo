# UnreadDivider

A rule with a centered accent label that marks where unread messages begin.

## Use when

- Between the last read message and the first unread one in a conversation.

## Avoid when

- Separating days; use a date divider.

## Anatomy

A `role="separator"` div with a rule, a label and a second rule.

## Behavior

- `unreadDividerLabel(count, label)`: the host label if given, else "3 new messages" or "1 new message", else "New messages".
- The label fades in; reduced motion shows it at once.

## Keyboard / accessibility

The separator carries `aria-label` with the same text as the visible label.

## Do / don't

- Do: show it once per conversation.
- Don't: leave it after the messages are read.

## Customization

Colors use the accent token; the label can be replaced for other languages.

## Limitations

- It is not focusable, so it does not move keyboard focus to the first unread message.

## Related

ChatMessageBubble, ConversationListItem.

## Evidence

`test/primitives-messaging.test.mjs`.

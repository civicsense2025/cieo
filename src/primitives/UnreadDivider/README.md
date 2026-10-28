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

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- It is not focusable, so it does not move keyboard focus to the first unread message.

## Related

ChatMessageBubble, ConversationListItem.

## Evidence

`test/primitives-messaging.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `rule`, `label`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

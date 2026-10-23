# TypingIndicator

Three waving dots and a spoken sentence about who is typing. It enters and leaves with a short fade.

## Use when

- A conversation shows that someone is composing a reply.
- A list row wants a quiet inline hint in place of its preview.

## Avoid when

- Showing that something is loading; use a progress or skeleton pattern.

## Anatomy

A `role="status"` span holding three decorative dots and the sentence. `bubble` shows only the dots in a rounded bubble; `inline` shows the sentence beside them.

## Behavior

- `typingLabel(names)` words one name, two, three, or four and more ("Ava and 3 others are typing"). Blank names are ignored.
- The dots wave in a staggered, gentle loop. Reduced motion shows static dots at mid opacity.
- An empty `names` list fades the indicator out; the status element stays so a later arrival is announced.
- The spoken sentence changes only when the set of people changes, not when their order does.

## Keyboard / accessibility

The status is a polite live region. Dots are hidden from assistive tech; the sentence is read.

## Do / don't

- Do: pass every typing name in one list.
- Don't: debounce inside the component; the host decides when someone stops typing.

## Customization

Inherits color and font size. The bubble background uses the sunken surface token.

## Limitations

- Names are not truncated; very long names wrap in the bubble variant.

## Related

ChatMessageBubble, ConversationListItem, DeliveryStatus.

## Evidence

`test/primitives-messaging.test.mjs`.

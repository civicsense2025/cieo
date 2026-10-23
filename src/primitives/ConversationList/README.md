# ConversationList

The inbox: a list of ConversationListItem rows with one tab stop, arrow-key movement, and rows that glide to their new places when the order changes.

## Use when

- Showing a user's conversations, newest activity first.

## Avoid when

- Static, never-reordered menus.

## Anatomy

A `role="list"` div that renders its rows in the order given by `order`, then any rows not named, in written order.

## Behavior

- `conversationIds` reads the row ids from children; `conversationOrder(ids, order)` merges them (unknown ids dropped).
- When the order changes, rows glide to their new places (shared FLIP). Reduced motion skips it.
- Focus stays on the same conversation when it moves.

## Keyboard / accessibility

ArrowUp and ArrowDown move focus between rows, Home and End jump to the ends, and movement stops at the ends. One tab stop: the last focused row, else the selected one, else the first (`conversationTabbable`). The list has an accessible name from `label`.

## Do / don't

- Do: change `order` when a message arrives.
- Don't: re-key rows to reorder them.

## Customization

Rows are spaced by a space token; style rows through ConversationListItem.

## Limitations

- No virtualization; very long inboxes need the host to window the rows.

## Related

ConversationListItem, SortableList.

## Evidence

`test/primitives-messaging.test.mjs`.

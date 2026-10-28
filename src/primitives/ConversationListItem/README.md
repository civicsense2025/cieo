# ConversationListItem

One row of the inbox: avatar, title and time, preview and unread badge, with typing, draft, muted and pinned states.

## Use when

- Rows inside a ConversationList.

## Avoid when

- Settings or menu rows; use a list item.

## Anatomy

A `role="listitem"` wrapper around one link or button holding the avatar, a title and time line, and a preview and flags line.

## Behavior

- Unread makes the title strong and shows a count badge that pops in when it first appears and rolls its digits after; above 99 it reads 99+.
- Typing swaps the preview for an inline TypingIndicator; the old preview leaves first.
- Draft prefixes "Draft:" in the danger color. Muted shows a muted-bell icon and a neutral badge. Pinned shows a pin when there is no badge.
- `conversationLabel` builds the spoken name: "Design team, 3 unread, Ava: see you at 3, 9:41 AM"; `nodeText` reads a preview node as text.

## Keyboard / accessibility

The row has an `aria-label` with the summary and `aria-current="true"` when selected. Inside a ConversationList only one row has `tabindex="0"`. Real link when `href` is set, otherwise a button.

## Do / don't

- Do: give previews as text so the spoken summary is complete.
- Don't: nest controls inside the row.

## Customization

Row, badge and flag colors use theme tokens; avatar is any node.

## Limitations

- The spoken summary cannot read previews made of components that render no text children.

## Related

ConversationList, GroupAvatar, TypingIndicator, CompactCount.

## Evidence

`test/primitives-messaging.test.mjs`.

## Host customization

`className` appends a root class. `slotProps` exposes `avatar`, `main`, `top`, `title`, `time`, `bottom`, `line`, `preview`, `draft`, `typing`, `flags`, `icon`, `badge`, `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

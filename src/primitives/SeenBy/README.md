# SeenBy

Tiny overlapping faces of the people who have read a message, with a +n for the rest.

## Use when

- Under the last message of a group conversation to show who has seen it.

## Avoid when

- One-to-one chats, where DeliveryStatus says enough.

## Anatomy

A span with a stack of 16px faces (photo or initials) and a visually hidden sentence.

## Behavior

- `seenByLabel(names)`: Seen by Ava; Seen by Ava and Ben; Seen by Ava, Ben and 2 others.
- Faces beyond `max` (default 3) collapse into a +n tile.
- When a new reader appears the faces slide to their new places and the newcomer fades in (shared FLIP). Reduced motion skips it.

## Keyboard / accessibility

The faces are decorative; the sentence is read. Nothing renders for an empty list.

## Do / don't

- Do: pass readers in the order they read.
- Don't: pass people who only received the message.

## Customization

Face size is set in CSS; colors use accent-soft and sunken tokens.

## Limitations

- A reader who leaves the list slides out of the layout without an exit fade.

## Related

GroupAvatar, AvatarGroup, DeliveryStatus.

## Evidence

`test/primitives-messaging.test.mjs`.

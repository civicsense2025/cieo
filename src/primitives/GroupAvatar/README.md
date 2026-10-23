# GroupAvatar

One circle that stands for a whole conversation: one to four faces packed inside it, or three plus a +n tile.

## Use when

- Representing a group chat in a list or header.

## Avoid when

- A single person; use Avatar.

## Anatomy

A `role="img"` span with absolutely placed faces: single, two offset circles, a triangle of three, a 2 by 2 grid of four, or three faces plus a +n tile for five or more.

## Behavior

- `groupAvatarLayout(people)` picks the faces and the hidden count.
- `groupAvatarLabel(names)` gives "Ava, Ben and 3 others".
- Photos appear only when `src` is given; otherwise initials. An empty list renders nothing.
- Sizes sm, md and lg scale the whole circle.

## Keyboard / accessibility

One image role with the group label; the faces inside are decorative.

## Do / don't

- Do: list the most relevant people first.
- Don't: guess photos.

## Customization

Sizes through `data-size`; face colors use accent-soft and sunken tokens.

## Limitations

- Initials get small in the 2 by 2 layout; keep them to two characters.

## Related

Avatar, AvatarGroup, ConversationListItem.

## Evidence

`test/primitives-messaging.test.mjs`.

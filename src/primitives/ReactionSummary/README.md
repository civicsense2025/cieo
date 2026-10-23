# ReactionSummary

Chips under a message or comment showing each reaction, how many people used it, and whether you are one of them.

## Use when

- Under a comment, message or post that people react to.
- You want one tap to add or remove your own reaction.

## Avoid when

- A single like count; use CountButton.

## Anatomy

A group of chip buttons (emoji plus a rolling CompactCount), then an optional add button that opens a ReactionPicker in a Popover. `toggleReaction(list, id, emoji?, label?)` returns the next list.

## Behavior

- The host owns the list. `onToggle(id)` fires on a chip; `onAdd(id)` fires from the picker.
- `toggleReaction`: turning mine off decrements and removes the chip at 0; turning it on increments, or appends a new chip with count 1 and mine.
- A newly added chip opens its width on the base spring; a removed chip collapses before it disappears; neighbours slide (FLIP).
- Mine chips use the accent-soft background.

## Keyboard / accessibility

- Chips are buttons with `aria-pressed` equal to mine, named like "Love, 3 people including you".
- The add button is named "Add a reaction"; Escape closes the picker and returns focus to it.

## Do / don't

- Do: update the list optimistically with `toggleReaction`, then confirm with the server.
- Don't: re-sort chips on every change; keep order stable.

## Customization

Pass `available` to change what the picker offers.

## Limitations

- Wraps onto several lines on narrow screens.
- Does not name who reacted; add a Tooltip or sheet in the host for that.

## Related

ReactionPicker, CompactCount, Popover, Comment.

## Evidence

`test/primitives-engagement-reactions.test.mjs`.

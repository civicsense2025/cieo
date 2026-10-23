# ReactionPicker

A row of emoji buttons that reports one pick. Use it inline or inside a Popover the host owns.

## Use when

- Letting someone react to a message, comment or post with one tap.
- Offering a fixed, small set of reactions.

## Avoid when

- The set is large or searchable; use an emoji search instead.
- You need the reaction to open the picker itself; put the picker in a Popover.

## Anatomy

A `role="toolbar"` of buttons. Each holds one emoji (`aria-hidden`) and is named by its label. `DEFAULT_REACTIONS` is Like, Love, Funny, Wow, Sad, Thanks.

## Behavior

- `onPick(id)` fires with the reaction id; the host decides what a pick means and when to close.
- `selected` ids report `aria-pressed`; the host still receives a pick for them (so it can undo).
- Emojis rise in on the base spring with a 30ms stagger, from 0.45 opacity. The hovered or focused emoji scales to 1.25 on the snap spring. Reduced motion shows everything at rest.

## Keyboard / accessibility

- One tab stop; ArrowLeft/ArrowRight/Home/End move focus (wrapping).
- Enter or Space picks. Buttons are named by label, not by emoji.

## Do / don't

- Do: store the id, not the emoji.
- Don't: show more than about eight reactions.

## Customization

Pass `reactions` and `label`. Colors and sizes come from tokens.

## Limitations

- Does not position itself; wrap it in Popover for a floating panel.
- Emoji artwork is whatever the platform renders.

## Related

ReactionSummary, Popover, CountButton.

## Evidence

`test/primitives-engagement-reactions.test.mjs`.

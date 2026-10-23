# CharacterCountRing

A small ring that fills with the text length. Near the limit it grows and counts down; past it the number goes negative in the danger color.

## Use when

- Composers with a character limit.

## Avoid when

- Fields with no limit.
- As the only signal of a hard error; pair with a disabled submit.

## Anatomy

A `span` with an SVG track and arc, an optional countdown number (`aria-hidden`), and a visually hidden sentence.

## Behavior

- `ringState(length, max, warnAt = 20)` returns fraction, remaining, tone and showNumber; bad numbers clamp to an empty ring.
- The arc follows the fraction on the soft spring through direct style writes; reduced motion jumps.
- Tone is warning at or under `warnAt` remaining, danger below zero.

## Keyboard / accessibility

The hidden text reads "12 characters left" or "3 characters over the limit". It is not a live region.

## Do / don't

- Do: disable submit when over the limit.
- Do not: hide the ring while over the limit.

## Customization

Arc color follows the accent, warning and danger tokens. Size is 1.5rem.

## Limitations

- Counts what the host passes; it does not measure text.

## Related

CommentComposer, CompactCount.

## Evidence

`test/primitives-comments.test.mjs`.

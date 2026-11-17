# TopicChip

What a frame, section or story is about: an accent dot and a topic in sentence case.

## Use when

- A frame, section or story needs to say what it is about in one to four words.

## Avoid when

- The text repeats the headline under it, or needs uppercase styling; write a headline instead.

## Anatomy

Root `span.cieo-p-topic-chip`; the dot is a `::before` mark.

## Behavior

No motion. Sentence case is the author's.

## Keyboard / accessibility

- The dot is decorative; the words carry the meaning.

## Do / don't

- Do: `<TopicChip>Permitting</TopicChip>` above "Faster permits, fewer reviews."
- Don't: Under "What critics say", don't open the headline with "Critics say".

## Apple twin

`CieoUI.TopicChip` with the same name and rules; see docs/apple-components.md.

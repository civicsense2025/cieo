# AudioTranscript

Word-by-word transcript for a clip. The spoken word is highlighted, the highlight glides from word to word, and with `onSeek` a word can be clicked or chosen by keyboard to jump there.

## Use when

- A clip has timed words and you want follow-along reading or jump-to-word.

## Avoid when

- You only have untimed text; render plain text.

## Anatomy

A scrolling container with one gliding highlight and the words as inline blocks. With `onSeek` it is a `listbox` and words are `option`s.

## Behavior

- `activeWordIndex(words, t)` is a binary search: -1 before the first word, and gaps keep the previous word.
- Auto-scroll follows the active word only when the reader has not scrolled for 4 seconds.
- Reduced motion removes the glide; the active word just changes.

## Keyboard / accessibility

One tab stop. Arrow keys move a focus marker word to word (`aria-activedescendant`), Home and End jump, Enter or Space seeks. Click on a word seeks.

## Do / don't

- Do: give the container a height so it can scroll.
- Don't: put words out of order; they must be sorted by start.

## Customization

Colors from the accent-soft and text tokens; size the box from the host.

## Limitations

- Words must be pre-timed; no alignment is done here.

## Related

AudioPlayer, AudioTime..

## Evidence

`test/primitives-audio-playback.test.mjs`.

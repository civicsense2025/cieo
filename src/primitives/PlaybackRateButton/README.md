# PlaybackRateButton

One button that cycles the playback speed and shows it as 1.5×. The host applies the rate to the audio.

## Use when

- A player offers a few fixed speeds (1×, 1.5×, 2×).

## Avoid when

- Many fine-grained speeds; use a menu.

## Anatomy

A pill `button` whose text swaps with SwapText when the rate changes.

## Behavior

- `nextRate(rates, rate)` skips invalid speeds, returns the next speed, wraps at the end, and normalizes invalid scalar rates to 1×. An empty or invalid list falls back to 1×.
- Name reads "Playback speed, 1.5 times" ("1 time" for 1).

## Keyboard / accessibility

Real button; Space and Enter cycle. Focus ring on `:focus-visible`. Reduced motion swaps the text instantly.

## Do / don't

- Do: keep three or fewer speeds.
- Don't: use it to show a speed you do not apply.

## Customization

Speeds via `rates`.

## Limitations

- Does not touch the audio element.

## Related

AudioPlayer, AudioPlayButton..

## Evidence

`test/primitives-audio-playback.test.mjs`.

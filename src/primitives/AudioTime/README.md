# AudioTime

Elapsed and total time for an audio clip (0:12 / 1:03), the time left (-0:51), or only the length. Digits are tabular so the width never jitters, and a spoken form is kept for screen readers.

## Use when

- Any audio player or recorder needs a clock: voice notes, comment audio, transcripts.

## Avoid when

- Counting down to an event; use Timer.

## Anatomy

A `span` holding the visible time (`aria-hidden`) and a visually hidden spoken form ("12 seconds of 1 minute 3 seconds").

## Behavior

- `formatAudioTime(s)` gives m:ss under an hour and h:mm:ss above. Negative and non-finite input reads 0:00.
- `speakAudioTime(s)` gives "1 minute 3 seconds".
- `mode="total"` shows the length (or --:-- while unknown); `remaining` shows the time left; `elapsed` is the default.

## Keyboard / accessibility

Not focusable. It does not announce every tick; the player owning it decides when to announce.

## Do / don't

- Do: show `total` before playback and `elapsed` during it.
- Don't: put it in a live region; a ticking clock floods screen readers.

## Customization

Muted small text by default; override color through the host.

## Limitations

- Whole seconds only.

## Related

AudioPlayer, VoiceRecorder, Timer.

## Evidence

`test/primitives-social-audio.test.mjs`.

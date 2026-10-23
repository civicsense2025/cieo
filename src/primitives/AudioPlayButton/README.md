# AudioPlayButton

Round play/pause button for a clip. The icon morphs between the play triangle and the two pause bars; a ring shows while the clip loads. The host owns the playing state.

## Use when

- Any audio control needs a play/pause toggle: players, recorders reviewing a take, transcripts.

## Avoid when

- A generic toggle with no clip; use IconButton with `aria-pressed`.

## Anatomy

A native `button` holding an icon (two clipped halves that reshape) and a ring. Sizes `sm`, `md`, `lg`.

## Behavior

- The accessible name is `Play {label}` or `Pause {label}`; `audioPlayButtonName` builds it.
- `loading` shows the ring and sets `aria-busy`; the button stays pressable.
- The icon morphs with a CSS transition on the spring ease; reduced motion swaps instantly.

## Keyboard / accessibility

Real button: Space and Enter activate it. Focus ring on `:focus-visible`. Hit target is at least the touch target on touch screens.

## Do / don't

- Do: pass the clip's name as `label`.
- Don't: hide the clip name; "Play" alone is ambiguous in a list of notes.

## Customization

Size via `size`; color comes from the accent tokens.

## Limitations

- Does not own audio; pair with AudioPlayer.

## Related

AudioPlayer, IconButton, AudioWaveform..

## Evidence

`test/primitives-audio-playback.test.mjs`.

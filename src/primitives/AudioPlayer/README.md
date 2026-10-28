# AudioPlayer

One audio clip with play/pause, a waveform or progress scrubber, a clock and, in full, speed and time left. It owns one `audio` element and keeps only one player playing per page.

## Use when

- Voice notes in comments and messages (`compact`); a clip on its own page (`full`).

## Avoid when

- Streaming playlists or video; this is a single clip.

## Anatomy

A `group` holding the hidden `audio` (`preload=metadata`), AudioPlayButton, AudioWaveform (or a thin slider track), AudioTime, and in full a PlaybackRateButton.

## Behavior

- States: loading, ready, playing, ended, error; `audioPlayerStep` is the pure transition table.
- Ended returns to the start; play works again. Error shows "Couldn't play this clip" and a Retry that reloads.
- Replacing `src` pauses and resets the previous clip, clears its metadata and playhead, and ignores its late media events. The chosen valid rate is reapplied while the new clip loads; changed rate lists fall back to a supported rate.
- In the full variant, `rates={[]}` disables the playback-speed control. An all-invalid non-empty list falls back to 1×.
- Starting a player pauses the others, keyed by a unique token per instance (not `useId`, which repeats across separate React roots) in a module registry plus a `cieo:audio-play` event on the document, so separate bundles cooperate).
- Progress is written to a CSS variable each frame while playing; React state moves once per second. The loop stops on pause and unmount.

## Keyboard / accessibility

Every control is a tab stop. Space and Enter work on the play button only; the scrubber uses arrows, Page keys, Home and End. Clock ticks are never announced.

## Do / don't

- Do: pass `peaks` and `duration` when known.
- Don't: add a second audio element for the same clip.

## Customization

Layout through `variant`; colors from tokens; speeds via `rates`.

## Limitations

- No captions or transcript; pair with AudioTranscript.
- Needs the browser to play the file's format.

## Related

AudioPlayButton, AudioWaveform, AudioTime, PlaybackRateButton, AudioTranscript..

## Evidence

`test/primitives-audio-playback.test.mjs`.

## Host customization

`className` appends a root class. `slotProps` exposes `error`, `retry`, `track`, `root`, `main`, `times`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

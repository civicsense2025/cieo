# AudioWaveform

Bars drawn from a clip's loudness peaks. The played part fills continuously, and with `onSeek` the whole thing is a scrubber.

## Use when

- A clip shows its shape and playhead: voice notes, message bubbles, recorders.

## Avoid when

- You have no peaks and need a precise scrubber; AudioPlayer draws a thin progress track instead.

## Anatomy

A root (`role=slider` with `onSeek`, `role=img` without) holding two copies of the bars; the second, accent-colored copy is clipped to the progress.

## Behavior

- `waveformBars(peaks, count)` buckets by max, scales to 0..1 and keeps a floor of 0.08 so silence shows a tick.
- `seekFromPointer` and `waveformKeyStep` are pure and clamped.
- Bars grow in with a calm stagger of at most 300 ms; reduced motion shows them at once.
- Progress is a CSS variable, so a host can update it every frame without re-rendering the bars.

## Keyboard / accessibility

Slider: `aria-valuemin/max/now` and `aria-valuetext` ("12 seconds of 1 minute 3 seconds"). Arrows move 5 s, Page keys 10 percent, Home and End jump. Pointer scrub uses pointer capture.

## Do / don't

- Do: give it a `label` that names the clip.
- Don't: feed it thousands of peaks per frame; pass them once.

## Customization

Bar count via `bars`; colors from border-strong and accent tokens.

## Limitations

- Whole-second `aria-valuenow`.
- Peaks are not computed here; the recorder or server supplies them.

## Related

AudioPlayer, AudioTime, VoiceRecorder..

## Evidence

`test/primitives-audio-playback.test.mjs`.

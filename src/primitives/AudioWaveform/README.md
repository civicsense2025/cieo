# AudioWaveform

Bars drawn from a clip's loudness peaks. The played part fills continuously, and with `onSeek` the whole thing is a scrubber.

## Use when

- A clip shows its shape and playhead: voice notes, message bubbles, recorders.

## Avoid when

- You have no peaks and need a precise scrubber; AudioPlayer draws a thin progress track instead.

## Anatomy

A root (`role=slider` with `onSeek`, `role=img` without) holding two copies of the bars; the second, accent-colored copy is clipped to the progress.

## Behavior

- `waveformBars(peaks, count)` buckets by max, scales to 0..1 and keeps a floor of 0.08 so silence shows a tick. Rendered and helper output is capped at the exported `MAX_WAVEFORM_BARS` (128).
- `seekFromPointer` and `waveformKeyStep` are pure and clamped.
- Bars grow in with a calm stagger of at most 300 ms; reduced motion shows them at once.
- Progress is a CSS variable, so a host can update it every frame without re-rendering the bars.

## Keyboard / accessibility

Slider: `aria-valuemin/max/now` and `aria-valuetext` ("12 seconds of 1 minute 3 seconds"). Arrows move 5 s, Page keys 10 percent, Home and End jump. Pointer scrub uses pointer capture.

## Do / don't

- Do: give it a `label` that names the clip.
- Don't: feed it thousands of peaks per frame; pass them once.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Whole-second `aria-valuenow`.
- Peaks are not computed here; the recorder or server supplies them.

## Related

AudioPlayer, AudioTime, VoiceRecorder..

## Evidence

`test/primitives-audio-playback.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `bars`, `bar`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

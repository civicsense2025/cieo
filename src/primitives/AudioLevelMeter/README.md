# AudioLevelMeter

A few bars that rise and fall with how loud the microphone is. Pass a level, or a stream and the meter listens by itself.

## Use when

- Showing that a microphone is live while recording or in a call.
- Feeding back "I can hear you" before someone commits to a take.

## Avoid when

- Showing a precise reading; the bars are a glance, not an instrument.
- Playback progress; use a scrubber.

## Anatomy

A `role="img"` root named by `label`, holding `bars` hidden bar elements. Heights come from the CSS variable `--cieo-bar` on each bar.

## Behavior

- `rmsLevel(samples)` turns a block of samples into 0..1 on a dB scale: -60 dB or quieter is 0, 0 dB is 1, empty is 0.
- `levelBars(level, count)` gives each bar a height of 0.1 to 1, tallest in the middle.
- The level is smoothed by a spring that writes CSS variables through refs, so nothing re-renders per frame.
- With `stream`, the meter opens its own AudioContext and analyser in an effect and closes it on cleanup. `level` wins when both are given.
- Reduced motion still shows the level, without easing.

## Keyboard / accessibility

The root is a labelled image. The level is deliberately not announced as a changing value, because a value that changes 20 times a second is noise to a screen reader.

## Do / don't

- Do: pair it with a text state such as "Recording".
- Don't: use it as the only sign that recording is on.

## Customization

Bars use `currentColor` from `--cieo-color-accent`. Bar count and label are props.

## Limitations

- Peak level only; there is no peak-hold or clipping indicator.
- Starting a stream meter may need a user gesture before the browser lets audio run.

## Related

VoiceRecorder, AudioTime.

## Evidence

`test/primitives-audio-capture.test.mjs`.

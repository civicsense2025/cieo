# ClipRange

Start + length pair of native range inputs for trimming media. Host owns both values; the length ceiling follows the picked start so the clip never runs past the duration.

## Use when

- A GIF or clip needs a start point and a duration inside a known length.
- Keyboard, form, and screen-reader behavior must come free from native inputs.

## Avoid when

- One value needs a styled track with a rolling readout; use Slider.
- The trim needs frame thumbnails; that scrubber stays host-owned above this pair.

## Anatomy

`role="group"` named by `label`: two labeled native ranges plus an `output` readout ("0:02.5 – 0:04.0"). The length input's `max` recomputes from the start, so the end handle can never pass the media end.

## Behavior

No motion. Both sliders are controlled; outgoing values are clamped (`start` to `[min, max]`, `length` to `[step, max − start]`). `formatClipTime` (m:ss.t) formats the readout unless `formatValue` overrides it.

## Keyboard / accessibility

- Native range keyboard support (arrows, Home/End, PageUp/PageDown) on both inputs.
- Each input has its own `<label>`; the readout is an `output` tied to both inputs.

## Do / don't

- Do: `<ClipRange label="Clip range" startLabel="Start" lengthLabel="Length" max={duration} start={s} length={l} onStartChange={setS} onLengthChange={setL} />`.
- Don't: mirror the ceiling logic in the host; the component already clamps.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Seconds only; frame-accurate stepping is a `step` of one frame duration.
- No dual-thumb single track; two inputs keep native semantics.

## Related

Slider (atom, single styled range), NumberInput (atom, exact-value box), PreviewStage (molecule, the staged media).

## Evidence

Covered by `test/tool-components.test.mjs` (labels, clamping, readout format). No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `start`, `length`, `value`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Clamp math, ids, and output wiring remain component-owned. Existing content props retain their original semantics.

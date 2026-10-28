# Slider

Thin primitive contract over the production Range control: use where Astryx names Slider; behavior equals Range, no fork.

## Use when

- The design calls the control Slider. Import from this path, not from controls directly.
- You need a labelled native range input with track fill and optional live value readout.

## Avoid when

- You want different slider behavior; there is exactly one slider behavior, owned by `src/controls/Range.tsx`. Change it there, never here.
- You need a text or numeric input; that is a Field-wrapped input, not a Slider.

## Anatomy

Re-export only: `Range as Slider`, `RangeProps as SliderProps`. Label, optional value readout, native `<input type="range">` — all owned by Range.

## Behavior

Equals Range exactly: server-rendered fill at the initial value, exact follow on drag, snap on keyboard steps and track clicks, thumb grows while pressed. This file declares no component and no logic.

## Keyboard / accessibility

- Inherits Range: native range keyboard support (arrows/home/end), `label` required (or visually hidden via `hideLabel`).
- `showValue` adds a live `<output>` readout bound to the input.

## Do / don't

- Do: `import { Slider } from '../../primitives/Slider/Slider.js'` wherever Astryx says Slider.
- Don't: add props, styling, or wrappers here; extend Range if behavior must change.

## Customization

This alias retains the owning control’s customization API; see Host customization below.

## Limitations

- No new CSS and no new behavior by design. Any limitation is Range's limitation.
- Manifest `extensions.wraps` points at `src/controls/Range.tsx` as the single source of truth.

## Related

Range (control, the implementation), Field (molecule, for the label/help row around other controls).

## Evidence

Storybook-free: covered by `test/primitives-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

Alias of Range; preserves its native/owning component props instead of creating a second control contract. Use the underlying component’s supported `className`, style/native props, and content slots. This alias intentionally does not fork behavior or introduce a competing `slotProps` shape.

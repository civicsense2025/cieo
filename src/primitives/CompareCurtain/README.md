# CompareCurtain

Before/after compare with a slider-role divider. The divider follows the pointer one to one; keyboard and programmatic moves settle on the soft spring.

## Use when

- Two renders of the same artwork sit in one frame (source vs vector, before vs after).
- The divider position is host state shared with a caption or readout.

## Avoid when

- The layers are different sizes; normalize dimensions in the host first.
- The comparison needs discrete version picking; use two buttons plus a caption instead.

## Anatomy

Stacked `before` (full-bleed) and `after` (clipped from the inline end by `position`) layers, plus a full-height divider `<button role="slider">`. Position paints through refs (no re-render per frame); the spring writes the clip and the divider offset directly.

## Behavior

Pointer drag on the divider paints 1:1 and reports through `onMove`; on release the layer settles at the host value. Arrows move by `step`, Home/End jump to the ends. Reduced motion and `motion={false}` jump to the value.

## Keyboard / accessibility

- Divider is a native button with the slider role: `aria-valuemin/max/now` plus `aria-valuetext` ("42 percent vector result visible") from `valueText`.
- `aria-orientation="horizontal"`; arrow keys, Home, and End are handled on the divider.
- Clip geometry is physical (inline-end side); mirrored RTL layouts are a known limitation.

## Do / don't

- Do: `<CompareCurtain label="Comparison divider" valueText="vector result visible" before={...} after={...} position={pos} onMove={setPos} />`.
- Don't: animate `position` from the host on every frame; the spring owns the settle.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- LTR clip geometry only; RTL mirroring stays host-owned.
- Layers must share dimensions; the component clips, never scales.

## Related

PreviewStage (molecule, single-image zoom stage), Slider (atom, single-value range), Lightbox (molecule, modal image viewer).

## Evidence

Covered by `test/forma-gaps.test.mjs` (slider semantics, keyboard steps, reduced-motion jump). No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `before`, `after`, `divider`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, values, pointer capture, and clip geometry remain component-owned. Existing content props retain their original semantics.

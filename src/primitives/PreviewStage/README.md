# PreviewStage

Single-image zoom stage with backdrop switch, zoom toolbar, and fit toggle. Host owns the media and every value.

## Use when

- One render needs judging: zoom in on edges, flip the ground behind transparency, fit vs 100%.
- The same zoom state drives a readout elsewhere (pass it back through `onZoomChange`).

## Avoid when

- Two layers need a shared divider; use CompareCurtain.
- The viewer is modal; use Lightbox.

## Anatomy

`figure`: a scrollable `region` viewport (`data-backdrop`, `data-fitted`) holding the media, a pill toolbar (zoom out, reset-to-100% with rolling `Digits` readout, zoom in, fit toggle), a `SegmentedControl` backdrop switch, and an optional caption slot for dimensions or status. Zoom paints through the CSS `scale` property on the base spring; reduced motion and `motion={false}` show the end state.

## Behavior

All values are controlled. Zoom steps clamp to `[zoomStep, maxZoom]`; the reset button returns to 1. Panning is native scroll inside the focusable viewport. The checker ground reads theme tokens; the light/dark grounds are absolute white and black on purpose — they judge transparency, so they must not follow the theme.

## Keyboard / accessibility

- Viewport is a labeled region with a tab stop; arrow keys scroll natively.
- Every toolbar button has a name (`zoomInLabel`, `zoomOutLabel`, `zoomResetLabel`, `fitLabel`); the fit toggle uses `aria-pressed`; the backdrop switch is a labeled group.
- Zoom readout is a live `Digits` roll; under reduced motion it swaps without rolling.

## Do / don't

- Do: `<PreviewStage label="Vector result" zoom={z} onZoomChange={setZ} fitted={f} onFitChange={setF} backdrop={b} onBackdropChange={setB}><img ... /></PreviewStage>`.
- Don't: pass decorative wrappers as media; the stage scales its child directly.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No loupe, rotation, or ruler; those stay host-owned.
- Fitted media caps at 60vh; taller viewports scroll the page, not the stage.

## Related

CompareCurtain (molecule, shared-divider compare), SegmentedControl (molecule, the backdrop switch), Thumbnail (atom, fixed-ratio preview), Lightbox (molecule, modal viewer).

## Evidence

Covered by `test/tool-components.test.mjs` (backdrop switch, zoom controls, fit toggle). No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `viewport`, `media`, `toolbar`, `zoom`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Backdrop, zoom, and fit values plus pan geometry remain component-owned. Existing content props retain their original semantics.

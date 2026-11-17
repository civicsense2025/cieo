# PaletteSwatches

Selectable row of color swatches as a native radiogroup. Arrow keys, checking, and form participation come from the radios; the dots are paint only.

## Use when

- A vector palette, theme, or single-color recolor needs one picked fill.
- The row must work with keyboards and submit with a form.

## Avoid when

- One swatch needs a caption; use LegendItem.
- Several swatches toggle independently; use checkboxes, not radios.

## Anatomy

`role="radiogroup"` named by `label`: one `<label>` per swatch holding a native radio (covering the dot, transparent) plus a paint dot filled from the swatch record. `data-picked` mirrors state for the selected ring. Swatch fills are content data (artwork colors), not theme tokens, so they render from `swatches[i].color`.

## Behavior

Controlled or uncontrolled like SegmentedControl. Picked dot rings in accent on the surface tone; hover grows the dot on the snap spring, instant under reduced motion.

## Keyboard / accessibility

- Native arrow-key movement within the shared `name` group; each radio is named by its swatch `label` ("Ink #1F201C").
- Focus ring reads the focus tokens on the dot; disabled dots dim to the disabled opacity.

## Do / don't

- Do: `<PaletteSwatches label="Vector colors" name="fill" swatches={fills} value={fill} onValueChange={setFill} />`.
- Don't: pass theme-dependent colors and expect them to re-skin; fills are artwork data.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Dot-only row; visible hex captions stay host-owned beside the group.
- Color contrast of a fill against its ground is host content, outside the theme audit.

## Related

LegendItem (atom, one swatch with words), SegmentedControl (molecule, single-select pill), RadioList (molecule, labelled radio rows).

## Evidence

Covered by `test/tool-components.test.mjs` (radiogroup semantics, picking, form name). No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `swatch`, `dot`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Group semantics, checking, and the picked marker remain component-owned. Existing content props retain their original semantics.

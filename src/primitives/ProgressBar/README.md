# ProgressBar

Determinate task progress with native `<progress>` semantics.

## Use when

- Progress is measurable: `value` against `max` (e.g. upload at 40 of 100).
- The label names the task (e.g. `label="Uploading export"`).

## Avoid when

- Progress is unknown; use Spinner with a label instead.
- The bar would carry meaning without a label; the label is required, never optional.

## Anatomy

Root native `progress.cieo.cieo-progress` with `value`, `max`, and `aria-label`. Paint comes from the design-system `.cieo-progress` in `design/styles/controls.css`; this file owns the contract only.

## Behavior

No motion. `max` defaults to `100`. Native `<progress>` exposes value semantics to assistive tech. No new CSS file ships with this primitive.

## Keyboard / accessibility

- Root carries the task name (`aria-label`, required). Do not repeat it on adjacent text.
- Native `<progress>` keeps platform value semantics; keep `value` within `0..max`.

## Do / don't

- Do: `<ProgressBar value={40} label="Uploading export" />` under the task it measures.
- Don't: `<ProgressBar value={40} label="" />` with an empty label; name the task.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Determinate only; unknown progress is Spinner.
- Exactly one shared bar style; overrides limited per `styleParts`.

## Related

Spinner (atom), Slider (atom), Button (atom).

## Evidence

Storybook-free: covered by `test/primitives-feedback.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

# FormLayout

Field grid for forms, one column by default (sign-in, settings, checkout).

## Use when

- Form fields need one consistent gap and alignment in `1-4` columns.
- Fields share a single host `<form>`; this lays out its children only.

## Avoid when

- The page is not a form; use Grid or Stack for general layout.
- You need the `<form>` element itself; the host owns form semantics, not this grid.

## Anatomy

Root `div.cieo.cieo-form-layout` with `data-columns`; field children in document order. One gap between every field.

## Behavior

No motion. Single column by default; `columns` widens to `2-4`. The grid never steals focus and never submits.

## Keyboard / accessibility

- Presentational grid only; no label, no landmark, no focus.
- The host `<form>` and real fields own names, order, validation, and submit.

## Do / don't

- Do: `<FormLayout columns={2}>` with labelled fields inside a host `<form>`.
- Don't: render the `<form>` tag here; nested forms are invalid HTML.

## Customization

Column count only. Gaps and alignment come from Cieo tokens; do not restyle fields per instance.

## Limitations

- Max 4 columns. More means the form is not one form; split it.
- No validation, submit, or error semantics; host owns all form behavior.

## Related

Grid (molecule), Stack (molecule), Field (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

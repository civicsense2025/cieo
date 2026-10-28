# Stepper

Progress steps rendered from an array; pure render.

## Use when

- A flow has 2–8 ordered steps with one current step.
- Step state comes from the host (form progress, checkout stage).

## Avoid when

- Steps need custom content per step; hand-build with Step items instead.
- The flow branches; a linear stepper misleads.

## Anatomy

`<nav aria-label>` with an `<ol>`; the current `<li>` carries `aria-current="step"`.

## Behavior

No motion. Pure render of `steps`; never advances itself. Exactly one step should be current.

## Keyboard / accessibility

- Nav carries the name (`aria-label`, required). Current step announces via `aria-current`.
- Steps are text, not links; do not make them clickable unless the host wires it.

## Do / don't

- Do: `<Stepper label="Signup progress" steps={[...]} />` with one current step.
- Don't: mark two steps current; one position only.

## Customization

Label and steps only. Markers and type come from Cieo tokens.

## Limitations

- 2–8 steps. One step is not progress; nine is a maze.
- No click handling; interactive steps need host buttons.

## Related

Step (atom), Pagination (molecule), ProgressBar (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

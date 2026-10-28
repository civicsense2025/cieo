# Overlay

Full-viewport scrim behind dialogs and sheets.

## Use when

- Exactly one modal (dialog or sheet) is open and needs a dimmed backdrop.
- The host needs a presentational scrim with no behavior of its own.

## Avoid when

- No modal is open; never render a bare scrim.
- More than one modal stacks; one scrim per open modal layer at most.

## Anatomy

Single `div.cieo-p-overlay`, fixed to the viewport, `aria-hidden`.

## Behavior

No motion, no state. The host owns open state and dismissal; this component renders only.

## Keyboard / accessibility

- Presentational only: `aria-hidden="true"`, no handlers, no focus.
- Never intercept pointer events itself; the host owns dismissal (escape, close button).
- Focus management belongs to the dialog or sheet above it.

## Do / don't

- Do: render behind one modal at a time, owned by the dialog host.
- Don't: add `onClick` or keyboard handlers here; dismissal lives with the host.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No props, no slots. Any dismissal, animation, or stacking logic belongs to the host.
- Single scrim only; nested modals need host-level stacking, not nested overlays.

## Related

Dialog (organism), Sheet (organism), Tooltip (molecule).

## Evidence

Storybook-free: covered by `test/primitives-overlay.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

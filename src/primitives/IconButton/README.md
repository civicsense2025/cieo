# IconButton

Square icon-only button with a required accessible name.

## Use when

- One icon-only action needs a square button (close, search, more).
- The icon alone must carry meaning; the label supplies the accessible name.

## Avoid when

- Text can label the action; use Button instead.
- Never render without a label; types enforce it and there is no label-free variant.

## Anatomy

Native `<button type="button">` with `aria-label` and `data-size`; host icon node as the single child.

## Behavior

No motion. Size defaults to `md`; `sm` shrinks to the small control height. Square shape holds via `aspect-ratio: 1`.

## Keyboard / accessibility

- `label` is required and maps to `aria-label`; types enforce it.
- Native button focus and activation; visible focus must remain on the square frame.

## Do / don't

- Do: `<IconButton label="Close">` with a close icon child.
- Don't: put text or multiple children inside; one icon node only.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Single icon child only. No text content or multiple slots.
- Sizes are `sm` and `md` only.

## Related

Button (atom), Toolbar (molecule), ButtonGroup (molecule).

## Evidence

Storybook-free: covered by `test/primitives-action.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

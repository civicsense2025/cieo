# Icon

Decorative glyph slot, labelled only when meaningful alone.

## Use when

- A glyph decorates visible text (a search icon beside a Search button label).
- A lone glyph must carry meaning; then `label` supplies its accessible name.

## Avoid when

- Text can do the job; never use an Icon as a heading or button on its own without a label.
- The glyph needs button behavior; use IconButton instead.

## Anatomy

Root `span.cieo.cieo-p-icon` with `data-size`; single glyph child. Labelled form uses `role="img"` + `aria-label`; unlabelled form is `aria-hidden`.

## Behavior

No motion. Size defaults to `md`; `sm` shrinks the glyph box. The glyph inherits current color.

## Keyboard / accessibility

- Unlabelled icons are `aria-hidden="true"` and add nothing to the tree.
- Labelled icons use `role="img"` with a short name; types do not require it, judgment does.

## Do / don't

- Do: `<Icon size="sm">✓</Icon>` beside a "Synced" label.
- Don't: `<Icon>×</Icon>` as a close control; that is an IconButton with a label.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One glyph child only; no text content or multiple slots.
- Sizes are `sm` and `md` only.

## Related

IconButton (atom), Button (atom), Text (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

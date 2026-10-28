# Toolbar

Horizontal action bar with optional title.

## Use when

- 2+ related actions share one row with an optional title.
- Host owns the actions; this owns bar layout and toolbar semantics only.

## Avoid when

- Actions need connected borders; use ButtonGroup instead.
- There is only one action; use a Button or IconButton alone.

## Anatomy

Root `role="toolbar"` with `aria-label`; optional title span pushes actions to the end; actions span holds host controls.

## Behavior

No motion. Horizontal only. Title is optional; actions slot requires at least one child.

## Keyboard / accessibility

- Root carries the bar name (`aria-label`, required). Do not repeat it on children.
- Children keep native focus and order; roving tabindex is out of scope.

## Do / don't

- Do: `<Toolbar label="Editor actions" title="Document">` with Save/Share buttons.
- Don't: nest toolbars or use it as a generic header; the role implies actions.

## Customization

Title content only. Colors, radius, and spacing come from Cieo tokens; do not restyle per instance.

## Limitations

- Max 16 action children. More means the actions are not related; split the bar.
- Horizontal only; no vertical or wrapping variant.

## Related

ButtonGroup (molecule), Button (atom), IconButton (atom).

## Evidence

Storybook-free: covered by `test/primitives-action.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `title`, `actions`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

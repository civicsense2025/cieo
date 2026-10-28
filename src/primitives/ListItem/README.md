# ListItem

One row with padding and divider, inside a List.

## Use when

- You need one homogeneous row inside a List (a story, an event, a bill).
- The host owns row content and actions; this owns padding and divider only.

## Avoid when

- Outside a List root; a lone ListItem has no list semantics.
- You need nested interactive landmarks inside the row; keep row content flat.

## Anatomy

`li` wrapper with row class; host content as children. Never nest interactive landmarks inside.

## Behavior

No motion. Consistent block padding with a bottom divider; last row drops the divider. Never steals focus.

## Keyboard / accessibility

- Inherits list semantics from the parent List. No label of its own.
- Keep row content flat; never nest interactive landmarks inside.

## Do / don't

- Do: one row of story content inside `<List>`.
- Don't: nest buttons inside links (or landmarks inside landmarks) within a row.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One row only. No nesting, no selection, no expansion.
- Host owns all row content and actions.

## Related

List (molecule), Table (lane plan), Card (organism).

## Evidence

Storybook-free: covered by `test/primitives-table-list.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

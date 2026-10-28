# SortableListItem

One reorderable row inside `SortableList`.

## Use when

- Each entry of a `SortableList` needs its own handle and content.

## Avoid when

- Outside a `SortableList`; it renders but cannot be moved.

## Anatomy

A handle button plus the row content. In a `tbody` list the item is a `tr` with the handle in its first cell and your cells after it.

## Behavior

The handle starts a pointer drag or a keyboard lift; the list owns the order and the announcements.

## Keyboard / accessibility

Space or Enter lifts; arrows move; Space or Enter drops; Escape cancels. The handle is named "Reorder {label}".

## Do / don't

- Do: pass a human `label`; it is read aloud on every move.
- Don't: nest interactive controls inside the handle.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- `id` must match the list's `order`; unknown ids are appended after ordered items.

## Related

SortableList (molecule).

## Evidence

`test/primitives-sortable-list.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `handle`, `handleCell`, `body`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

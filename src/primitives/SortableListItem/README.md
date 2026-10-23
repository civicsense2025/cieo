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

`handle` replaces the grip; `disabled` removes the item from reordering.

## Limitations

- `id` must match the list's `order`; unknown ids are appended after ordered items.

## Related

SortableList (molecule).

## Evidence

`test/primitives-sortable-list.test.mjs`.

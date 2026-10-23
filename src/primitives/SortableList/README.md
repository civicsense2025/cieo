# SortableList

Controlled drag-and-drop and keyboard reordering for lists and table rows. Pair with `SortableListItem`.

## Use when

- Users reorder a short list in place: pipeline stages, saved views, table rows.
- The host keeps the order (state, server) and wants one callback when it changes.

## Avoid when

- Items move between lists; this reorders inside one list.
- The list is long enough to need virtualization.

## Anatomy

A `ul`, `ol`, `div` or `tbody` (`as`) holding `SortableListItem` children. Each item renders a handle button plus its content (cells for `tbody`). Children may arrive in any order; `order` decides placement.

## Behavior

- `order` is the list of item ids; `onReorder(next)` fires once on drop, and only if the order changed.
- Pointer: press a handle and drag. Items swap live as the pointer crosses their midpoints (`orientation` picks the axis). Releasing drops; pointer cancel or Escape restores the old order.
- Keyboard: focus a handle, Space or Enter lifts, Arrow keys (and Home or End) move, Space or Enter drops, Escape cancels. A polite live region announces each step.
- Motion: neighbours slide with the shared FLIP helper. Reduced-motion users get no slide; `motion={false}` also turns it off.

## Keyboard / accessibility

- Handles are native buttons named "Reorder {label}" with `aria-pressed` while lifted.
- Escape calls `preventDefault`, so a surrounding dialog does not also close.

## Do / don't

- Do: give every item a stable `id` that matches `order`, and a readable `label`.
- Don't: use array indexes as ids; the order would change identity as it moves.

## Customization

`handle` swaps the grip glyph. Colors and spacing come from Cieo tokens.

## Limitations

- One axis. No cross-list moves, no auto-scroll while dragging near an edge.

## Related

Table (organism), List (molecule), DropdownMenu (molecule).

## Evidence

`test/primitives-sortable-list.test.mjs`.

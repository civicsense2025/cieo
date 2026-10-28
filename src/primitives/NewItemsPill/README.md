# NewItemsPill

A pill that drops in from the edge of a feed when new items arrive, rolls its count as more come, and leaves when there are none.

## Use when

- A live thread or feed gained items while the reader is looking elsewhere in it.

## Avoid when

- New items can simply be inserted without moving what the reader is reading.

## Anatomy

A sticky, zero-height wrapper holding a pill button (rolling count plus label) and a polite live region.

## Behavior

- Shows while `count` is above zero: drops in from `placement` when it goes 0 to n, rolls the digits through `CompactCount` as it grows, and leaves when it returns to 0.
- `newItemsLabel(n)` gives "1 new reply" or "3 new replies"; pass `label` to localize or reword. The text after the number is shown as written; a label that does not start with the number shows whole, without the roll.
- Pressing it calls `onShow`; the host reveals the items and resets the count.
- Reduced motion and `data-motion='off'` skip the drop and the roll.

## Keyboard / accessibility

A real button with an `aria-label` of the full label. A polite live region announces the label on first appearance only, not on every increment, and clears when the pill leaves.

## Do / don't

- Do: place it inside the scrolling feed container so sticky positioning holds it at the edge.
- Don't: render a second pill for another count in the same feed.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One pill per scroll container; it does not scroll for you.

## Related

`CompactCount`, `CountButton`.

## Evidence

Covered by `test/primitives-social-content.test.mjs` (label, announcement rule, markup contract).

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `button`, `count`, `text`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

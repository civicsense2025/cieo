# List

Plain row collection with consistent dividers (stories, events, bills).

## Use when

- Rows are homogeneous and share one layout (stories, events, bills).
- Order does not matter; reach for `ordered` only when sequence matters.

## Avoid when

- Rows need varied layouts or grouping; that is a table or card collection, not a list.
- You need selection semantics; that is a radio, checkbox, or select, not a list.

## Anatomy

Root `ul` (or `ol` when `ordered`) with `aria-label`; ListItem rows as children. Dividers separate rows; last row has none.

## Behavior

No motion. Unordered by default; `ordered` switches the root to `ol`. List never steals focus.

## Keyboard / accessibility

- Root carries the list name (`aria-label`, optional). Do not repeat it on rows.
- Rows keep document order. Use `ol` only when sequence matters so screen readers announce position.

## Do / don't

- Do: `<List label="Latest stories">` with ListItem rows of story content.
- Don't: use `ordered` for decoration; numbers imply the sequence matters.

## Customization

Ordered flag only. Spacing, dividers, and colors come from Cieo tokens; do not restyle rows per instance.

## Limitations

- Homogeneous rows only. Mixed layouts need a different primitive.
- No selection or expansion semantics; host owns row content and actions.

## Related

ListItem (atom), Table (lane plan), Card (organism).

## Evidence

Storybook-free: covered by `test/primitives-table-list.test.mjs` + docs preview. No device acceptance in this plan.

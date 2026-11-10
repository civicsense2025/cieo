# IndexRow

A ranked row: two-digit rank, title, muted note and an optional bar.

## Use when

- A ranked list such as most-read stories.

## Avoid when

- Order doesn't matter; use List.

## Anatomy

Root `a` or `div.cieo-p-index-row`.

## Behavior

`rankLabel` pads to two digits; `barFraction` clamps to 0–1.

## Keyboard / accessibility

- The rank is decorative; list order carries it.

## Do / don't

- Do: `<IndexRow rank={1} title="…" href="…" />`
- Don't: Don't use for unranked items.

## Apple twin

`CieoUI.IndexRow` with the same name and rules; see docs/apple-components.md.

# ShareBar

Shares of a whole as one bar; draws nothing unless every share is a positive number.

## Use when

- A whole splits into parts, such as seats by party.

## Avoid when

- Any share is unknown; the bar draws nothing rather than guess.

## Anatomy

Root `div.cieo-p-share-bar[role=img]`.

## Behavior

`shareFractions` returns null for missing, zero, negative or single shares.

## Keyboard / accessibility

- `label` reads the split in words.

## Do / don't

- Do: `<ShareBar label="Yes 73, No 25" segments={...} />`
- Don't: Don't rely on colour; pair with LegendItem and labelled ends.

## Apple twin

`CieoUI.ShareBar` with the same name and rules; see docs/apple-components.md.

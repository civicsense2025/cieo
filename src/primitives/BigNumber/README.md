# BigNumber

A numeral set large with its label inline or stacked, read as one phrase.

## Use when

- One number is the point of a frame or section.

## Avoid when

- Several numbers compete; use a table or list.

## Anatomy

Root `p.cieo-p-big-number`, value then label.

## Behavior

No motion; animate with `Digits` from cieo/react if needed.

## Keyboard / accessibility

- Reads as one phrase: "73–25 vote to take up the bill".

## Do / don't

- Do: `<BigNumber value="73–25" label="Vote to take up the bill" />`
- Don't: Don't put two BigNumbers side by side.

## Apple twin

`CieoUI.BigNumber` with the same name and rules; see docs/apple-components.md.

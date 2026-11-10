# NumberedSteps

A short ordered process led by large numerals.

## Use when

- How-to instructions in order, such as a call script.

## Avoid when

- Progress through a process; use StepList.

## Anatomy

Root `ol.cieo-p-numbered-steps`.

## Behavior

No motion.

## Keyboard / accessibility

- List order is announced; numerals are decorative.

## Do / don't

- Do: `<NumberedSteps steps={[{ title: 'Say who you are' }]} />`
- Don't: Don't exceed six steps.

## Apple twin

`CieoUI.NumberedSteps` with the same name and rules; see docs/apple-components.md.

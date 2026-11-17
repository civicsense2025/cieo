# StepList

What happens next: quiet numbers, a check once done, "next" on the current step.

## Use when

- A process has three to five steps and one is in progress.

## Avoid when

- Steps are a form wizard; use Stepper.

## Anatomy

Root `ol.cieo-p-step-list`; each `li` carries `data-state`.

## Behavior

`stepState` clamps a stale index.

## Keyboard / accessibility

- The current step has `aria-current="step"`.

## Do / don't

- Do: `<StepList current={1} steps={...} />`
- Don't: Don't number with roman numerals or letters.

## Apple twin

`CieoUI.StepList` with the same name and rules; see docs/apple-components.md.

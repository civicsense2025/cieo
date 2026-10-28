# SelectableCard

Checkable card for picking one option among visible cards (monthly vs. yearly billing).

## Use when

- Each option needs rich content (price, blurb) that a bare checkbox cannot hold.
- Selection is host state and the card only reports toggles.

## Avoid when

- The choice navigates somewhere; use ClickableCard instead.
- Options are plain short labels; use native checkboxes instead.

## Anatomy

`role="checkbox"` div with `aria-checked`, `aria-label`, `tabIndex 0`, and host children.

## Behavior

No motion. Click, Enter, or Space calls `onSelect`; the host flips `selected`. Never toggles itself.

## Keyboard / accessibility

- Card carries the option name (`label`, required) and state (`aria-checked`).
- Focusable natively via tabIndex; Space scroll is prevented so it selects instead.

## Do / don't

- Do: `<SelectableCard label="Monthly billing" selected onSelect={pick}>` with price details.
- Don't: put links or buttons inside; nested interactives break the checkbox contract.

## Customization

Selected state only. Surface, border, and selected ring come from Cieo tokens.

## Limitations

- No radio-group exclusivity; the host enforces single-choice across siblings.
- No disabled state; the host withholds `onSelect` and says why in text.

## Related

Card (organism), ClickableCard (organism), BottomSheetSwitcher (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a class to the root without replacing the Cieo class. `slotProps` accepts named presentation parts: `root`. Each part accepts `className`, `style`, `title`, and nonreserved `data-*` attributes. Roles, ARIA, refs, handlers, state attributes, and owned geometry remain component-owned. Existing content props and children remain the content slots.

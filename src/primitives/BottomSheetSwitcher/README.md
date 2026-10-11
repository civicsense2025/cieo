# BottomSheetSwitcher

Named option list for choosing inside a bottom sheet (share to an app, pick sort order).

## Use when

- A BottomSheet holds 2–8 mutually exclusive options.
- Each option is a host control (`role="option"`) with its own selection state.

## Avoid when

- Options need multiple selection; that is a checklist, not a listbox.
- There is only one action; render the action directly instead of a list.

## Anatomy

Root `role="listbox"` with `aria-label`; host options as children. Options stack full-width.

## Behavior

No motion. This shell owns layout and naming only; selection state and activation belong to the host options.

## Keyboard / accessibility

- Root carries the list name (`aria-label`, required). Do not repeat it on options.
- Host options keep `role="option"`, `aria-selected`, and arrow-key order. Visible focus must survive.

## Do / don't

- Do: `<BottomSheetSwitcher label="Share options">` with Mail/Messages/Copy options.
- Don't: mix navigation links and options in one list; the listbox role promises selection.

## Customization

None per instance. Spacing and dividers come from Cieo tokens; do not restyle options per instance.

## Limitations

- Max 16 children. More means the options are not one choice; split the list.
- No selection semantics of its own; the host options own `aria-selected`.

## Related

BottomSheet (organism), Dialog (organism), List (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

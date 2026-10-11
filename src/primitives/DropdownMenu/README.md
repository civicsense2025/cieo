# DropdownMenu

Controlled menu shell that drops a panel of actions under a host trigger.

## Use when

- A button needs to offer 3–10 follow-up actions without leaving the page (sort, export, share).
- The trigger stays put and the panel floats; the menu is modal to nothing.

## Avoid when

- There are only 1–2 actions; inline Buttons are faster than a menu.
- The options navigate between views; use TabList or real navigation links instead.

## Anatomy

Wrapper with a `trigger` slot (exactly one host control) and menu content. Open state renders `div role="menu"` with `aria-label`; closed renders no panel at all.

## Behavior

No motion. Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). Trigger clicks report `onOpenChange(true)` and keep any host `onClick`. Escape and outside-click are host-owned: the host closes by setting `open` false.

## Keyboard / accessibility

- Panel carries the menu name (`aria-label`, required); items use `menuitem` roles.
- Trigger keeps its own accessible name; do not move focus into the panel automatically.
- Host must close on Escape and return focus to the trigger.

## Do / don't

- Do: `<DropdownMenu label="Sort options" trigger={<button>Sort</button>}>` with `onOpenChange` wired to host state.
- Don't: put non-action content (forms, paragraphs) in the panel; it is a menu, not a popover.

## Customization

Panel position only (CSS overrides on the panel class). Colors, radius, and elevation come from Cieo tokens.

## Limitations

- Max 16 menu children. No focus trap, no arrow-key roaming; host owns menu keyboard behavior.
- No portal; the panel positions against the wrapper, so clipping parents clip it.

## Related

DropdownMenuItem (atom), MoreMenu (molecule), Overlay (primitive).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

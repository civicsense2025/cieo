# DropdownMenuItem

Single menu action that runs and usually closes the menu.

## Use when

- One row of a DropdownMenu performs one host action (rename, duplicate, archive).
- The row needs a disabled state while the menu stays open.

## Avoid when

- The row toggles a setting; use DropdownMenuCheckboxItem instead.
- The row picks one of many; use DropdownMenuRadioItem instead.

## Anatomy

Native `<button>` with `role="menuitem"`. `label` names icon-only rows; otherwise children text is the name. Full-bleed row inside the panel.

## Behavior

No motion. Click reports `onSelect`; the host runs the action and closes the menu. `disabled` defaults to false and blocks clicks natively.

## Keyboard / accessibility

- Name comes from children text, falling back to `label`. Supply one, never both competing.
- Disabled uses native `disabled`, removing the row from tab order.
- Keep names verb-first ("Rename file", not "File rename").

## Do / don't

- Do: `<DropdownMenuItem label="Rename" onSelect={rename}>` with the host closing the menu inside `rename`.
- Don't: nest interactive controls inside the row; the whole row is the button.

## Customization

Hover fill only. Type, spacing, and radius come from Cieo tokens; do not restyle per row.

## Limitations

- One action per row; no split buttons or inline links.
- Closing the menu is host work; the item never closes anything itself.

## Related

DropdownMenu (molecule), DropdownMenuCheckboxItem (atom), DropdownMenuDivider (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

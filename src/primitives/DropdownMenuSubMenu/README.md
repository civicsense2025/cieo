# DropdownMenuSubMenu

Nested flyout menu for one level of overflow, like export formats under Export.

## Use when

- A menu row owns 2–6 sub-options that deserve their own panel (export formats, sort fields).
- One nesting level is enough; deeper trees belong in navigation, not menus.

## Avoid when

- The sub-options fit the parent menu; a flat list beats a flyout.
- You need two or more nesting levels; flyouts inside flyouts lose pointer and focus.

## Anatomy

Wrapper with a trigger button and a nested `div role="menu"` panel. CSS `:hover` and `:focus-within` reveal the panel (Tooltip pattern); `aria-label` names both.

## Behavior

Opacity-only reveal, no JavaScript motion. The reduced-motion guard drops even the fade. Panel hides when pointer and focus leave; host owns closing the root menu.

## Motion

Reveals on snap token via entering; motion={false} renders instantly. Reduced motion always resolves end states.

## Keyboard / accessibility

- Trigger keeps native button focus; tabbing into the panel keeps it open via `:focus-within`.
- Panel carries the submenu name (`aria-label`, required), distinct from the root menu name.
- One nesting level only; never put a submenu inside a submenu.

## Do / don't

- Do: `<DropdownMenuSubMenu label="Export as">` with two or three format rows.
- Don't: hide the only path to an action inside a hover-only flyout on touch layouts.

## Customization

Panel position only. Colors, radius, and elevation come from Cieo tokens.

## Limitations

- Max 8 children. CSS-only reveal: no Escape handling and no arrow-key roaming; host owns submenu keyboard behavior.
- Hover-driven; touch hosts should open the root menu item by tap instead.

## Related

DropdownMenu (molecule), DropdownMenuItem (atom), Tooltip (primitive).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

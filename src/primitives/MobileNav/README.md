# MobileNav

Drawer nav; renders null when closed.

## Use when

- Narrow screens need the full nav as an overlay drawer.
- A toggle (MobileNavToggle) and a close path both exist.

## Avoid when

- The nav fits on screen; use TopNav or SideNav instead.
- There is no dismissal path; a drawer without close traps users.

## Anatomy

Fixed panel with `<nav aria-label>` plus an optional close button when `onClose` is set. Null when shut.

## Behavior

No motion. `open` defaults to false; closed renders null (nothing in the tree). Host owns focus and scrim.

## Keyboard / accessibility

- Nav carries the name (`aria-label`, required). Drawer needs focus management from the host.
- Close button renders only with `onClose`; always provide one.

## Do / don't

- Do: `<MobileNav label="Site" open={open} onClose={close}>` with section links.
- Don't: mount drawer content while closed; null keeps it out of the tab order.

## Customization

Open state only. Panel surface, width, and border come from Cieo tokens.

## Limitations

- No scrim, focus trap, or Escape handling; the host wires all three.
- One drawer per page; stacked drawers are not supported.

## Related

MobileNavToggle (atom), TopNav (organism), SideNav (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a class to the root without replacing the Cieo class. `slotProps` accepts named presentation parts: `root`, `navigation`, `close`. Each part accepts `className`, `style`, `title`, and nonreserved `data-*` attributes. Roles, ARIA, refs, handlers, state attributes, and owned geometry remain component-owned. Existing content props and children remain the content slots.

# TopNavMegaMenu

Controlled disclosure panel below a trigger (a "Products" menu with rich rows).

## Use when

- One trigger needs a rich panel of links, rows, and a featured card.
- Open state is owned by the host or stays local and uncontrolled.

## Avoid when

- A plain link group suffices; use TopNavMenu instead.
- The panel must reposition near viewport edges; this panel never flips.

## Anatomy

Trigger `<button aria-expanded>` plus an absolutely positioned panel below it. Panel renders only when open.

## Behavior

No motion. Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`, false). Toggle flips state; host may drive it.

## Keyboard / accessibility

- Trigger carries `aria-expanded`. Panel appears directly after the trigger in order.
- Escape-to-close and focus return are the host's job; this owns layout only.

## Do / don't

- Do: `<TopNavMegaMenu trigger="Products">` with rows and one featured card.
- Don't: nest mega menus; one level of disclosure per trigger.

## Customization

Open state only. Panel surface, border, and spacing come from Cieo tokens.

## Limitations

- Panel never flips or repositions; near the right edge it can overflow (host must place triggers left).
- Max 16 panel children. More means the menu is a page, not a panel.

## Related

TopNavMegaMenuItem (atom), TopNavMegaMenuFeaturedCard (molecule), TopNavMenu (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `panel`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

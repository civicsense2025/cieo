# CommandPaletteFooter

Hint bar pinned to the palette bottom.

## Use when

- Keyboard hints (↑↓ navigate, ↵ select, esc close) need a stable home.
- A match count ("6 of 24") explains a capped list.

## Avoid when

- There are no hints worth showing; omit the bar entirely.
- Actions are needed; footer children are hints, not buttons.

## Anatomy

Bottom bar `div`; host children are kbd hints or count text.

## Behavior

No motion. Always last in the palette; never scrolls with the list.

## Keyboard / accessibility

- Hints are text; never focusable. Keep kbd names real ("Escape", not "esc" alone).
- Counts are live text; the host announces them, not the bar.

## Do / don't

- Do: `<CommandPaletteFooter>↑↓ to navigate · ↵ to select</CommandPaletteFooter>`.
- Don't: put primary actions here; the palette has no action row.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Single row; overflow wraps, never scrolls.
- No sticky logic beyond palette order; the host composes it last.

## Related

CommandPalette (molecule), CommandPaletteEmpty (atom), Toolbar (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

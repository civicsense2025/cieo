# CommandPalette

Controlled command-menu shell; the host filters items from the query.

## Use when

- A ⌘K-style menu jumps between pages, actions, or records.
- The host already owns the item list and can filter it from query text.

## Avoid when

- The list is short and static; a plain menu or select needs no filter shell.
- You need modal focus trapping; this is a panel, not a dialog manager.

## Anatomy

Root `role="dialog"` with `aria-label`; host composes Input, List, Groups, Items, Empty, and Footer inside.

## Behavior

No motion. `query` is host state; `onQueryChange` wires to the input. The shell never filters children itself.

## Keyboard / accessibility

- Root carries the palette name (`aria-label`, required); items keep `role="option"`.
- Full keyboard travel (arrow keys, Enter) is host-owned; keep one tab stop into the palette.

## Do / don't

- Do: `<CommandPalette label="Site commands">` with the host filtering items from `query`.
- Don't: pre-filter children and also pass `query`; one owner or the count lies.

## Customization

Panel paint only. Radius, border, and surface come from Cieo tokens; do not restyle per instance.

## Limitations

- No positioning or flip; the host places the panel.
- No persistence; the host owns open state and recent items.

## Related

CommandPaletteInput (atom), CommandPaletteList (molecule), Popover (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

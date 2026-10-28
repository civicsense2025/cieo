# CommandPaletteItem

One pickable command; host owns filtering and highlight.

## Use when

- One row runs one command or jumps to one record.
- The row needs icon plus title plus kicker content.

## Avoid when

- The row navigates with a URL and no action; use a link row instead.
- The row toggles state; that is a switch or checkbox, not a command.

## Anatomy

`div role="option"` with `aria-selected` and a stable `data-value`; children are the row content.

## Behavior

No motion. `selected` defaults to false; click calls `onSelect(value)`. Highlight and commit are host-owned.

## Keyboard / accessibility

- `value` is required and stable across filters; screen readers announce the row content plus selection.
- Keep row content short; the value is the identity, not the announcement.

## Do / don't

- Do: `<CommandPaletteItem value="new-bill">` with a short title child.
- Don't: put buttons inside the row; the row is the button.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Pointer-only commit here; keyboard commit lives with the host list.
- No disabled state; the host removes unactionable commands instead.

## Related

CommandPaletteList (molecule), CommandPaletteGroup (atom), TypeaheadItem (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

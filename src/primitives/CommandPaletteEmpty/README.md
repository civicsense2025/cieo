# CommandPaletteEmpty

Quiet empty text when the host filter matches nothing.

## Use when

- The query matches zero commands and the list would be blank.
- A hint ("Try a page title") beats a bare gap.

## Avoid when

- Matches exist; render nothing instead of a stale empty note.
- The palette is loading; use Spinner, not "No results".

## Anatomy

Single quiet paragraph; default content is "No results"; custom children replace it.

## Behavior

No motion. Pure text; never interactive, never focusable.

## Keyboard / accessibility

- Presentational text; not announced as an option and never in the option count.
- Keep it short; it sits where results would be.

## Do / don't

- Do: render only when the host match count is zero.
- Don't: add retry buttons here; recovery controls belong to the host.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One line of comfort; no illustrations or actions.
- Host decides zero-state; this component only says it.

## Related

CommandPaletteList (molecule), CommandPaletteFooter (atom), Spinner (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

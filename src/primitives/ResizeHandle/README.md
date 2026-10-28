# ResizeHandle

Drag separator between resizable regions; host owns the drag.

## Use when

- Two adjacent regions (sidebar/content) resize by dragging their boundary.
- The host attaches pointer handlers and passes them via rest props.

## Avoid when

- Regions resize via buttons or presets; use plain buttons instead.
- Only one region exists; there is no boundary to drag.

## Anatomy

Div with `role="separator"`, `aria-orientation`, `data-orientation`, and optional `aria-label`. All other DOM props spread through for host drag handlers.

## Behavior

No motion and no internal drag logic. Host attaches onPointerDown and friends via rest props and updates layout.

## Keyboard / accessibility

- Give it a `label` ("Resize sidebar") so readers find the boundary.
- Host should add keyboard resizing; the separator alone is pointer-only.

## Do / don't

- Do: `<ResizeHandle label="Resize sidebar" onPointerDown={start} />`.
- Don't: implement drag math in the component; the host owns it.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No drag, keyboard, or layout logic included; host supplies everything.
- Must sit between exactly two resizable regions.

## Related

Stack (molecule), Collapsible (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

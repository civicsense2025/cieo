# DropdownMenuGroup

Labeled section that clusters related rows inside a dropdown menu.

## Use when

- A menu holds two or more clusters (file rows vs. share rows) that need spoken separation.
- The cluster has a short noun name ("Export", "View") worth announcing.

## Avoid when

- The menu has fewer than four rows; one flat list scans faster.
- Separation is only visual; use DropdownMenuDivider instead of an empty label.

## Anatomy

`div role="group"` with `aria-label`; small caption plus host items. No selection semantics of its own.

## Behavior

No motion, no state. Renders the caption only when `label` is set; unlabeled groups still cluster items for assistive tech.

## Keyboard / accessibility

- `label`, when set, becomes the group name; keep it to one or two words.
- Items keep native button focus and tab order; the group never takes focus.
- Do not repeat the menu name as the group name.

## Do / don't

- Do: `<DropdownMenuGroup label="Export">` around the PDF/CSV/PNG rows.
- Don't: wrap a single row; a group of one announces noise, not structure.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Max 16 children. No collapsible groups; every section stays open.
- Nested groups are not supported; one level only.

## Related

DropdownMenu (molecule), DropdownMenuDivider (atom), DropdownMenuItem (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `label`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

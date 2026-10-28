# NavIcon

Icon slot in nav rows; inherits icon sizing, no CSS.

## Use when

- A nav row needs a leading icon next to its label.
- The icon is decorative; the row text names the destination.

## Avoid when

- The icon alone must carry meaning; pair it with visible text.
- You need nav-specific sizing; icons size themselves, not this slot.

## Anatomy

`aria-hidden` span with `data-size`; host icon component renders inside.

## Behavior

No motion, no styles. `size` defaults to md and passes through as `data-size`.

## Keyboard / accessibility

- Always `aria-hidden`; icons never enter the accessible name.
- Row text stays the single source of the link name.

## Do / don't

- Do: `<NavIcon><GearIcon /></NavIcon>` beside a "Settings" label.
- Don't: wrap the row's only text inside NavIcon; it would be hidden.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Ships no CSS by design (`styleParts` is empty); do not add per-instance styles.
- One icon per slot; stacks of icons need their own layout.

## Related

SideNavItem (atom), TopNavItem (atom), SideNavCollapseButton (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

# LayoutHeader

App frame header landmark, unstyled by design (brand row, top nav).

## Use when

- The Layout frame needs its top banner landmark.
- Header content (brand, nav, actions) belongs to the host.

## Avoid when

- Outside a Layout frame; a bare header has no frame to top.
- You need section headings; use Section with a title instead.

## Anatomy

Root `header.cieo.cieo-layout-header` with optional `aria-label`; host content as children. No CSS ships with this primitive.

## Behavior

No motion, no paint. Renders the banner landmark only; sizing comes from the Layout frame. Never steals focus.

## Keyboard / accessibility

- Root is the `banner` landmark; `label` names it only when a page has more than one header.
- Nav inside keeps its own semantics; do not repeat the label on children.

## Do / don't

- Do: `<LayoutHeader>` with brand and nav inside a Layout frame.
- Don't: style it per page here; the host owns branding and paint.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Unstyled landmark only. Borders, background, and height belong to the host.
- One banner per page; extra headers need labels or a different primitive.

## Related

Layout (molecule), LayoutContent (atom), LayoutFooter (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

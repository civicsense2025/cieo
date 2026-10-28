# LayoutContent

App frame main landmark, unstyled by design (page body goes here).

## Use when

- The Layout frame needs its main content landmark.
- Page content belongs to the host inside the frame.

## Avoid when

- Outside a Layout frame; a bare main has no frame to fill.
- You need a titled subsection; use Section with a title instead.

## Anatomy

Root `main.cieo.cieo-layout-content` with optional `aria-label`; host page content as children. No CSS ships with this primitive.

## Behavior

No motion, no paint. Renders the main landmark only; growth comes from the Layout frame. Never steals focus.

## Keyboard / accessibility

- Root is the `main` landmark; exactly one per page. Skip links target it.
- `label` names it only when a page nests more than one main (avoid that).

## Do / don't

- Do: `<LayoutContent>` with the page body inside a Layout frame.
- Don't: render two mains on one page; one main per page.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Unstyled landmark only. Max width and gutters belong to Center or Grid inside.
- One main per page; extra mains confuse landmark navigation.

## Related

Layout (molecule), LayoutHeader (atom), LayoutFooter (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

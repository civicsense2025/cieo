# TopNavHeading

Brand slot in the top nav; links home by default.

## Use when

- The header needs a brand mark or wordmark that links home.
- Exactly one brand sits at the leading edge of TopNav.

## Avoid when

- The brand is decorative; it must still link somewhere real.
- You need a page heading; that is an `<h1>`, not a nav brand.

## Anatomy

Native `<a href="/">` wrapping host brand content (logo, wordmark, or both).

## Behavior

No motion. `href` defaults to `/`. Never renders without children.

## Keyboard / accessibility

- Native link focus. Label the brand with text, not image alone (alt text counts).
- Do not repeat the site name in the nav's aria-label.

## Do / don't

- Do: `<TopNavHeading>Cieo</TopNavHeading>` linking to `/`.
- Don't: point the brand at the current page; it must go home.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One brand per header. Co-branding needs a single combined mark.
- No dropdown on the brand; menus are siblings, not children.

## Related

TopNav (organism), NavIcon (atom), TopNavItem (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

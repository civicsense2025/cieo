# AppShell

App frame with a nav rail and main content (authenticated app chrome).

## Use when

- The app needs a persistent nav rail (SideNav) beside the page.
- Main content is required; nav is optional (bare pages omit it).

## Avoid when

- The page has no nav rail; use Layout with header, content, and footer instead.
- You need top-only chrome; LayoutHeader covers that without a rail.

## Anatomy

Root `div.cieo.cieo-app-shell`; `nav` slot renders `.cieo-app-shell-nav` (at most one), default slot renders `.cieo-app-shell-main` (required). Compose SideNav plus page content.

## Behavior

No motion. Two columns (`auto/1fr`); without nav the main takes the full row. The shell never steals focus and never routes.

## Keyboard / accessibility

- Frame is presentational; landmarks come from the nav (SideNav) and the main inside.
- Keep exactly one main per page; the host matchMedia pattern below must not duplicate landmarks when collapsing the rail (match the narrow query in one place, render either the rail or its replacement, never both). No `useAppShellMobile` hook ships in this plan; the host owns its own media query.

## Do / don't

- Do: `<AppShell nav={<SideNav />}>` with the routed page as children.
- Don't: put page content in the nav slot; nav holds navigation only.

## Customization

Slots only. Columns and gutters come from Cieo tokens; do not restyle the frame per app.

## Limitations

- One nav, one main. Collapse, overlay, and routing behavior belong to the host.
- No mobile hook in this plan; hosts use their own matchMedia for the rail.

## Related

Layout (molecule), LayoutPanel (atom), SideNav (lane plan).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

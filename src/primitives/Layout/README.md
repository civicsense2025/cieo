# Layout

App frame composing header, content, and footer (full-page shell).

## Use when

- A page needs the standard frame: header on top, content filling, footer pinned.
- Children are the landmark trio: LayoutHeader, LayoutContent, LayoutFooter.

## Avoid when

- The region is a subsection of a page; use Section instead.
- The frame needs navigation rails; use AppShell with a nav slot instead.

## Anatomy

Root `div.cieo.cieo-layout`; compose `<LayoutHeader>`, `<LayoutContent>`, `<LayoutFooter>` as children. Rows are `auto/1fr/auto`.

## Behavior

No motion. Content row grows to fill the viewport (`100dvh`); header and footer size to content. Layout never steals focus.

## Keyboard / accessibility

- Frame is presentational; landmarks come from the header, content, and footer children.
- Keep exactly one `main` (LayoutContent) per page; skip links target it.

## Do / don't

- Do: `<Layout>` wrapping header, content, and footer landmarks in order.
- Don't: put two LayoutContent mains on one page; one main per page.

## Customization

None per instance. Rows and viewport height come from Cieo tokens; do not restyle the frame per page.

## Limitations

- Header/content/footer order only. Sidebars need LayoutPanel or AppShell.
- No scroll ownership; scrolling regions use ScrollableArea inside content.

## Related

LayoutHeader (atom), LayoutContent (atom), LayoutFooter (atom), AppShell (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

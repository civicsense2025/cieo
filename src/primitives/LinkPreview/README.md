# LinkPreview

A link card with a lead image, favicon and domain, and a title clamped to two lines. The whole card is one link.

## Use when

- A post or comment includes a link whose metadata the host has already fetched.

## Avoid when

- You would fetch metadata from the browser; the host owns that. The component does not fetch page metadata, though the browser loads supplied image and favicon URLs.

## Anatomy

A root with a content area (media, then a body with the site row, title and description) and, while loading, a skeleton of the same footprint in the same grid cell.

## Behavior

- `variant="large"` (default): 16:9 image on top, then favicon and domain, then the title. `compact`: square thumbnail left, text right.
- One link: the title anchor stretches over the card with `::after`. Only absolute credential-free http(s) destinations render as links; other values render a card that is not a link.
- Images and favicons require absolute credential-free http(s) URLs; relative paths are dropped to avoid implicit same-origin asset requests. An absolute same-origin asset can still receive same-origin cookies, so supplying one is an explicit host trust decision. `referrerPolicy="no-referrer"` limits referrer disclosure but does not prevent a request. External assets are requested by each visitor's browser and disclose their IP address and network metadata to the asset host, so production hosts should proxy/cache them or use an approved host. Assets use `loading="lazy"` and `decoding="async"`; images reserve space by aspect ratio and fade in once loaded.
- A failed image is retried when its source changes.
- The parsed destination hostname always remains visible and accessible, even when optional site branding is shown.
- `loading` shows the skeleton; when it turns false the skeleton leaves first (100ms), then the content fades in.
- `displayDomain(url)` returns the host without `www.`, or an empty string.
- Reduced motion and `data-motion='off'` remove every animation and transition.

## Keyboard / accessibility

One tab stop (the title link) with a focus ring drawn around the whole card. While loading, a polite status says "Loading link preview" and the root is `aria-busy`.

## Do / don't

- Do: pass `alt=""` for the image when the title already says it.
- Don't: put other links or buttons inside the card; the stretched link would cover them.

## Customization

Border, surface and text colors from tokens; the thumbnail width is the only fixed size.

## Limitations

- Titles and descriptions are text only. No video or embedded players.

## Related

`RichText`, `Skeleton`, `AspectRatio`.

## Evidence

Covered by `test/primitives-social-content.test.mjs` (single link, lazy images, untrusted input, loading footprint).

## Host customization

`className` appends a root class. `slotProps` exposes `titleText`, `root`, `media`, `body`, `content`, `site`, `favicon`, `siteName`, `domain`, `title`, `description`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

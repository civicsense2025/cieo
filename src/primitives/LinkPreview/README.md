# LinkPreview

A link card with a lead image, favicon and domain, and a title clamped to two lines. The whole card is one link.

## Use when

- A post or comment includes a link whose metadata the host has already fetched.

## Avoid when

- You would fetch metadata from the browser; the host owns that, so this component does no network calls.

## Anatomy

A root with a content area (media, then a body with the site row, title and description) and, while loading, a skeleton of the same footprint in the same grid cell.

## Behavior

- `variant="large"` (default): 16:9 image on top, then favicon and domain, then the title. `compact`: square thumbnail left, text right.
- One link: the title anchor stretches over the card with `::after`. A URL that is not http(s) renders a card that is not a link.
- Images and favicons accept same-origin paths or http(s) addresses; unsafe or failing assets are dropped. Remote assets are requested by each visitor's browser and disclose their IP address and network metadata to the asset host. Production hosts should proxy/cache them or use approved same-origin assets. Supplying a remote URL is an explicit host opt-in. Assets use `referrerPolicy="no-referrer"`, `loading="lazy"`, and `decoding="async"`; images reserve space by aspect ratio and fade in once loaded.
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

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
- Images must be http, https or same-site; unsafe or failing images and icons are dropped. Images use `loading="lazy"`, `decoding="async"` and reserve space by aspect ratio. They fade and de-blur in once loaded.
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

# Mention

An @handle inside post text. It links to a profile when the host gives a safe address and renders as plain text otherwise.

## Use when

- A post, comment or message names another account.

## Avoid when

- You need a hover card or an autocomplete; those belong to the host.

## Anatomy

An `a` (safe address) or a `span` (no address) holding `@handle`, with the display name as the `title`.

## Behavior

- `normalizeHandle(raw)` trims, strips one leading `@` and returns an empty string for blanks or text with whitespace; an empty handle renders nothing.
- `safeHref(href)` allows only http, https and same-site paths, hashes and queries. `javascript:`, `data:`, protocol-relative and other schemes become plain text.

## Keyboard / accessibility

A link is one tab stop with a visible focus ring. The text is the handle itself, so it reads naturally in a sentence.

## Do / don't

- Do: build the profile address on the host from a trusted id.
- Don't: assume the address is safe because it came from your database; the component checks it anyway.

## Customization

Accent color and medium weight through tokens.

## Limitations

- Does not detect mentions; use `RichText` for that.

## Related

`RichText`, `Avatar`, `VerifiedBadge`.

## Evidence

Covered by `test/primitives-social-content.test.mjs` (handle normalization, address safety, markup).

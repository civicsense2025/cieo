# RichText

Turns plain post text into safe inline nodes: links, @mentions, #tags and line breaks. It never injects HTML.

## Use when

- Showing user-written posts, comments or bios that may contain links and handles.

## Avoid when

- The text is trusted rich content (a CMS article); render that with your own pipeline.

## Anatomy

A `span` of text nodes, `a` links, `Mention` atoms, tag spans or links, and `br` for newlines.

## Behavior

- `tokenizeRichText(text)` returns `{ type, value, href? }` tokens for `text`, `url`, `mention`, `tag` and `break`. Joining the values rebuilds the original text.
- Links: `http(s)://` addresses and bare domains with a path (`x.com/joelw`). Trailing `.,;:!?)"'` are left as text; a closing parenthesis stays only when it balances one inside the address. `javascript:`, `data:` and other schemes never become links.
- Mentions need a boundary before the `@`, so `a@b.com` is not a mention. Tags must start with a letter.
- `shortenUrl(url, max)` drops the scheme and `www.` and ellipsizes the end to at most `max` characters; the full address is the link `title`.
- Links open in a new tab with `rel="noopener noreferrer ugc nofollow"`.

## Keyboard / accessibility

Each link is a normal tab stop. Line breaks are real `br` elements, so reading order matches the source.

## Do / don't

- Do: give `hrefFor` builders so mentions and tags link somewhere.
- Don't: pass already-escaped HTML; the text is shown literally.

## Customization

Link and tag colors come from `--cieo-color-accent`. `maxUrlLength` sets the visible link length.

## Limitations

- No markdown, no emoji shortcodes, no bare domains without a path (`example.com` stays text).

## Related

`Mention`, `LinkPreview`.

## Evidence

Covered by `test/primitives-social-content.test.mjs` (adversarial schemes, punctuation, parentheses, emoji, newlines, emails).

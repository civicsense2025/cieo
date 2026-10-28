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
- Mentions need a boundary before the `@`, so email addresses (any RFC 5322 local-part character before the `@`) are not mentions. A handle longer than 30 characters, or followed by `-`, is not cut short into a mention. An address with a name or password before the host (`https://paypal.com@evil.example/`) stays plain text so the link text cannot spoof the host. Trimming is linear, even for a very long run of `)`. Tags must start with a letter.
- `shortenUrl(url, max)` drops the scheme and `www.` and ellipsizes the end to at most `max` characters; the full address is the link `title`.
- Links open in a new tab with `rel="noopener noreferrer ugc nofollow"`.

## Keyboard / accessibility

Each link is a normal tab stop. Line breaks are real `br` elements, so reading order matches the source.

## Do / don't

- Do: give `hrefFor` builders so mentions and tags link somewhere.
- Don't: pass already-escaped HTML; the text is shown literally.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No markdown, no emoji shortcodes, no bare domains without a path (`example.com` stays text).

## Related

`Mention`, `LinkPreview`.

## Evidence

Covered by `test/primitives-social-content.test.mjs` (adversarial schemes, punctuation, parentheses, emoji, newlines, emails).

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `link`, `tag`, `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

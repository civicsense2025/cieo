# QuotedText

Someone's exact words: a reference, a hanging accent quotation mark and the passage. No side border.

## Use when

- A bill, ruling or statement is quoted exactly.

## Avoid when

- The text is a paraphrase; use body text.

## Anatomy

Root `figure.cieo-p-quoted-text` with optional figcaption and a blockquote.

## Behavior

Changed words go in `<mark>`, drawn as an underline.

## Keyboard / accessibility

- Blockquote semantics; the quotation mark is decorative CSS.

## Do / don't

- Do: `<QuotedText reference="§1302">…by striking <mark>‘90 days’</mark>”</QuotedText>`
- Don't: Don't add a side border; the hanging mark replaces it.

## Apple twin

`CieoUI.QuotedText` with the same name and rules; see docs/apple-components.md.

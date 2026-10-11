# CodeBlock

Block-level preformatted snippet with a language tag.

## Use when

- Docs show a multi-line snippet readers copy or study.
- A language tag helps readers (e.g. `tsx`, `sql`); display only.

## Avoid when

- The snippet is a word or two inside a sentence; use Code instead.
- You need real syntax highlighting; the tag is a label, not a highlighter.

## Anatomy

Root `pre.cieo.cieo-p-code-block` with optional `data-language`, wrapping one `code` child with the snippet text.

## Behavior

No motion. Block scrolls horizontally when long; whitespace preserves exactly. Language defaults to untagged.

## Keyboard / accessibility

- Block is static and scrollable; keyboard readers can move through long lines.
- Name the language in adjacent text when it matters; `data-language` is display only.

## Do / don't

- Do: `<CodeBlock language="tsx">` with a five-line usage snippet.
- Don't: inline a CodeBlock mid-sentence; blocks break prose flow.

## Customization

Language tag only. Fill, border, radius, and mono type come from Cieo tokens.

## Limitations

- Plain preformatted text; no highlighting, no line numbers, no copy button.
- One snippet per block; sequences need separate blocks.

## Related

Code (atom), Text (atom), Kbd (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

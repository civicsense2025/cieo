# Blockquote

Quoted passage with an optional source credit.

## Use when

- Prose quotes a ruling, speech, or passage verbatim.
- The source is known; `cite` credits it under the quote.

## Avoid when

- The words are paraphrased; paraphrase belongs in Text, not a quote.
- The source needs a link; pair with a Citation instead of stuffing a URL in `cite`.

## Anatomy

Native `blockquote.cieo.cieo-p-blockquote` with the passage as children and an optional `footer > cite` credit.

## Behavior

No motion. Credit renders only when `cite` is set; otherwise the passage stands alone.

## Keyboard / accessibility

- Native blockquote semantics tell readers this is quoted speech.
- Keep quotes verbatim; altered quotes mislead no matter how they are styled.

## Do / don't

- Do: `<Blockquote cite="Brown v. Board, 1954">` around the quoted line.
- Don't: use Blockquote for visual indentation of your own words.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One passage per quote; threads of quotes need separate blocks.
- Credit is plain text; linked sources compose with Citation.

## Related

Citation (atom), Text (atom), Heading (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `attribution`, `source`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

# Code

Inline code span for names and short snippets.

## Use when

- Prose names a key, token, file, or short snippet inline.
- The snippet is short enough to sit inside a sentence.

## Avoid when

- The snippet spans lines; use CodeBlock instead.
- The content is a keyboard key; use Kbd instead.

## Anatomy

Native `<code class="cieo cieo-p-code">` with host content as children. No props.

## Behavior

No motion. Renders inline with mono type and a soft fill; never breaks layout alone.

## Keyboard / accessibility

- Code is static text; it takes no focus and adds no semantics beyond `code`.
- Do not put critical instructions in code alone; the sentence around it carries meaning.

## Do / don't

- Do: `Press <Code>Enter</Code> to continue` inside a Text sentence.
- Don't: paste a 40-line config into Code; that is a CodeBlock.

## Customization

None per instance. Fill, radius, and mono type come from Cieo tokens.

## Limitations

- Inline only; block snippets need CodeBlock.
- One content slot; no language tag here.

## Related

CodeBlock (atom), Kbd (atom), Text (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

# Heading

Section titles h1 through h6.

## Use when

- A section needs a real title at the right outline level.
- Levels nest in order; one `h1` names the page.

## Avoid when

- The text is body copy styled large; use Text instead of a fake heading.
- Levels skip (h2 straight to h4); keep the outline honest.

## Anatomy

Chosen `h1`–`h6` element with `cieo cieo-p-heading` and `data-level`; title text as children.

## Behavior

No motion. Level defaults to 2. Size scales in em per `data-level` so nested contexts shrink together; margin is zero.

## Keyboard / accessibility

- Real heading elements feed the document outline; screen-reader users navigate by them.
- Exactly one `level={1}` per page; sections start at 2 and nest without skipping.

## Do / don't

- Do: `<Heading level={2}>Results</Heading>` to open a results section.
- Don't: `<Heading level={4}>` directly under an h2 with no h3 between.

## Customization

Level only. Scale, leading, and weight come from Cieo tokens; do not set font or margin per instance.

## Limitations

- Title text only; rich section headers compose Heading with Text.
- Six levels only; deeper nesting means the outline needs rework.

## Related

Text (atom), Blockquote (atom), Banner (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

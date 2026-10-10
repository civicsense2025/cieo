# Text

Body copy with size control (paragraphs, inline spans, plain blocks).

## Use when

- Rendering body copy at default or small size.
- The element needs to match context: `p` for paragraphs, `span` inline, `div` for blocks.

## Avoid when

- The copy is a heading; use the Heading lane, never Text at a large size.
- The copy needs emphasis or status color; pair with Badge or strong copy instead of restyling.

## Anatomy

Chosen element (`p` by default) with `cieo cieo-p-text` and `data-size`; single content slot as children.

## Behavior

No motion. Element defaults to `p`; size defaults to `default`, with `small` for secondary copy. No focus, no selection semantics.

## Keyboard / accessibility

- Text is static copy; it takes no focus and adds no semantics beyond its element.
- Use a real `p` for paragraphs so assistive tech keeps paragraph structure; do not fake headings with styled Text.

## Do / don't

- Do: `<Text size="small">Updated 2h ago</Text>` for secondary copy.
- Don't: `<Text>Page title</Text>` as a heading; that is the Heading lane.

## Customization

Element and size only. Type scale, leading, and spacing come from Cieo tokens; do not set font or margin per instance.

## Limitations

- One content slot, max 1 child. Structured copy means separate Text nodes.
- Two sizes only (`default`, `small`); headings and display type live elsewhere.

## Related

Badge (atom), Button (atom), Heading (lane plan).

## Evidence

Storybook-free: covered by `test/primitives-content.test.mjs` + docs preview. No device acceptance in this plan.

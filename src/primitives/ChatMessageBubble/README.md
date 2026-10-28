# ChatMessageBubble

Variant bubble for one message body, incoming or outgoing (their reply vs. your reply).

## Use when

- Styling the visible bubble inside a ChatMessage.
- Side alone carries meaning (theirs left, yours right).

## Avoid when

- The note is systemic (joined, renamed); use ChatSystemMessage instead.
- Color alone would carry the side; position plus label must survive monochrome.

## Anatomy

Plain `div` with `data-variant`; host text or rich content as children.

## Behavior

No motion. Variant defaults to incoming; outgoing mirrors alignment and tint.

## Keyboard / accessibility

- Presentational container; it adds no role and takes no focus.
- Never rely on bubble color alone; the author line names the speaker.

## Do / don't

- Do: `<ChatMessageBubble variant="outgoing">` for the reader's own message.
- Don't: put interactive controls inside a bubble without a labeled wrapper.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No tail or avatar; the host composes those around the bubble when needed.
- Text truncation belongs to the host; the bubble always fits its content.

## Related

ChatMessage (molecule), ChatMessageList (organism), ChatMessageMetadata (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

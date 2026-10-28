# ReplyPreview

A short quote of the message being answered, with an accent bar. Dismissible in a composer, a jump target in a thread.

## Use when

- Above a composer while replying to a specific comment.
- Inside a bubble or comment that answers another one.

## Avoid when

- Quoting long passages; link to the original instead.

## Anatomy

A root (`div`, or `button` for a jumpable quote) with an accent bar, the author name, the excerpt, and in the composer variant a dismiss button.

## Behavior

- Excerpt clamps to two lines (one line in the composer variant).
- Composer dismiss is named "Cancel reply to {author}"; quote jump is named "Go to the message from {author}".
- Without `onDismiss` or `onJump` the matching button is not rendered.

## Keyboard / accessibility

Both controls are real buttons with names and focus rings; touch targets grow to the touch size on coarse pointers.

## Do / don't

- Do: pair the composer variant with Escape handling in the input (CommentComposer does).
- Do not: nest it inside another button.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Plain text excerpts only.

## Related

CommentComposer, Comment, ChatMessageBubble.

## Evidence

`test/primitives-comments.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `bar`, `text`, `author`, `excerpt`, `root`, `dismiss`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

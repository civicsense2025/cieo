# CommentComposer

The box at the bottom of a thread. Text grows to six rows, the host supplies tools and media, and a recorder can take over the input.

## Use when

- Adding to a comment thread, with or without media.
- Replying to a specific comment.

## Avoid when

- Single-line search or command fields.

## Anatomy

A `form` with an optional reply quote, then an avatar beside a column of: input pane (textarea or recorder), attachment previews, and a bar with tools, the count ring and the post button.

## Behavior

- Enter inserts a newline; Cmd/Ctrl+Enter posts; Escape cancels a reply when one is shown.
- Post is disabled when empty (unless `hasAttachments`), past `maxLength`, `pending` or `disabled`. `composerCanSubmit` is the pure rule.
- The ring appears at 80% of `maxLength`. Swapping text and recorder fades the old pane out in 100ms before the new one enters; focus moves into the recorder, and back to the input when it leaves.

## Keyboard / accessibility

The form and input are named. Tools sit in a labelled group; the ring speaks its count once; the post button shows its busy state.

## Do / don't

- Do: keep tool buttons named icon buttons.
- Do not: clear `value` before `onSubmit` finishes if the post can fail.

## Customization

Tokens only. The input grows to six lines then scrolls.

## Limitations

- No mention or hashtag completion; hosts can wrap the input.
- Text is trimmed on submit.

## Related

Comment, CharacterCountRing, ReplyPreview, ChatComposer.

## Evidence

`test/primitives-comments.test.mjs`.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `reply`, `row`, `avatar`, `main`, `panes`, `pane`, `input`, `attachments`, `bar`, `tools`, `submit`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

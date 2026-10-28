# Comment

A post in a thread. The host fills every slot; the comment lays them out and draws the rail that joins replies to their parent.

## Use when

- Threaded comments, replies and post streams.
- Anywhere audio, links or images sit inside a reply.

## Avoid when

- Chat bubbles; use ChatMessage.

## Anatomy

An `article` labelled by its byline. Two columns: the avatar column (avatar plus the rail) and the content column (byline and menu, body, attachments, actions, status, then replies).

## Behavior

- The rail runs under the avatar when `railed` is set or replies exist; each reply from depth 1 draws a curve from the parent rail into its avatar, and the straight run continues to the next sibling.
- Pending dims the comment and shows "Posting…"; failed shows the `status` slot as a danger line; deleted shows "This comment was deleted" and keeps its replies; highlighted fades its accent-soft background out.
- A new comment (`entering`) rises from 0.45 opacity. All motion is off for reduced motion and `data-motion="off"`.

## Keyboard / accessibility

The article is labelled by the byline (or the deleted notice). Failed status is announced as an alert, pending as a status. Slots carry their own controls and names.

## Do / don't

- Do: give action icon buttons names.
- Do not: put the menu button inside the body.

## Customization

Avatar size and rail color come from custom properties on the root; colors use tokens.

## Limitations

- The rail geometry assumes the avatar column is a fixed width.

## Related

CommentThread, CommentComposer, ByLine, Avatar.

## Evidence

`test/primitives-comments.test.mjs`.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `avatar`, `line`, `main`, `deleted`, `head`, `menu`, `body`, `attachments`, `actions`, `status`, `replies`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

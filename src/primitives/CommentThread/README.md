# CommentThread

Takes a tree of comments and renders it as nested lists. The host renders each comment; the thread decides depth, how many replies show, and the reveal.

## Use when

- Comment sections with nested replies.
- Any tree of posts where branches can be long.

## Avoid when

- Flat chats; use ChatMessageList.

## Anatomy

A `section` holding nested `ul role="list"` branches. Each `li` holds whatever `renderItem` returns; hidden replies sit behind a "View N more replies" button at the end of the branch.

## Behavior

- `buildCommentTree` keeps input order, turns orphans into roots and breaks cycles; `countDescendants`, `visibleReplies` and `flattenReplies` are pure.
- Each branch shows `initialReplies` until its button is pressed; the revealed replies open on a height animation, neighbours slide (FLIP), and focus moves to the first new reply.
- Past `maxDepth` descendants are listed in order at that level. Expanded ids are internal unless `expanded` and `onExpandedChange` are passed.

## Keyboard / accessibility

Real nested lists with optional per-branch labels. The reveal is a real button; the animation is skipped for reduced motion.

## Do / don't

- Do: pass `branchLabel` so each list has a name.
- Do not: change keys between renders; row identity drives the slide.

## Customization

Spacing comes from Comment; the more button uses control tokens.

## Limitations

- No collapse-again control; hosts can reset `expanded`.
- Hidden counts are direct replies of the branch.

## Related

Comment, CommentComposer, SortableList.

## Evidence

`test/primitives-comments.test.mjs`.

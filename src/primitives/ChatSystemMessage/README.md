# ChatSystemMessage

Centered note for transcript events like joins and renames (Ava joined, Mo renamed the group).

## Use when

- The transcript needs a neutral event line between messages.
- The event comes from the system, not from a participant.

## Avoid when

- A participant wrote the line; use ChatMessage instead.
- The line needs an action (undo, view); use a labeled button instead.

## Anatomy

Single centered `p`; host text as children.

## Behavior

No motion. Static text; the host inserts one per event in document order.

## Keyboard / accessibility

- Plain paragraph; it takes no focus and adds no role.
- Keep wording factual so log announcements stay trustworthy.

## Do / don't

- Do: `<ChatSystemMessage>Ava joined the conversation</ChatSystemMessage>`.
- Don't: use it for errors the reader must act on; those need emphasis and actions.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Text only (slot max 1); no links or buttons inside.
- No timestamps of its own; the host includes them in the wording when needed.

## Related

ChatMessage (molecule), ChatMessageMetadata (atom), ChatMessageList (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

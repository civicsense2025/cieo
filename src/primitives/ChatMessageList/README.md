# ChatMessageList

Scrollable transcript region that announces new messages politely (a support thread, a group chat).

## Use when

- Rendering an ordered transcript of ChatMessage entries.
- New arrivals should announce without stealing focus.

## Avoid when

- The content is not a conversation; use List instead.
- The host needs a chatty live region; `role="log"` already implies polite announcements.

## Anatomy

`role="log"` div with `aria-label`; host messages as children. Container scrolls vertically.

## Behavior

No motion. Empty transcripts render the empty container; the host adds empty-state copy when wanted.

## Keyboard / accessibility

- Region carries the transcript name (`label`, defaults to Messages).
- Log semantics announce additions politely; never move focus on arrival.

## Do / don't

- Do: `<ChatMessageList label="Support thread">` with ChatMessage children.
- Don't: nest another log inside; one transcript region per conversation.

## Customization

Label only. Height, scroll, and spacing come from Cieo tokens and host layout.

## Limitations

- No virtualization; very long transcripts belong to a paged host.
- No auto-scroll; the host scrolls on send when that fits the task.

## Related

ChatMessage (molecule), ChatMessageBubble (atom), ChatLayout (organism), ChatComposer (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

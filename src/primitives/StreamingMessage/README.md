# StreamingMessage

An agent message that may still be arriving, rendered as plain text.

## Use when

- You show `MessageView` text from `cieo/agent` while deltas stream in.

## Avoid when

- The text is trusted Markdown you want formatted; render it with Markdown once complete.

## Anatomy

ChatMessage (author, time) → `div.cieo.cieo-p-streaming-message[data-complete]` → `p[data-text]` and, when capped, `p[data-truncated]`.

## Behavior

Text is plain text with line breaks kept (`white-space: pre-wrap`). It is never parsed as HTML. `aria-busy` is set until the message is complete. No motion.

## Keyboard / accessibility

- `aria-busy` asks assistive tech to wait for the final text.
- The truncated note is visible text, not only a style.

## Do / don't

- Do: pass the store's `MessageView` as-is.
- Don't: inject the text with `dangerouslySetInnerHTML`.

## Customization

`author`, `time`, `truncatedText`. Type and colour from tokens.

## Limitations

- No Markdown or code highlighting.
- No typing indicator; the host's status words cover that.

## Related

ChatMessage, ChatMessageList, AgentLanes.

## Evidence

`test/primitives-agent.test.mjs` (HTML escaped, aria-busy, truncated note). No device acceptance yet.

# AgentActivity

The ordered log of what an agent run did, one row per confirmed event.

## Use when

- You show a run's history from `selectActivity` in `cieo/agent`.

## Avoid when

- You show the conversation itself; use StreamingMessage and ChatMessageList.
- You need rows for things the host has not confirmed yet. This log only renders what the store holds.

## Anatomy

`ol.cieo.cieo-p-agent-activity[role=log][aria-label]` with one `li[data-type][data-seq]` per entry, keyed by sequence. An optional `li[data-empty]` shows while the log is empty.

## Behavior

No motion: a row appears in its final state. Rows follow the store's order, and the store's ring cap bounds the list. `describe` turns each entry into its content.

## Keyboard / accessibility

- `role="log"` makes new rows polite announcements. Keep `describe` output short.
- `label` defaults to "Agent activity"; set it when a page has several logs.

## Do / don't

- Do: `describe={(e) => words[e.type] ?? e.type}`.
- Don't: put buttons in every row; a log is for reading.

## Customization

`label`, `emptyText` and the row content. Spacing and dividers come from tokens.

## Limitations

- No virtualization. The store caps activity at 500 entries by default.
- No grouping by agent; filter `entries` before passing them.

## Related

ToolCallDisclosure, AgentLanes, `selectActivity`.

## Evidence

`test/primitives-agent.test.mjs` (role, label, order and keys). No device acceptance yet.

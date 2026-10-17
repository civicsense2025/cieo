# Agent core

`cieo/agent` turns an agent host's ordered event log into state a UI can render. It has no DOM and no framework, and it is safe to import on the server. `cieo/agent/react` adds two hooks. The host keeps ownership of auth, commands and truth. Cieo only folds what the host reports.

```ts
import { createAgentStore, connectEventStream, selectPendingApprovals } from 'cieo/agent';
import { useAgentStore, useAgentStream } from 'cieo/agent/react';

const store = createAgentStore();
useAgentStream(store, { url: '/agents/events/stream', map: toAgentEvent }); // resumes from the store cursor
const pending = useAgentStore(store, selectPendingApprovals);
```

## Events

Every event shares one envelope:

```ts
{ v: 1, seq, at, runId, agentId, parentAgentId, type, data }
```

`seq` is the event's position in the host's log. The reducer applies each sequence once, in order.

| Type | `data` | View it changes |
| --- | --- | --- |
| `run.status` | `status`, `reason?` | run |
| `agent.status` | `status`, `name?`, `reason?`, `runStatus?` | agent (and run) |
| `message.delta` | `text`, `messageId?`, `mode?: 'replace'` | message (appends unless `replace`) |
| `message.complete` | `text`, `messageId?` | message (final text) |
| `tool.call` | `callId`, `name`, `phase: started \| finished \| failed`, `summary?`, `error?` | tool call |
| `approval.requested` | `approvalId`, `title?`, `detail?` | approval (pending) |
| `approval.resolved` | `approvalId`, `decision: approved \| denied \| expired` | approval |
| `draft.begin` / `update` / `cancel` / `complete` | `draftId`, `text?`, `anchor?`, `artifactId?` | anchored draft |
| `artifact.saved` | `artifactId`, `kind`, `title?` | artifact |
| `navigation` | `location` | agent location |
| `x.<ns>.<name>` | anything | activity only (payload kept) |

A delta without a `messageId` continues the agent's open message. After that message completes, the next delta starts a new one.

The status set is `starting`, `running`, `waiting`, `completed`, `stopped`, `failed`, `interrupted` and `disconnected`. The last five are settled.

## Guarantees

- **Order.** Sequences at or below the cursor are ignored, and the state object is returned unchanged.
- **Gaps.** In a contiguous log, a later sequence sets `gap` and applies nothing. `connectEventStream` then reconnects from the cursor. Pass `limits.contiguous: false` for a filtered stream.
- **Unknown input.** An unknown type or a malformed payload advances the cursor and increments `rejected`, so a newer host never stalls an older client. Frames without a valid envelope can't advance the cursor, so the store counts them in `dropped`.
- **No optimism.** An approval stays `pending` until the host sends `approval.resolved`. A repeated request never reopens a decision. Commands such as stop, approve and deny are host callbacks.
- **Bounded memory.** Activity is a ring (`maxActivity`, default 500). Text is capped (`maxTextChars`, default 20,000, with `truncated` set). Each map holds at most `maxEntities` entries (default 500) and evicts its oldest settled entry first.
- **Stable selectors.** Selectors cache on the identity of the map they read. Streaming text doesn't rebuild the approval list.

## Stream

`connectEventStream({ url, store, signal })` follows a server-sent event stream:
- It sets `?after=<cursor>` on every connect.
- It parses each `data:` frame as JSON, an object or an array.
- It passes frames through an optional `map` for a host-shaped log.
- It backs off with jitter, from `retry.initialMs` (500) up to `retry.maxMs` (15,000).
- It stops when `signal` aborts.

`EventSource`, timers and `random` can be injected for tests.

## Motion

Motion helpers also check the nearest `[data-reduced-motion="true"]` ancestor. A host can reduce motion for one subtree, such as a dialog with its own preference, while its siblings keep animating. A descendant can't opt back in.

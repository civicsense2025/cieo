# AgentStatus

A dot plus words that name an agent's or run's reported state.

## Use when

- A lane, header or row shows what an agent is doing right now.
- The status comes from the host (`AgentView.status` or `RunView.status` from `cieo/agent`).

## Avoid when

- You want to show a person's presence; use StatusDot or AvatarStatusDot.
- You only know what the user clicked, not what the host reported. Never pass a guessed status.

## Anatomy

`span.cieo.cieo-p-agent-status[data-status][data-tone]` holding a decorative StatusDot, an optional `[data-name]`, and `[data-label]` with the words.

## Behavior

No motion. Tones: starting and running are info; waiting is warning; completed is success; stopped is neutral; failed, interrupted and disconnected are danger. Default words: Starting, Working, Needs you, Done, Stopped, Failed, Interrupted, Disconnected.

## Keyboard / accessibility

- Not focusable and not a live region. The words carry the meaning; the dot is `aria-hidden`.
- Wrap it in your own `role="status"` region if a change must be announced.

## Do / don't

- Do: `<AgentStatus status={agent.status} name={agent.name} />`.
- Don't: pass a `label` that drops the state, such as "Agent".

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Eight statuses only, matching `cieo/agent`.
- No reason text; render `agent.reason` beside it if you need one.

## Related

StatusDot, AgentLanes, RunControls, `cieo/agent`.

## Evidence

`test/primitives-agent.test.mjs` (server render, tone and words for all eight statuses). No device acceptance yet.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.

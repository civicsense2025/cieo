# AgentLanes

One lane per agent, headed by its name and status, with child agents nested under their parent.

## Use when

- A run has several agents and you show them side by side or as a tree (`selectRunAgents`).

## Avoid when

- There is only one agent; render its lane content directly with an AgentStatus.

## Anatomy

`ul.cieo.cieo-p-agent-lanes[aria-label]` → `li[data-agent-id][data-depth][data-status]` → `section[aria-labelledby]` with a header (`[data-agent-name]`, AgentStatus), `[data-lane-body]` from `renderLane`, and a nested `ul` for child agents.

## Behavior

An agent nests under the agent named by `parentAgentId`. If that parent is not in the list, the agent starts a top-level lane. A loop in the parent chain is cut, so rendering always ends. No motion.

## Keyboard / accessibility

- Each lane is a section named by the agent's name (or id when it has none).
- Nesting is a real list structure, so depth is announced.

## Do / don't

- Do: keep `renderLane` light: the streaming message, a tool call list.
- Don't: hide a child agent's lane when it fails; its status says so.

## Customization

`label`, `statusLabel` (translate each lane's status words) and lane content. Indent and dividers from tokens; `data-depth` is there for your own styling.

## Limitations

- No collapsing or reordering.
- Order within a level follows the `agents` array.

## Related

AgentStatus, StreamingMessage, ToolCallDisclosure.

## Evidence

`test/primitives-agent.test.mjs` (nesting, orphan handling, cycle guard). No device acceptance yet.

## Host customization

`className` adds a class to the root without replacing the Cieo class. `slotProps` accepts named presentation parts: `root`, `lane`, `header`, `name`, `body`, `children`. Each part accepts `className`, `style`, `title`, and nonreserved `data-*` attributes. Roles, ARIA, refs, handlers, state attributes, and owned geometry remain component-owned. Existing content props and children remain the content slots.

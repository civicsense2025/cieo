// src/primitives/AgentLanes/AgentLanes.tsx
'use client';
/* AgentLanes. One lane per agent, headed by its name and reported status. A child agent nests inside its
   parent's lane; an agent whose parent is not in the list starts its own top-level lane. */
import { useId, type ReactNode } from 'react';
import type { AgentStatus as AgentStatusValue } from '../../agent/event.js';
import type { AgentView } from '../../agent/reduce.js';
import { AgentStatus } from '../AgentStatus/AgentStatus.js';

export interface AgentLanesProps {
  /** Agents to show, e.g. from selectRunAgents. Order is kept within each level. */
  agents: readonly AgentView[];
  /** The body of one lane, e.g. its streaming message and tool calls. */
  renderLane: (agent: AgentView) => ReactNode;
  /** Accessible name for the list. Defaults to "Agents". */
  label?: string;
  /** Words for a lane's status, e.g. a translation. Defaults to the English words. */
  statusLabel?: (status: AgentStatusValue) => string;
}

interface LaneProps {
  agent: AgentView;
  depth: number;
  tree: ReadonlyMap<string | null, readonly AgentView[]>;
  seen: ReadonlySet<string>;
  renderLane: (agent: AgentView) => ReactNode;
  statusLabel?: (status: AgentStatusValue) => string;
}

function Lane({ agent, depth, tree, seen, renderLane, statusLabel }: LaneProps) {
  const nameId = useId();
  const path = new Set(seen).add(agent.id);
  // A malformed host log could make an agent its own ancestor; the path guard stops that from recursing forever.
  const kids = (tree.get(agent.id) ?? []).filter((k) => !path.has(k.id));
  return (
    <li data-agent-id={agent.id} data-depth={depth} data-status={agent.status}>
      <section aria-labelledby={nameId}>
        <header>
          <span id={nameId} data-agent-name>{agent.name ?? agent.id}</span>
          <AgentStatus status={agent.status} label={statusLabel?.(agent.status)} />
        </header>
        <div data-lane-body>{renderLane(agent)}</div>
        {kids.length ? (
          <ul>
            {kids.map((k) => <Lane key={k.id} agent={k} depth={depth + 1} tree={tree} seen={path} renderLane={renderLane} statusLabel={statusLabel} />)}
          </ul>
        ) : null}
      </section>
    </li>
  );
}

export function AgentLanes({ agents, renderLane, label = 'Agents', statusLabel }: AgentLanesProps) {
  const ids = new Set(agents.map((a) => a.id));
  const tree = new Map<string | null, AgentView[]>();
  for (const agent of agents) {
    const parent = agent.parentAgentId && ids.has(agent.parentAgentId) && agent.parentAgentId !== agent.id ? agent.parentAgentId : null;
    const list = tree.get(parent);
    if (list) list.push(agent);
    else tree.set(parent, [agent]);
  }
  return (
    <ul className="cieo cieo-p-agent-lanes" aria-label={label}>
      {(tree.get(null) ?? []).map((a) => <Lane key={a.id} agent={a} depth={0} tree={tree} seen={new Set()} renderLane={renderLane} statusLabel={statusLabel} />)}
    </ul>
  );
}

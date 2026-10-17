import { type ReactNode } from 'react';
import type { AgentView } from '../../agent/reduce.js';
export interface AgentLanesProps {
    /** Agents to show, e.g. from selectRunAgents. Order is kept within each level. */
    agents: readonly AgentView[];
    /** The body of one lane, e.g. its streaming message and tool calls. */
    renderLane: (agent: AgentView) => ReactNode;
    /** Accessible name for the list. Defaults to "Agents". */
    label?: string;
}
export declare function AgentLanes({ agents, renderLane, label }: AgentLanesProps): import("react/jsx-runtime").JSX.Element;

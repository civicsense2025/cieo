import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
import type { AgentStatus as AgentStatusValue } from '../../agent/event.js';
import type { AgentView } from '../../agent/reduce.js';
export interface AgentLanesProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        lane?: PrimitivePartProps;
        header?: PrimitivePartProps;
        name?: PrimitivePartProps;
        body?: PrimitivePartProps;
        children?: PrimitivePartProps;
    };
    /** Agents to show, e.g. from selectRunAgents. Order is kept within each level. */
    agents: readonly AgentView[];
    /** The body of one lane, e.g. its streaming message and tool calls. */
    renderLane: (agent: AgentView) => ReactNode;
    /** Accessible name for the list. Defaults to "Agents". */
    label?: string;
    /** Words for a lane's status, e.g. a translation. Defaults to the English words. */
    statusLabel?: (status: AgentStatusValue) => string;
}
export declare function AgentLanes({ agents, renderLane, label, statusLabel, className, slotProps }: AgentLanesProps): import("react/jsx-runtime").JSX.Element;

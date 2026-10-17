import type { ReactNode } from 'react';
import type { ActivityEntry } from '../../agent/reduce.js';
export interface AgentActivityProps {
    /** Activity entries in log order, e.g. from selectActivity. */
    entries: readonly ActivityEntry[];
    /** Turns one entry into the row's content. Keep it short and plain. */
    describe: (entry: ActivityEntry) => ReactNode;
    /** Accessible name for the log. Defaults to "Agent activity". */
    label?: string;
    /** Shown as the only row while the log is empty. Optional. */
    emptyText?: string;
}
export declare function AgentActivity({ entries, describe, label, emptyText }: AgentActivityProps): import("react/jsx-runtime").JSX.Element;

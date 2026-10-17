// src/primitives/AgentActivity/AgentActivity.tsx
'use client';
/* AgentActivity. The ordered log of what an agent run did, one row per confirmed event. Rows appear only when the
   host's log contains them, so the list never runs ahead of the server. No motion. */
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

export function AgentActivity({ entries, describe, label = 'Agent activity', emptyText }: AgentActivityProps) {
  return (
    <ol className="cieo cieo-p-agent-activity" role="log" aria-label={label}>
      {entries.length === 0 && emptyText ? <li data-empty>{emptyText}</li> : null}
      {entries.map((entry) => (
        <li key={entry.seq} data-type={entry.type} data-seq={entry.seq}>
          {describe(entry)}
        </li>
      ))}
    </ol>
  );
}

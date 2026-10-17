// src/primitives/AgentStatus/AgentStatus.tsx
'use client';
/* AgentStatus. A dot plus words that name an agent's or run's reported state. Colour never carries the meaning
   alone: the visible text always says the state, and the dot is decorative. */
import type { AgentStatus as Status } from '../../agent/event.js';
import { StatusDot, type StatusDotStatus } from '../StatusDot/StatusDot.js';

/** Dot tone for each reported status. Settled failures read as danger; a plain stop is neutral. */
export const AGENT_STATUS_TONES: Readonly<Record<Status, StatusDotStatus>> = {
  starting: 'info',
  running: 'info',
  waiting: 'warning',
  completed: 'success',
  stopped: 'default',
  failed: 'danger',
  interrupted: 'danger',
  disconnected: 'danger',
};

/** Default words for each status. Pass `label` to localize or rephrase. */
export const AGENT_STATUS_WORDS: Readonly<Record<Status, string>> = {
  starting: 'Starting',
  running: 'Working',
  waiting: 'Needs you',
  completed: 'Done',
  stopped: 'Stopped',
  failed: 'Failed',
  interrupted: 'Interrupted',
  disconnected: 'Disconnected',
};

export interface AgentStatusProps {
  /** The status the host reported. Never a guess or an optimistic value. */
  status: Status;
  /** Words shown for the status. Overrides the default words; they must still name the state. */
  label?: string;
  /** Agent or run name shown before the status, e.g. "Researcher". Optional. */
  name?: string;
}

export function AgentStatus({ status, label, name }: AgentStatusProps) {
  const tone = AGENT_STATUS_TONES[status] ?? 'default';
  return (
    <span className="cieo cieo-p-agent-status" data-status={status} data-tone={tone}>
      <StatusDot status={tone} />
      {name ? <span data-name>{name}</span> : null}
      <span data-label>{label || AGENT_STATUS_WORDS[status] || status}</span>
    </span>
  );
}

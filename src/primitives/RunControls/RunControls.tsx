// src/primitives/RunControls/RunControls.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* RunControls. The run's reported status and a Stop command. Stop shows only while the run is not settled and the
   host passed a handler; while the stop is in flight it is disabled and spins, and the status stays what the host
   last reported. */
import type { RunView } from '../../agent/reduce.js';
import { isSettled } from '../../agent/event.js';
import { Button } from '../../controls/Button.js';
import { AgentStatus } from '../AgentStatus/AgentStatus.js';

export interface RunControlsProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** The run as the host reported it. */
  run: RunView;
  /** Sends the stop command to the host. Without it no Stop button renders. */
  onStop?: () => void;
  /** True while the stop command is in flight. */
  busy?: boolean;
  /** Stop button text. Defaults to "Stop". */
  stopLabel?: string;
  /** Accessible name for the group. Defaults to "Run controls". */
  label?: string;
  /** Words for the run's status, e.g. a translation. Defaults to the English words. */
  statusLabel?: (status: RunView['status']) => string;
}

export function RunControls({ className, slotProps, run, onStop, busy = false, stopLabel = 'Stop', label = 'Run controls', statusLabel }: RunControlsProps) {
  const live = !isSettled(run.status);
  return (
    <div className="cieo cieo-p-run-controls" role="group" aria-label={label} data-status={run.status} {...customizePart(slotProps?.root, "cieo cieo-p-run-controls", undefined, className)}>
      <AgentStatus status={run.status} label={statusLabel?.(run.status)} />
      {live && onStop ? (
        <Button variant="secondary" state={busy ? 'pending' : 'idle'} pendingLabel={`${stopLabel}: sending`} aria-disabled={busy || undefined} onClick={onStop}>
          {stopLabel}
        </Button>
      ) : null}
    </div>
  );
}

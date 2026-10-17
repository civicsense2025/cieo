// src/primitives/ToolCallDisclosure/ToolCallDisclosure.tsx
'use client';
/* ToolCallDisclosure. One tool call as a native details element: the summary names the tool and its reported
   phase, and the body holds the host's summary and, when it failed, the error. */
import type { ReactNode } from 'react';
import type { ToolCallView, ToolPhase } from '../../agent/reduce.js';
import { StatusDot, type StatusDotStatus } from '../StatusDot/StatusDot.js';

/** Words for each phase. */
export const TOOL_PHASE_WORDS: Readonly<Record<ToolPhase, string>> = { started: 'Running', finished: 'Done', failed: 'Failed' };
const TONES: Readonly<Record<ToolPhase, StatusDotStatus>> = { started: 'info', finished: 'success', failed: 'danger' };

export interface ToolCallDisclosureProps {
  /** The tool call as the host reported it. */
  call: ToolCallView;
  /** Extra body content after the summary and error, e.g. arguments or a result preview. Optional. */
  children?: ReactNode;
}

export function ToolCallDisclosure({ call, children }: ToolCallDisclosureProps) {
  const failed = call.phase === 'failed';
  return (
    <details className="cieo cieo-p-tool-call-disclosure" data-phase={call.phase}>
      <summary>
        <StatusDot status={TONES[call.phase]} />
        <span data-name>{call.name}</span>
        <span data-phase-text>{TOOL_PHASE_WORDS[call.phase]}</span>
      </summary>
      <div data-body>
        {call.summary ? <p data-summary>{call.summary}</p> : null}
        {failed && call.error ? <p data-error>{call.error}</p> : null}
        {children}
      </div>
    </details>
  );
}

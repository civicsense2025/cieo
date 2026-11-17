// src/primitives/StepList/StepList.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* StepList. Twin of CieoUI StepList. */
export interface StepListStep { title: string; detail?: string }
export type StepState = 'done' | 'current' | 'upcoming';
export interface StepListProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  steps: StepListStep[];
  /** Index of the step in progress; earlier steps are done. */
  current: number;
  nextLabel?: string;
  /** Spoken after a finished step. */
  doneLabel?: string;
  /** Spoken before each step, such as "Step 2 of 4". */
  stepLabel?: (n: number, total: number) => string;
}
/** Clamps the current step into the list, so a stale index never marks everything done. */
export function stepState(index: number, current: number, count: number): StepState {
  const c = Math.min(Math.max(0, Number.isFinite(current) ? current : 0), Math.max(0, count - 1));
  return index < c ? 'done' : index === c ? 'current' : 'upcoming';
}
export function StepList({ className, slotProps, steps, current, nextLabel = 'next', doneLabel = 'done', stepLabel = (n, total) => `Step ${n} of ${total}` }: StepListProps) {
  return (
    <ol {...customizePart(slotProps?.root, "cieo cieo-p-step-list", undefined, className)}>
      {steps.map((s, i) => {
        const state = stepState(i, current, steps.length);
        return (
          <li key={i} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="cieo-p-step-list__n" aria-hidden="true">{state === 'done' ? '✓' : i + 1}</span>
            <b><span className="cieo-sr-only">{stepLabel(i + 1, steps.length)}, </span>{s.title}{state === 'current' ? <span className="cieo-p-step-list__next"> · {nextLabel}</span> : null}</b>
            {state === 'done' ? <span className="cieo-sr-only">, {doneLabel}</span> : null}
            {s.detail ? <span className="cieo-p-step-list__detail">{s.detail}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

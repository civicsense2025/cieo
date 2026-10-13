// src/primitives/Step/Step.tsx
'use client';
/* Step. Custom step item for hand-built steppers; host orders and names steps. */
import type { ReactNode } from 'react';

export interface StepProps {
  /** Step state. Defaults to todo. */
  state?: 'done' | 'current' | 'todo';
  children: ReactNode;
}

export function Step({ state = 'todo', children }: StepProps) {
  return (
    <li data-state={state} aria-current={state === 'current' ? 'step' : undefined} className="cieo cieo-step">
      {children}
    </li>
  );
}

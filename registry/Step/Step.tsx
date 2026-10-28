// src/primitives/Step/Step.tsx
'use client';
/* Step. Custom step item for hand-built steppers; host orders and names steps. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface StepProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Step state. Defaults to todo. */
  state?: 'done' | 'current' | 'todo';
  children: ReactNode;
}

export function Step({ className, slotProps, state = 'todo', children }: StepProps) {
  return (
    <li data-state={state} aria-current={state === 'current' ? 'step' : undefined} className="cieo cieo-step" {...customizePart(slotProps?.root, "cieo cieo-step", undefined, className)}>
      {children}
    </li>
  );
}

// src/primitives/Stepper/Stepper.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Stepper. Progress steps rendered from an array; pure render, host owns advancement. */

export interface StepperStep {
  label: string;
  state: 'done' | 'current' | 'todo';
}

export interface StepperProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the progress nav. Required. */
  label: string;
  /** Steps in order; exactly one should be current. Required. */
  steps: StepperStep[];
}

export function Stepper({ className, slotProps, label, steps }: StepperProps) {
  return (
    <nav aria-label={label} className="cieo cieo-stepper" {...customizePart(slotProps?.root, "cieo cieo-stepper", undefined, className)}>
      <ol>
        {steps.map((step, i) => (
          <li key={`${i}-${step.label}`} data-state={step.state} aria-current={step.state === 'current' ? 'step' : undefined}>
            {step.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// src/primitives/NumberedSteps/NumberedSteps.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* NumberedSteps. Twin of CieoUI NumberedSteps. */
export interface NumberedStep { title: string; detail?: string }
export interface NumberedStepsProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  steps: NumberedStep[];
}
export function NumberedSteps({ className, slotProps, steps }: NumberedStepsProps) {
  return (<ol {...customizePart(slotProps?.root, "cieo cieo-p-numbered-steps", undefined, className)}>{steps.map((s, i) => <li key={i}><span aria-hidden="true">{i + 1}</span><b>{s.title}</b>{s.detail ? <small>{s.detail}</small> : null}</li>)}</ol>);
}

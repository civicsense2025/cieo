// src/primitives/EmptyState/EmptyState.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* EmptyState. Centered no-results message with an optional action. Host owns the action. */
import type { ReactNode } from 'react';
export interface EmptyStateProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; title?: PrimitivePartProps; description?: PrimitivePartProps; action?: PrimitivePartProps };

  /** Headline naming the empty situation. Required. */
  title: string;
  slots?: { icon?: ReactNode; title?: ReactNode; description?: ReactNode; action?: ReactNode };
  /** One line of next-step guidance. Omit when the title says it all. */
  description?: string;
  /** The recovery action (button or link). */
  children: ReactNode;
}

export function EmptyState({ className, slotProps, slots, title, description, children }: EmptyStateProps) {
  return (
    <div className="cieo cieo-p-empty-state" {...customizePart(slotProps?.root, "cieo cieo-p-empty-state", undefined, className)}>
      {slots?.icon}
      <h2 className="cieo-p-empty-state-title" {...customizePart(slotProps?.title, "cieo-p-empty-state-title")}>{slots?.title ?? title}</h2>
      {description || slots?.description ? <p className="cieo-p-empty-state-description" {...customizePart(slotProps?.description, "cieo-p-empty-state-description")}>{slots?.description ?? description}</p> : null}
      <div className="cieo-p-empty-state-action" {...customizePart(slotProps?.action, "cieo-p-empty-state-action")}>{slots?.action ?? children}</div>
    </div>
  );
}

// src/primitives/EmptyState/EmptyState.tsx
'use client';
/* EmptyState. Centered no-results message with an optional action. Host owns the action. */
import type { ReactNode } from 'react';
export interface EmptyStateProps {
  /** Headline naming the empty situation. Required. */
  title: string;
  /** One line of next-step guidance. Omit when the title says it all. */
  description?: string;
  /** The recovery action (button or link). */
  children: ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="cieo cieo-p-empty-state">
      <h2 className="cieo-p-empty-state-title">{title}</h2>
      {description ? <p className="cieo-p-empty-state-description">{description}</p> : null}
      <div className="cieo-p-empty-state-action">{children}</div>
    </div>
  );
}

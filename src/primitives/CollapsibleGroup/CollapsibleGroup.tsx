'use client';
/* CollapsibleGroup. role=group accordion shell. Host coordinates exclusive open by passing open/onOpenChange per Collapsible child. */
import type { ReactNode } from 'react';

export interface CollapsibleGroupProps {
  /** Accessible name for the group. Required. */
  label: string;
  /** Collapsible children. Required. */
  children: ReactNode;
}

export function CollapsibleGroup({ label, children }: CollapsibleGroupProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-collapsible-group">
      {children}
    </div>
  );
}

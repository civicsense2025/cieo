'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* CollapsibleGroup. role=group accordion shell. Host coordinates exclusive open by passing open/onOpenChange per Collapsible child. */
import type { ReactNode } from 'react';

export interface CollapsibleGroupProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the group. Required. */
  label: string;
  /** Collapsible children. Required. */
  children: ReactNode;
}

export function CollapsibleGroup({ className, slotProps, label, children }: CollapsibleGroupProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-collapsible-group" {...customizePart(slotProps?.root, "cieo cieo-collapsible-group", undefined, className)}>
      {children}
    </div>
  );
}

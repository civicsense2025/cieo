'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
// src/primitives/CheckboxList/CheckboxList.tsx
/* CheckboxList. Labels a group of related checkboxes with one shared group name. Host supplies real Checkbox items; this owns layout + grouping semantics only. */
import type { ReactNode } from 'react';

export interface CheckboxListProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the group (e.g. "Notification channels"). Required. */
  label: string;
  children: ReactNode;
}

export function CheckboxList({ className, slotProps, label, children }: CheckboxListProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-p-checkbox-list" {...customizePart(slotProps?.root, "cieo cieo-p-checkbox-list", undefined, className)}>
      {children}
    </div>
  );
}

'use client';
// src/primitives/CheckboxList/CheckboxList.tsx
/* CheckboxList. Labels a group of related checkboxes with one shared group name. Host supplies real Checkbox items; this owns layout + grouping semantics only. */
import type { ReactNode } from 'react';

export interface CheckboxListProps {
  /** Accessible name for the group (e.g. "Notification channels"). Required. */
  label: string;
  children: ReactNode;
}

export function CheckboxList({ label, children }: CheckboxListProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-p-checkbox-list">
      {children}
    </div>
  );
}

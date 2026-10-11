'use client';
// src/primitives/RadioList/RadioList.tsx
/* RadioList. Labels a single-choice group of radios with one shared group name. Host supplies real Radio items; this owns layout + radiogroup semantics only. */
import type { ReactNode } from 'react';

export interface RadioListProps {
  /** Accessible name for the group (e.g. "Delivery speed"). Required. */
  label: string;
  children: ReactNode;
}

export function RadioList({ label, children }: RadioListProps) {
  return (
    <div role="radiogroup" aria-label={label} className="cieo cieo-p-radio-list">
      {children}
    </div>
  );
}

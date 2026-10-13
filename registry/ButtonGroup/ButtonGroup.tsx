// src/primitives/ButtonGroup/ButtonGroup.tsx
'use client';
/* ButtonGroup. Joins related buttons into one connected control. Host supplies real buttons; this owns layout + grouping semantics only. */
import type { ReactNode } from 'react';

export interface ButtonGroupProps {
  /** Accessible name for the group (e.g. "Clipboard actions"). Required. */
  label: string;
  /** Layout direction. Defaults to horizontal. */
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
}

export function ButtonGroup({ label, orientation = 'horizontal', children }: ButtonGroupProps) {
  return (
    <div role="group" aria-label={label} data-orientation={orientation} className="cieo cieo-button-group">
      {children}
    </div>
  );
}

// src/primitives/ButtonGroup/ButtonGroup.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ButtonGroup. Joins related buttons into one connected control. Host supplies real buttons; this owns layout + grouping semantics only. */
import type { ReactNode } from 'react';

export interface ButtonGroupProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the group (e.g. "Clipboard actions"). Required. */
  label: string;
  /** Layout direction. Defaults to horizontal. */
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
}

export function ButtonGroup({ className, slotProps, label, orientation = 'horizontal', children }: ButtonGroupProps) {
  return (
    <div role="group" aria-label={label} data-orientation={orientation} className="cieo cieo-button-group" {...customizePart(slotProps?.root, "cieo cieo-button-group", undefined, className)}>
      {children}
    </div>
  );
}

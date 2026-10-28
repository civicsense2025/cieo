// src/primitives/Timestamp/Timestamp.tsx
'use client';
/* Timestamp. Machine-readable time with human-readable children. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface TimestampProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Machine-readable instant (ISO 8601). Required. */
  dateTime: string;
  /** Human-readable rendering of the instant. */
  children: ReactNode;
}

export function Timestamp({ className, slotProps, dateTime, children }: TimestampProps) {
  return (
    <time dateTime={dateTime} className="cieo cieo-p-timestamp" {...customizePart(slotProps?.root, "cieo cieo-p-timestamp", undefined, className)}>
      {children}
    </time>
  );
}

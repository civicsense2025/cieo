// src/primitives/Timestamp/Timestamp.tsx
'use client';
/* Timestamp. Machine-readable time with human-readable children. */
import type { ReactNode } from 'react';
export interface TimestampProps {
  /** Machine-readable instant (ISO 8601). Required. */
  dateTime: string;
  /** Human-readable rendering of the instant. */
  children: ReactNode;
}

export function Timestamp({ dateTime, children }: TimestampProps) {
  return (
    <time dateTime={dateTime} className="cieo cieo-p-timestamp">
      {children}
    </time>
  );
}

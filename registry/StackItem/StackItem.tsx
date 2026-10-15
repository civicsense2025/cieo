// src/primitives/StackItem/StackItem.tsx
'use client';
/* StackItem. Flex item with optional growth. Lives inside HStack or VStack; this owns the share only. */
import type { ReactNode } from 'react';

export interface StackItemProps {
  /** Grow to fill free space. Defaults to false. */
  grow?: boolean;
  children: ReactNode;
}

export function StackItem({ grow = false, children }: StackItemProps) {
  return (
    <div data-grow={grow} className="cieo cieo-stack-item">
      {children}
    </div>
  );
}

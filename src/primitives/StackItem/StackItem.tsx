// src/primitives/StackItem/StackItem.tsx
'use client';
/* StackItem. Flex item with optional growth. Lives inside HStack or VStack; this owns the share only. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface StackItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Grow to fill free space. Defaults to false. */
  grow?: boolean;
  children: ReactNode;
}

export function StackItem({ className, slotProps, grow = false, children }: StackItemProps) {
  return (
    <div data-grow={grow} className="cieo cieo-stack-item" {...customizePart(slotProps?.root, "cieo cieo-stack-item", undefined, className)}>
      {children}
    </div>
  );
}

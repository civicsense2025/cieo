// src/primitives/TopicChip/TopicChip.tsx
'use client';
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TopicChip. Accent dot and a topic in sentence case; replaces uppercase eyebrow labels. */
export interface TopicChipProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Colour for the dot, for a chip on a dark or photo ground. Defaults to the accent. */
  dot?: string;
  children: ReactNode;
}
export function TopicChip({ className, slotProps, dot, children }: TopicChipProps) {
  return (<span {...customizePart(slotProps?.root, "cieo cieo-p-topic-chip", undefined, className)} style={dot ? { ['--cieo-topic-dot' as string]: dot } : undefined}>{children}</span>);
}

// src/primitives/TopicChip/TopicChip.tsx
'use client';
import type { CSSProperties, ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TopicChip. Accent dot and a topic in sentence case; replaces uppercase eyebrow labels. */
export interface TopicChipProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Color for the dot, for a chip on a dark or photo ground. Defaults to the accent. */
  dot?: string;
  children: ReactNode;
}
export function TopicChip({ className, slotProps, dot, children }: TopicChipProps) {
  const ownedStyle = dot ? ({ '--cieo-topic-dot': dot } as CSSProperties) : undefined;
  return (<span className="cieo cieo-p-topic-chip" style={ownedStyle} {...customizePart(slotProps?.root, "cieo cieo-p-topic-chip", ownedStyle, className)}>{children}</span>);
}

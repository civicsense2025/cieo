'use client';
/* Stack. Vertical rhythm for grouped content: one gap between every child. For cards and rows, not page grids. */
import type { ReactNode } from 'react';
export interface StackProps { gap?: 'sm' | 'md' | 'lg'; children: ReactNode; }
export function Stack({ gap = 'md', children }: StackProps) {
  return (<div data-gap={gap} className="cieo cieo-p-stack">{children}</div>);
}

// src/primitives/FormLayout/FormLayout.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* FormLayout. Field grid for forms: one gap between every field, columns on wide screens. The host <form> owns semantics; this owns the grid only. */
import type { ReactNode } from 'react';

export interface FormLayoutProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Column count (1-4). Defaults to 1. */
  columns?: number;
  children: ReactNode;
}

export function FormLayout({ className, slotProps, columns = 1, children }: FormLayoutProps) {
  return (
    <div data-columns={columns} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} className="cieo cieo-form-layout" {...customizePart(slotProps?.root, "cieo cieo-form-layout", { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }, className)}>
      {children}
    </div>
  );
}

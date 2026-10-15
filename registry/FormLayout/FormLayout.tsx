// src/primitives/FormLayout/FormLayout.tsx
'use client';
/* FormLayout. Field grid for forms: one gap between every field, columns on wide screens. The host <form> owns semantics; this owns the grid only. */
import type { ReactNode } from 'react';

export interface FormLayoutProps {
  /** Column count (1-4). Defaults to 1. */
  columns?: number;
  children: ReactNode;
}

export function FormLayout({ columns = 1, children }: FormLayoutProps) {
  return (
    <div data-columns={columns} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} className="cieo cieo-form-layout">
      {children}
    </div>
  );
}

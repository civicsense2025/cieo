// src/primitives/Layout/Layout.tsx
'use client';
/* Layout. App frame: header, content, footer in rows. Compose with LayoutHeader, LayoutContent, LayoutFooter; this owns the frame only. */
import type { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="cieo cieo-layout">
      {children}
    </div>
  );
}

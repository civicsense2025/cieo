// src/primitives/Kbd/Kbd.tsx
'use client';
/* Kbd. One keyboard key or shortcut chord. Host supplies key names as children. */
import type { ReactNode } from 'react';
export interface KbdProps {
  /** Key names (e.g. ⌘, K). One chord per Kbd. */
  children: ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return <kbd className="cieo cieo-p-kbd">{children}</kbd>;
}

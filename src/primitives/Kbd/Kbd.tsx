// src/primitives/Kbd/Kbd.tsx
'use client';
/* Kbd. One keyboard key or shortcut chord. Host supplies key names as children. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface KbdProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Key names (e.g. ⌘, K). One chord per Kbd. */
  children: ReactNode;
}

export function Kbd({ className, slotProps, children }: KbdProps) {
  return <kbd className="cieo cieo-p-kbd" {...customizePart(slotProps?.root, "cieo cieo-p-kbd", undefined, className)}>{children}</kbd>;
}

// src/primitives/BottomSheet/BottomSheet.tsx
'use client';
/* BottomSheet. Bottom-anchored dialog over a scrim. Renders null when closed; host owns open state. */
import type { KeyboardEvent, ReactNode } from 'react';
import { Overlay } from '../Overlay/Overlay.js';

export interface BottomSheetProps {
  /** Accessible name for the sheet (e.g. "Share options"). Required. */
  label: string;
  /** Whether the sheet is open. Renders null when false or omitted. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  children: ReactNode;
}

export function BottomSheet({ label, open, onClose, children }: BottomSheetProps) {
  if (!open) return null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose?.();
  };
  return (
    <>
      <Overlay />
      <div role="dialog" aria-modal="true" aria-label={label} data-side="bottom" onKeyDown={onKeyDown} className="cieo cieo-bottom-sheet">
        {children}
      </div>
    </>
  );
}

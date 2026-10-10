// src/primitives/Dialog/Dialog.tsx
'use client';
/* Dialog. Controlled modal panel over a scrim. Renders null when closed; host owns open state. */
import type { KeyboardEvent, ReactNode } from 'react';
import { Overlay } from '../Overlay/Overlay.js';

export interface DialogProps {
  /** Accessible name for the dialog (e.g. "Rename file"). Required. */
  label: string;
  /** Whether the dialog is open. Renders null when false or omitted. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  children: ReactNode;
}

export function Dialog({ label, open, onClose, children }: DialogProps) {
  if (!open) return null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose?.();
  };
  return (
    <>
      <Overlay />
      <div role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKeyDown} className="cieo cieo-dialog">
        {children}
      </div>
    </>
  );
}

// src/primitives/AlertDialog/AlertDialog.tsx
'use client';
/* AlertDialog. Dialog wrapper that marks urgent content with alertdialog semantics. Renders null when closed. */
import type { ReactNode } from 'react';
import { Dialog } from '../Dialog/Dialog.js';

export interface AlertDialogProps {
  /** Accessible name for the alert (e.g. "Delete conversation"). Required. */
  label: string;
  /** Whether the alert is open. Renders null when false or omitted. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  children: ReactNode;
}

export function AlertDialog({ label, open, onClose, children }: AlertDialogProps) {
  if (!open) return null;
  return (
    <Dialog label={label} open={open} onClose={onClose}>
      <div role="alertdialog" aria-label={label} className="cieo cieo-alert-dialog">
        {children}
      </div>
    </Dialog>
  );
}

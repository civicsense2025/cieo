// src/primitives/AlertDialog/AlertDialog.tsx
'use client';
/* AlertDialog. Dialog with alertdialog semantics for urgent content. Scrim press does not dismiss; Escape does. */
import type { ReactNode } from 'react';
import { Dialog } from '../Dialog/Dialog.js';

export interface AlertDialogProps {
  /** Accessible name for the alert (e.g. "Delete conversation"). Required. */
  label: string;
  /** Whether the alert is open. Plays the exit before unmounting when closed. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  children: ReactNode;
}

export function AlertDialog({ label, open, onClose, children }: AlertDialogProps) {
  return (
    <Dialog label={label} role="alertdialog" open={open} onClose={onClose} dismissOnOutsidePress={false}>
      <div className="cieo cieo-alert-dialog">
        {children}
      </div>
    </Dialog>
  );
}

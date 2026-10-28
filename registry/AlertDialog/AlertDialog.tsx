// src/primitives/AlertDialog/AlertDialog.tsx
'use client';
/* AlertDialog. Dialog with alertdialog semantics for urgent content. Scrim press does not dismiss; Escape does. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';
import { Dialog } from '../Dialog/Dialog.js';

export interface AlertDialogProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; content?: PrimitivePartProps };
  /** Accessible name for the alert (e.g. "Delete conversation"). Required. */
  label: string;
  /** Whether the alert is open. Plays the exit before unmounting when closed. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  children: ReactNode;
}

export function AlertDialog({ label, open, onClose, children, className, slotProps }: AlertDialogProps) {
  return (
    <Dialog label={label} role="alertdialog" open={open} onClose={onClose} dismissOnOutsidePress={false} className={className} slotProps={{ root: slotProps?.root }}>
      <div className="cieo cieo-alert-dialog" {...customizePart(slotProps?.content, "cieo cieo-alert-dialog")}>
        {children}
      </div>
    </Dialog>
  );
}

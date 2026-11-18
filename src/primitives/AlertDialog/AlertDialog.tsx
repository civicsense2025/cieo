// src/primitives/AlertDialog/AlertDialog.tsx
'use client';
/* AlertDialog. Dialog with alertdialog semantics for urgent content and controllable open state. Scrim press does not dismiss; Escape does. */
import type { ReactNode } from 'react';
import { useControllableState } from '../../state/react.js';
import { Dialog } from '../Dialog/Dialog.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface AlertDialogProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; content?: PrimitivePartProps };
  /** Accessible name for the alert (e.g. "Delete conversation"). Required. */
  label: string;
  /** Whether the alert is open when controlled. Plays the exit before unmounting when closed. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  children: ReactNode;
}

export function AlertDialog({
  label,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onClose,
  children,
  className,
  slotProps,
}: AlertDialogProps) {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const handleClose =
    onClose !== undefined || onOpenChange !== undefined || openProp === undefined
      ? () => {
          setOpen(false);
          onClose?.();
        }
      : undefined;

  return (
    <Dialog
      label={label}
      role="alertdialog"
      open={open}
      onClose={handleClose}
      dismissOnOutsidePress={false}
      className={className}
      slotProps={{ root: slotProps?.root }}
    >
      <div className="cieo cieo-alert-dialog" {...customizePart(slotProps?.content, 'cieo cieo-alert-dialog')}>
        {children}
      </div>
    </Dialog>
  );
}

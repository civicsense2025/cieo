'use client';
/* Dialog. Modal panel over a scrim with controllable open state and spring enter/exit presence. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';
import { useDismiss, useModalFocus, usePresence } from '../../react/index.js';
import { useControllableState } from '../../state/react.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface DialogProps extends MotionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name for the dialog (e.g. "Rename file"). Required. */
  label: string;
  /** Whether the dialog is open when controlled. Plays exit before unmounting when closed. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** Called on Escape, scrim press or host close affordances. Optional. */
  onClose?: () => void;
  /** Whether pressing the scrim calls onClose. Defaults to true. */
  dismissOnOutsidePress?: boolean;
  /** Dialog role; use alertdialog for urgent confirmations. Defaults to dialog. */
  role?: 'dialog' | 'alertdialog';
  children: ReactNode;
}

const ORIGINS = {
  fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  rise: { x: 0, y: 4, scale: 1, opacity: 0, blur: 0 },
  scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
} as const;

export function Dialog({
  label,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onClose: onCloseProp,
  dismissOnOutsidePress = true,
  role = 'dialog',
  children,
  motion,
  entering = 'rise',
  exiting = 'rise',
  className,
  slotProps,
}: DialogProps) {
  const [openState, setOpenState] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const open = openProp !== undefined ? openProp : openState;
  const onClose =
    onCloseProp !== undefined || onOpenChange !== undefined || openProp === undefined
      ? () => {
          setOpenState(false);
          onCloseProp?.();
        }
      : undefined;

  const enterOrigin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const exitOrigin = exiting === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : exiting === 'fade' ? ORIGINS.fade : exiting === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const origin = (open ?? false) ? enterOrigin : exitOrigin;
  const { mounted, ref } = usePresence<HTMLDivElement>(open ?? false, { disabled: motion === false, from: origin });
  const onTab = useModalFocus(open ?? false, ref);
  useDismiss(open ?? false, () => onClose?.(), [ref], { outside: false });
  if (!mounted) return null;
  return (
    <>
      <Overlay onPress={dismissOnOutsidePress ? onClose : undefined} />
      <div
        ref={ref}
        role={role}
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={onTab}
        className="cieo cieo-dialog"
        {...motionAttrs({ motion })}
        {...customizePart(slotProps?.root, 'cieo cieo-dialog', undefined, className)}
      >
        {children}
      </div>
    </>
  );
}

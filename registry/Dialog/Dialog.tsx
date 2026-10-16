'use client';
/* Dialog. Controlled modal panel over a scrim. Springs in on open; plays the exit spring before unmounting on close. Host owns open state. */
import { useRef, type ReactNode } from 'react';
import { useDismiss, useModalFocus, usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs, type MotionProps } from '../motion.js';
export interface DialogProps extends MotionProps {
  /** Accessible name for the dialog (e.g. "Rename file"). Required. */
  label: string;
  /** Whether the dialog is open. Plays exit before unmounting when closed. */
  open?: boolean;
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
export function Dialog({ label, open, onClose, dismissOnOutsidePress = true, role = 'dialog', children, motion, entering = 'rise', exiting = 'rise' }: DialogProps) {
  const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const { mounted, ref } = usePresence<HTMLDivElement>(open ?? false, { disabled: motion === false, from: origin });
  const onTab = useModalFocus(open ?? false, ref);
  useDismiss(open ?? false, () => onClose?.(), [ref], { outside: false });
  if (!mounted) return null;
  void exiting;
  return (<><Overlay onPress={dismissOnOutsidePress ? onClose : undefined} /><div ref={ref} role={role} aria-modal="true" aria-label={label} tabIndex={-1} onKeyDown={onTab} className="cieo cieo-dialog" {...motionAttrs({ motion, entering, exiting })}>{children}</div></>);
}

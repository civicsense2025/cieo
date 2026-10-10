'use client';
/* Dialog. Controlled modal panel over a scrim. Springs in on open; plays the exit spring before unmounting on close. Host owns open state. */
import type { KeyboardEvent, ReactNode } from 'react';
import { usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs, type MotionProps } from '../motion.js';
export interface DialogProps extends MotionProps {
  /** Accessible name for the dialog (e.g. "Rename file"). Required. */
  label: string;
  /** Whether the dialog is open. Plays exit before unmounting when closed. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  children: ReactNode;
}
const ORIGINS = {
  fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  rise: { x: 0, y: 4, scale: 1, opacity: 0, blur: 0 },
  scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
} as const;
export function Dialog({ label, open, onClose, children, motion, entering = 'rise', exiting = 'rise' }: DialogProps) {
  const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const { mounted, ref } = usePresence<HTMLDivElement>(open ?? false, { disabled: motion === false, from: origin });
  if (!mounted) return null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Escape') onClose?.(); };
  void exiting;
  return (<><Overlay /><div ref={ref} role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKeyDown} className="cieo cieo-dialog" {...motionAttrs({ motion, entering, exiting })}>{children}</div></>);
}

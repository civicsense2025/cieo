'use client';
/* BottomSheet. Bottom-anchored dialog over a scrim. Springs in on open; plays the exit spring before unmounting on close. Host owns open state. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import { useRef, type ReactNode } from 'react';
import { useDismiss, useModalFocus, usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface BottomSheetProps extends MotionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name for the sheet (e.g. "Share options"). Required. */
  label: string;
  /** Whether the sheet is open. Plays exit before unmounting when closed. */
  open?: boolean;
  /** Called on Escape, scrim press or host close affordances. Optional. */
  onClose?: () => void;
  /** Whether pressing the scrim calls onClose. Defaults to true. */
  dismissOnOutsidePress?: boolean;
  children: ReactNode;
}

const ORIGINS = {
  fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  rise: { x: 0, y: 4, scale: 1, opacity: 0, blur: 0 },
  scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
} as const;

export function BottomSheet({ label, open, onClose, dismissOnOutsidePress = true, children, motion, entering = 'rise', exiting = 'rise', className, slotProps }: BottomSheetProps) {
  const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const { mounted, ref } = usePresence<HTMLDivElement>(open ?? false, { disabled: motion === false, from: origin });
  const onTab = useModalFocus(open ?? false, ref);
  useDismiss(open ?? false, () => onClose?.(), [ref], { outside: false });
  if (!mounted) return null;
  void exiting;
  return (<><Overlay onPress={dismissOnOutsidePress ? onClose : undefined} /><div ref={ref} role="dialog" aria-modal="true" aria-label={label} data-side="bottom" tabIndex={-1} onKeyDown={onTab} className="cieo cieo-bottom-sheet" {...motionAttrs({ motion, entering, exiting })} {...customizePart(slotProps?.root, "cieo cieo-bottom-sheet", undefined, className)}>{children}</div></>);
}

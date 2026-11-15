'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Toast. Transient status notice with auto-dismiss and an optional action. Host owns open state; closing plays the
   exit spring before unmounting. Reduced motion shows and hides the end state. */
import { useEffect, useRef, type ReactNode } from 'react';
import { useDismiss, usePresence } from '../../react/index.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps extends MotionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; message?: PrimitivePartProps; action?: PrimitivePartProps; dismiss?: PrimitivePartProps };

  /** Notice text. Required. */
  message: string;
  /** Severity. Danger and warning announce as alerts. Defaults to info. */
  tone?: ToastTone;
  /** Whether the toast is shown. Plays the exit spring before unmounting when closed. Defaults to true. */
  open?: boolean;
  /** Called on auto-dismiss timeout, Escape, or the dismiss button. Host closes by setting open. */
  onDone?: () => void;
  /** Auto-dismiss delay in ms. Defaults to 5000. Zero or negative disables the timer. */
  duration?: number;
  /** Accessible name for the dismiss button. Defaults to Dismiss. */
  dismissLabel?: string;
  /** Recovery or undo action rendered after the message. */
  children?: ReactNode;
}

export function Toast({ className, slotProps, message, tone = 'info', open = true, onDone, duration = 5000, dismissLabel = 'Dismiss', children, motion, entering = 'rise', exiting = 'rise' }: ToastProps) {
  const { mounted, ref } = usePresence<HTMLDivElement>(open, { disabled: motion === false });
  const done = useRef(onDone);
  done.current = onDone;
  useDismiss(open, () => done.current?.(), [ref], { outside: false });
  useEffect(() => {
    if (!open || duration <= 0) return;
    const id = setTimeout(() => done.current?.(), duration);
    return () => clearTimeout(id);
  }, [open, duration, message]);
  void exiting;
  if (!mounted) return null;
  return (
    <div
      ref={ref}
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      data-tone={tone}
      className="cieo cieo-toast"
      {...motionAttrs({ motion, entering, exiting })}
      {...customizePart(slotProps?.root, "cieo cieo-toast", undefined, className)}
    >
      <p className="cieo-toast-message" {...customizePart(slotProps?.message, "cieo-toast-message", undefined)}>{message}</p>
      {children ? <div className="cieo-toast-action" {...customizePart(slotProps?.action, "cieo-toast-action", undefined)}>{children}</div> : null}
      <button type="button" aria-label={dismissLabel} className="cieo-toast-dismiss" onClick={() => done.current?.()} {...customizePart(slotProps?.dismiss, "cieo-toast-dismiss", undefined)}>×</button>
    </div>
  );
}

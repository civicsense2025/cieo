'use client';
/* Toast. Transient status notice with auto-dismiss, hover/focus pause, controllable open state, and spring exit presence. */
import { useEffect, useRef, type ReactNode } from 'react';
import { useDismiss, usePresence } from '../../react/index.js';
import { useControllableState } from '../../state/react.js';
import { motionAttrs, type MotionProps } from '../motion.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

/** Pauseable auto-dismiss deadline. Pure math; the component owns the setTimeout. */
export interface ToastDeadline {
  /** ms left when paused; the armed duration when running. */
  remaining: number;
  /** Epoch ms the running timer fires, or null when paused or disabled. */
  firesAt: number | null;
}
/** Starts (or restarts) the deadline for a duration at now. Non-positive durations never fire. */
export function startToastDeadline(duration: number, now: number): ToastDeadline {
  return duration > 0 ? { remaining: duration, firesAt: now + duration } : { remaining: 0, firesAt: null };
}
/** Freezes a running deadline at now; the returned remaining resumes it later. Idles pass through. */
export function pauseToastDeadline(state: ToastDeadline, now: number): ToastDeadline {
  if (state.firesAt === null) return state;
  return { remaining: Math.max(0, state.firesAt - now), firesAt: null };
}
/** ms to arm when resuming a paused deadline; 0 means no timer. */
export function resumeToastDelay(state: ToastDeadline): number {
  return state.firesAt === null ? state.remaining : 0;
}

export interface ToastProps extends MotionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; message?: PrimitivePartProps; action?: PrimitivePartProps; dismiss?: PrimitivePartProps };
  /** Notice text. Required. */
  message: string;
  /** Severity. Danger and warning announce as alerts. Defaults to info. */
  tone?: ToastTone;
  /** Whether the toast is shown when controlled. Plays the exit spring before unmounting when closed. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to true. */
  defaultOpen?: boolean;
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** Called on auto-dismiss timeout, Escape, or the dismiss button. */
  onDone?: () => void;
  /** Auto-dismiss delay in ms. Defaults to 5000. Zero or negative disables the timer. */
  duration?: number;
  /** Accessible name for the dismiss button. Defaults to Dismiss. */
  dismissLabel?: string;
  /** Recovery or undo action rendered after the message. */
  children?: ReactNode;
}

const ORIGINS = {
  fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  rise: { x: 0, y: 4, scale: 1, opacity: 0, blur: 0 },
  scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
} as const;

export function Toast({
  className,
  slotProps,
  message,
  tone = 'info',
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  onDone,
  duration = 5000,
  dismissLabel = 'Dismiss',
  children,
  motion,
  entering = 'rise',
  exiting = 'rise',
}: ToastProps) {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const enterOrigin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const exitOrigin = exiting === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : exiting === 'fade' ? ORIGINS.fade : exiting === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const origin = open ? enterOrigin : exitOrigin;
  const { mounted, ref } = usePresence<HTMLDivElement>(open, { disabled: motion === false, from: origin });
  const done = useRef<() => void>(() => {});
  done.current = () => {
    setOpen(false);
    onDone?.();
  };
  useDismiss(open, () => done.current(), [ref], { outside: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadline = useRef<ToastDeadline>(startToastDeadline(duration, Date.now()));
  function clearTimer() {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }
  function arm(ms: number) {
    clearTimer();
    if (ms <= 0 || !open) {
      deadline.current = { remaining: 0, firesAt: null };
      return;
    }
    deadline.current = startToastDeadline(ms, Date.now());
    timer.current = setTimeout(() => {
      timer.current = null;
      deadline.current = { remaining: 0, firesAt: null };
      done.current();
    }, ms);
  }
  useEffect(() => {
    arm(duration);
    return clearTimer;
  }, [open, duration, message]);
  function pause() {
    deadline.current = pauseToastDeadline(deadline.current, Date.now());
    clearTimer();
  }
  function resume() {
    if (timer.current === null) arm(resumeToastDelay(deadline.current));
  }
  if (!mounted) return null;
  return (
    <div
      ref={ref}
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      data-tone={tone}
      className="cieo cieo-toast"
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resume();
      }}
      {...motionAttrs({ motion })}
      {...customizePart(slotProps?.root, 'cieo cieo-toast', undefined, className)}
    >
      <p className="cieo-toast-message" {...customizePart(slotProps?.message, 'cieo-toast-message', undefined)}>
        {message}
      </p>
      {children ? (
        <div className="cieo-toast-action" {...customizePart(slotProps?.action, 'cieo-toast-action', undefined)}>
          {children}
        </div>
      ) : null}
      <button
        type="button"
        aria-label={dismissLabel}
        className="cieo-toast-dismiss"
        onClick={() => done.current()}
        {...customizePart(slotProps?.dismiss, 'cieo-toast-dismiss', undefined)}
      >
        ×
      </button>
    </div>
  );
}

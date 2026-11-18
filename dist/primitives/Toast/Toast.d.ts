import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
import type { PrimitivePartProps } from '../parts.js';
export type ToastTone = 'info' | 'success' | 'warning' | 'danger';
/** Pauseable auto-dismiss deadline. Pure math; the component owns the setTimeout. */
export interface ToastDeadline {
    /** ms left when paused; the armed duration when running. */
    remaining: number;
    /** Epoch ms the running timer fires, or null when paused or disabled. */
    firesAt: number | null;
}
/** Starts (or restarts) the deadline for a duration at now. Non-positive durations never fire. */
export declare function startToastDeadline(duration: number, now: number): ToastDeadline;
/** Freezes a running deadline at now; the returned remaining resumes it later. Idles pass through. */
export declare function pauseToastDeadline(state: ToastDeadline, now: number): ToastDeadline;
/** ms to arm when resuming a paused deadline; 0 means no timer. */
export declare function resumeToastDelay(state: ToastDeadline): number;
export interface ToastProps extends MotionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        message?: PrimitivePartProps;
        action?: PrimitivePartProps;
        dismiss?: PrimitivePartProps;
    };
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
export declare function Toast({ className, slotProps, message, tone, open: openProp, defaultOpen, onOpenChange, onDone, duration, dismissLabel, children, motion, entering, exiting, }: ToastProps): import("react/jsx-runtime").JSX.Element | null;

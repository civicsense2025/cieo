import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export type ToastTone = 'info' | 'success' | 'warning' | 'danger';
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
export declare function Toast({ className, slotProps, message, tone, open, onDone, duration, dismissLabel, children, motion, entering, exiting }: ToastProps): import("react/jsx-runtime").JSX.Element | null;

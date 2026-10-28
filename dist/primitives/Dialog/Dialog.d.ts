import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface DialogProps extends MotionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
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
export declare function Dialog({ label, open, onClose, dismissOnOutsidePress, role, children, motion, entering, exiting, className, slotProps }: DialogProps): import("react/jsx-runtime").JSX.Element | null;

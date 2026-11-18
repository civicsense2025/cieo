import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface DialogProps extends MotionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
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
export declare function Dialog({ label, open: openProp, defaultOpen, onOpenChange, onClose: onCloseProp, dismissOnOutsidePress, role, children, motion, entering, exiting, className, slotProps, }: DialogProps): import("react/jsx-runtime").JSX.Element | null;

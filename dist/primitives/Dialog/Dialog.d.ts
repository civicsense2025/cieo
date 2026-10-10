import type { ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface DialogProps extends MotionProps {
    /** Accessible name for the dialog (e.g. "Rename file"). Required. */
    label: string;
    /** Whether the dialog is open. Plays exit before unmounting when closed. */
    open?: boolean;
    /** Called on Escape or host close affordances. Optional. */
    onClose?: () => void;
    children: ReactNode;
}
export declare function Dialog({ label, open, onClose, children, motion, entering, exiting }: DialogProps): import("react/jsx-runtime").JSX.Element | null;

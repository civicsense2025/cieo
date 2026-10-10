import type { ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface BottomSheetProps extends MotionProps {
    /** Accessible name for the sheet (e.g. "Share options"). Required. */
    label: string;
    /** Whether the sheet is open. Plays exit before unmounting when closed. */
    open?: boolean;
    /** Called on Escape or host close affordances. Optional. */
    onClose?: () => void;
    children: ReactNode;
}
export declare function BottomSheet({ label, open, onClose, children, motion, entering, exiting }: BottomSheetProps): import("react/jsx-runtime").JSX.Element | null;

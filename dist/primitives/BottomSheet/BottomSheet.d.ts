import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface BottomSheetProps extends MotionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
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
export declare function BottomSheet({ label, open, onClose, dismissOnOutsidePress, children, motion, entering, exiting, className, slotProps }: BottomSheetProps): import("react/jsx-runtime").JSX.Element | null;

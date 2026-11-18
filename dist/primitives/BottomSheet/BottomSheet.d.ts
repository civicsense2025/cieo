import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
import type { PrimitivePartProps } from '../parts.js';
export interface BottomSheetProps extends MotionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        handle?: PrimitivePartProps;
    };
    /** Accessible name for the sheet (e.g. "Share options"). Required. */
    label: string;
    /** Whether the sheet is open when controlled. Plays exit before unmounting when closed. */
    open?: boolean;
    /** Initial open state when uncontrolled. Defaults to false. */
    defaultOpen?: boolean;
    /** Called with the next open state. */
    onOpenChange?: (open: boolean) => void;
    /** Called on Escape, scrim press, swipe-dismiss, or host close affordances. Optional. */
    onClose?: () => void;
    /** Whether pressing the scrim calls onClose. Defaults to true. */
    dismissOnOutsidePress?: boolean;
    /** Optional sorted/unsorted snap detents in [0..1] viewport ratios (e.g. [0, 0.5, 0.9]). */
    detents?: readonly number[];
    /** Controlled active detent. */
    detent?: number;
    /** Initial active detent when uncontrolled. */
    defaultDetent?: number;
    /** Called when user drags and snaps to a new detent. */
    onDetentChange?: (detent: number) => void;
    /** Enables pointer drag-to-dismiss / detent snapping. Defaults to true. */
    dragToDismiss?: boolean;
    children: ReactNode;
}
export declare function BottomSheet({ label, open: openProp, defaultOpen, onOpenChange, onClose: onCloseProp, dismissOnOutsidePress, detents, detent: detentProp, defaultDetent, onDetentChange, dragToDismiss, children, motion, entering, exiting, className, slotProps, }: BottomSheetProps): import("react/jsx-runtime").JSX.Element | null;

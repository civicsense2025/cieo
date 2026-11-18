import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface AlertDialogProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        content?: PrimitivePartProps;
    };
    /** Accessible name for the alert (e.g. "Delete conversation"). Required. */
    label: string;
    /** Whether the alert is open when controlled. Plays the exit before unmounting when closed. */
    open?: boolean;
    /** Initial open state when uncontrolled. Defaults to false. */
    defaultOpen?: boolean;
    /** Called with the next open state. */
    onOpenChange?: (open: boolean) => void;
    /** Called on Escape or host close affordances. Optional. */
    onClose?: () => void;
    children: ReactNode;
}
export declare function AlertDialog({ label, open: openProp, defaultOpen, onOpenChange, onClose, children, className, slotProps, }: AlertDialogProps): import("react/jsx-runtime").JSX.Element;

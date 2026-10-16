import type { ReactNode } from 'react';
export interface AlertDialogProps {
    /** Accessible name for the alert (e.g. "Delete conversation"). Required. */
    label: string;
    /** Whether the alert is open. Plays the exit before unmounting when closed. */
    open?: boolean;
    /** Called on Escape or host close affordances. Optional. */
    onClose?: () => void;
    children: ReactNode;
}
export declare function AlertDialog({ label, open, onClose, children }: AlertDialogProps): import("react/jsx-runtime").JSX.Element;

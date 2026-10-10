import type { ReactNode } from 'react';
export interface DialogProps {
    /** Accessible name for the dialog (e.g. "Rename file"). Required. */
    label: string;
    /** Whether the dialog is open. Renders null when false or omitted. */
    open?: boolean;
    /** Called on Escape or host close affordances. Optional. */
    onClose?: () => void;
    children: ReactNode;
}
export declare function Dialog({ label, open, onClose, children }: DialogProps): import("react/jsx-runtime").JSX.Element | null;

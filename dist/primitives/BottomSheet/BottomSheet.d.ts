import type { ReactNode } from 'react';
export interface BottomSheetProps {
    /** Accessible name for the sheet (e.g. "Share options"). Required. */
    label: string;
    /** Whether the sheet is open. Renders null when false or omitted. */
    open?: boolean;
    /** Called on Escape or host close affordances. Optional. */
    onClose?: () => void;
    children: ReactNode;
}
export declare function BottomSheet({ label, open, onClose, children }: BottomSheetProps): import("react/jsx-runtime").JSX.Element | null;

import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface MobileNavProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        navigation?: PrimitivePartProps;
        close?: PrimitivePartProps;
    };
    /** Accessible name for the drawer nav. Required. */
    label: string;
    /** Whether the drawer is open. Defaults to false. */
    open?: boolean;
    /** Close handler (e.g. close button, scrim). */
    onClose?: () => void;
    children: ReactNode;
}
export declare function MobileNav({ label, open, onClose, children, className, slotProps }: MobileNavProps): import("react/jsx-runtime").JSX.Element | null;

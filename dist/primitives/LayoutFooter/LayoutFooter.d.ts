import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface LayoutFooterProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the footer landmark. Optional. */
    label?: string;
    children: ReactNode;
}
export declare function LayoutFooter({ className, slotProps, label, children }: LayoutFooterProps): import("react/jsx-runtime").JSX.Element;

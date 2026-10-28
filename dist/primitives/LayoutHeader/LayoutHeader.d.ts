import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface LayoutHeaderProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the header landmark. Optional. */
    label?: string;
    children: ReactNode;
}
export declare function LayoutHeader({ className, slotProps, label, children }: LayoutHeaderProps): import("react/jsx-runtime").JSX.Element;

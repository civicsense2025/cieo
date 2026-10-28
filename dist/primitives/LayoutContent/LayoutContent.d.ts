import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface LayoutContentProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the main landmark. Optional. */
    label?: string;
    children: ReactNode;
}
export declare function LayoutContent({ className, slotProps, label, children }: LayoutContentProps): import("react/jsx-runtime").JSX.Element;

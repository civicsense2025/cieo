import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface TopNavProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        navigation?: PrimitivePartProps;
    };
    /** Accessible name for the primary nav. Defaults to Primary. */
    label?: string;
    children: ReactNode;
}
export declare function TopNav({ label, children, className, slotProps }: TopNavProps): import("react/jsx-runtime").JSX.Element;

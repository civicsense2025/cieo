import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface TopNavMenuProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the group (e.g. "Products"). Required. */
    label: string;
    children: ReactNode;
}
export declare function TopNavMenu({ className, slotProps, label, children }: TopNavMenuProps): import("react/jsx-runtime").JSX.Element;

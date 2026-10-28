import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface SideNavSectionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the group. */
    label?: string;
    children: ReactNode;
}
export declare function SideNavSection({ className, slotProps, label, children }: SideNavSectionProps): import("react/jsx-runtime").JSX.Element;

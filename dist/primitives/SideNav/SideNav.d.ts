import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface SideNavProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the rail. Defaults to Sections. */
    label?: string;
    /** Narrow icon-rail mode. Defaults to false. */
    collapsed?: boolean;
    children: ReactNode;
}
export declare function SideNav({ label, collapsed, children, className, slotProps }: SideNavProps): import("react/jsx-runtime").JSX.Element;
